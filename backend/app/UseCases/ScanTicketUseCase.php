<?php

namespace App\UseCases;

use App\Entities\Ticket;
use App\Interfaces\TicketRepositoryInterface;
use App\Interfaces\SignatureServiceInterface;
use App\Services\ScanResult;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScanTicketUseCase
{
    public function __construct(
        private TicketRepositoryInterface $ticketRepository,
        private SignatureServiceInterface $signatureService,
    ) {}

    public function execute(string $qrString): ScanResult
    {
        try {
            // Decodificar QR
            $decoded = json_decode(base64_decode($qrString), true);
            if (!$decoded || !isset($decoded['payload'], $decoded['signature'])) {
                return ScanResult::invalid('QR malformado');
            }

            $payload = $decoded['payload'];
            $signature = $decoded['signature'];

            // Validar campos del payload
            if (!$this->validatePayload($payload)) {
                return ScanResult::invalid('Payload inválido');
            }

            // Verificar firma HMAC
            if (!$this->signatureService->verify($payload, $signature)) {
                return ScanResult::invalid('Firma inválida');
            }

            // Buscar ticket por nonce (idempotencia)
            $ticket = $this->ticketRepository->findByNonce($payload['nonce']);
            if (!$ticket) {
                return ScanResult::invalid('Ticket no encontrado');
            }

            // Validar que el payload coincida con el ticket
            if ($ticket->id !== $payload['ticketId']) {
                return ScanResult::invalid('Ticket ID no coincide');
            }

            // Validar estado
            if ($ticket->isRevoked()) {
                return ScanResult::revoked();
            }

            if ($ticket->isUsed()) {
                return ScanResult::duplicate();
            }

            if ($ticket->isExpired()) {
                return ScanResult::expired();
            }

            // Check-in con transacción
            DB::transaction(function () use ($ticket) {
                $this->ticketRepository->markAsUsed($ticket->id);
            });

            Log::info('Ticket scanned successfully', [
                'ticket_id' => $ticket->id,
                'nonce' => $ticket->nonce,
            ]);

            return ScanResult::success();

        } catch (\Exception $e) {
            Log::error('Error scanning ticket', [
                'qr_string' => substr($qrString, 0, 50) . '...',
                'error' => $e->getMessage(),
            ]);

            return ScanResult::error('Error interno del sistema');
        }
    }

    private function validatePayload(array $payload): bool
    {
        return isset($payload['eventId'], $payload['ticketId'], $payload['nonce'], $payload['issuedAt']) &&
               is_int($payload['eventId']) &&
               is_int($payload['ticketId']) &&
               is_string($payload['nonce']) &&
               is_string($payload['issuedAt']);
    }
}