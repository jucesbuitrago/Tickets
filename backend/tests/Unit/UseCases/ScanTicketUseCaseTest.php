<?php

namespace Tests\Unit\UseCases;

use App\Entities\Ticket;
use App\Interfaces\TicketRepositoryInterface;
use App\Interfaces\SignatureServiceInterface;
use App\Services\ScanResult;
use App\UseCases\ScanTicketUseCase;
use Illuminate\Support\Carbon;
use Tests\TestCase;
use Mockery;
use Mockery\MockInterface;
class ScanTicketUseCaseTest extends TestCase
{
    private ScanTicketUseCase $useCase;
    /** @var MockInterface&TicketRepositoryInterface */
    private MockInterface $ticketRepository;
    /** @var MockInterface&SignatureServiceInterface */
    private MockInterface $signatureService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ticketRepository = Mockery::mock(TicketRepositoryInterface::class);
        $this->signatureService = Mockery::mock(SignatureServiceInterface::class);

        $this->useCase = new ScanTicketUseCase(
            $this->ticketRepository,
            $this->signatureService
        );
    }

    public function test_execute_returns_invalid_for_malformed_qr()
    {
        $invalidQr = 'invalid_base64';

        $result = $this->useCase->execute($invalidQr);

        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('INVALID', $result->status);
        $this->assertEquals('QR malformado', $result->reason);
    }

    public function test_execute_returns_invalid_for_missing_payload()
    {
        $qrData = base64_encode(json_encode(['signature' => 'sig']));
        $this->signatureService->shouldReceive('verify')->never();

        $result = $this->useCase->execute($qrData);

        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('INVALID', $result->status);
        $this->assertEquals('QR malformado', $result->reason);
    }

    public function test_execute_returns_invalid_for_invalid_payload()
    {
        $payload = ['invalid' => 'payload'];
        $qrData = base64_encode(json_encode([
            'payload' => $payload,
            'signature' => 'signature'
        ]));

        $this->signatureService->shouldReceive('verify')
            ->with($payload, 'signature')
            ->andReturn(true)
            ->once();

        $result = $this->useCase->execute($qrData);

        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('INVALID', $result->status);
        $this->assertEquals('Payload inválido', $result->reason);
    }

    public function test_execute_returns_invalid_for_invalid_signature()
    {
        $payload = [
            'eventId' => 1,
            'ticketId' => 1,
            'nonce' => 'nonce123',
            'issuedAt' => '2023-01-01T00:00:00Z'
        ];
        $qrData = base64_encode(json_encode([
            'payload' => $payload,
            'signature' => 'invalid_signature'
        ]));

        $this->signatureService->shouldReceive('verify')
            ->with($payload, 'invalid_signature')
            ->andReturn(false)
            ->once();

        $result = $this->useCase->execute($qrData);

        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('INVALID', $result->status);
        $this->assertEquals('Firma inválida', $result->reason);
    }

    public function test_execute_returns_invalid_for_nonexistent_ticket()
    {
        $payload = [
            'eventId' => 1,
            'ticketId' => 1,
            'nonce' => 'nonce123',
            'issuedAt' => '2023-01-01T00:00:00Z'
        ];
        $qrData = base64_encode(json_encode([
            'payload' => $payload,
            'signature' => 'valid_signature'
        ]));

        $this->signatureService->shouldReceive('verify')
            ->with($payload, 'valid_signature')
            ->andReturn(true);

        $this->ticketRepository->shouldReceive('findByNonce')
            ->with('nonce123')
            ->andReturn(null);

        $result = $this->useCase->execute($qrData);

        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('INVALID', $result->status);
        $this->assertEquals('Ticket no encontrado', $result->reason);
    }

    public function test_execute_returns_invalid_for_ticket_id_mismatch()
    {
        $payload = [
            'eventId' => 1,
            'ticketId' => 1,
            'nonce' => 'nonce123',
            'issuedAt' => '2023-01-01T00:00:00Z'
        ];
        $qrData = base64_encode(json_encode([
            'payload' => $payload,
            'signature' => 'valid_signature'
        ]));

        $ticket = new Ticket(
            id: 2, // Different ID
            invitationId: 1,
            qrPayload: $payload,
            qrSignature: 'valid_signature',
            nonce: 'nonce123',
            issuedAt: Carbon::now(),
            usedAt: null,
            revokedAt: null
        );

        $this->signatureService->shouldReceive('verify')
            ->with($payload, 'valid_signature')
            ->andReturn(true)
            ->once();

        $this->ticketRepository->shouldReceive('findByNonce')
            ->with('nonce123')
            ->andReturn($ticket);

        $result = $this->useCase->execute($qrData);

        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('INVALID', $result->status);
        $this->assertEquals('Ticket ID no coincide', $result->reason);
    }

    public function test_execute_returns_revoked_for_revoked_ticket()
    {
        $payload = [
            'eventId' => 1,
            'ticketId' => 1,
            'nonce' => 'nonce123',
            'issuedAt' => '2023-01-01T00:00:00Z'
        ];
        $qrData = base64_encode(json_encode([
            'payload' => $payload,
            'signature' => 'valid_signature'
        ]));

        $ticket = new Ticket(
            id: 1,
            invitationId: 1,
            qrPayload: $payload,
            qrSignature: 'valid_signature',
            nonce: 'nonce123',
            issuedAt: Carbon::now(),
            usedAt: null,
            revokedAt: Carbon::now() // Revoked
        );

        $this->signatureService->shouldReceive('verify')
            ->with($payload, 'valid_signature')
            ->andReturn(true)
            ->once();

        $this->ticketRepository->shouldReceive('findByNonce')
            ->with('nonce123')
            ->andReturn($ticket);

        $result = $this->useCase->execute($qrData);

        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('REVOKED', $result->status);
        $this->assertEquals('Ticket revocado', $result->reason);
    }

    public function test_execute_returns_duplicate_for_used_ticket()
    {
        $payload = [
            'eventId' => 1,
            'ticketId' => 1,
            'nonce' => 'nonce123',
            'issuedAt' => '2023-01-01T00:00:00Z'
        ];
        $qrData = base64_encode(json_encode([
            'payload' => $payload,
            'signature' => 'valid_signature'
        ]));

        $ticket = new Ticket(
            id: 1,
            invitationId: 1,
            qrPayload: $payload,
            qrSignature: 'valid_signature',
            nonce: 'nonce123',
            issuedAt: Carbon::now(),
            usedAt: Carbon::now(), // Used
            revokedAt: null
        );

        $this->signatureService->shouldReceive('verify')
            ->with($payload, 'valid_signature')
            ->andReturn(true)
            ->once();

        $this->ticketRepository->shouldReceive('findByNonce')
            ->with('nonce123')
            ->andReturn($ticket);

        $result = $this->useCase->execute($qrData);

        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('DUPLICATE', $result->status);
        $this->assertEquals('Ticket ya usado', $result->reason);
    }

    public function test_execute_returns_expired_for_expired_ticket()
    {
        $payload = [
            'eventId' => 1,
            'ticketId' => 1,
            'nonce' => 'nonce123',
            'issuedAt' => '2023-01-01T00:00:00Z'
        ];
        $qrData = base64_encode(json_encode([
            'payload' => $payload,
            'signature' => 'valid_signature'
        ]));

        $ticket = new Ticket(
            id: 1,
            invitationId: 1,
            qrPayload: $payload,
            qrSignature: 'valid_signature',
            nonce: 'nonce123',
            issuedAt: Carbon::now()->subDays(2), // Expired
            usedAt: null,
            revokedAt: null
        );

        $this->signatureService->shouldReceive('verify')
            ->with($payload, 'valid_signature')
            ->andReturn(true);

        $this->ticketRepository->shouldReceive('findByNonce')
            ->with('nonce123')
            ->andReturn($ticket);

        $result = $this->useCase->execute($qrData);

        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('EXPIRED', $result->status);
        $this->assertEquals('Ticket expirado', $result->reason);
    }

    public function test_execute_returns_success_for_valid_ticket()
    {
        $payload = [
            'eventId' => 1,
            'ticketId' => 1,
            'nonce' => 'nonce123',
            'issuedAt' => '2023-01-01T00:00:00Z'
        ];
        $qrData = base64_encode(json_encode([
            'payload' => $payload,
            'signature' => 'valid_signature'
        ]));

        $ticket = new Ticket(
            id: 1,
            invitationId: 1,
            qrPayload: $payload,
            qrSignature: 'valid_signature',
            nonce: 'nonce123',
            issuedAt: Carbon::now(),
            usedAt: null,
            revokedAt: null
        );

        $this->signatureService->shouldReceive('verify')
            ->with($payload, 'valid_signature')
            ->andReturn(true);

        $this->ticketRepository->shouldReceive('findByNonce')
            ->with('nonce123')
            ->andReturn($ticket);

        $this->ticketRepository->shouldReceive('markAsUsed')
            ->with(1)
            ->once();

        $result = $this->useCase->execute($qrData);

        $this->assertTrue($result->isSuccessful());
        $this->assertEquals('OK', $result->status);
        $this->assertNull($result->reason);
    }

    public function test_execute_returns_error_on_exception()
    {
        $qrData = 'invalid_json';

        $result = $this->useCase->execute($qrData);

        $this->assertFalse($result->isSuccessful());
        $this->assertEquals('ERROR', $result->status);
        $this->assertEquals('Error interno del sistema', $result->reason);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
}