<?php

namespace Tests\Feature;

use App\Models\Scan;
use App\Models\TicketModel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class ScanControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private User $staffUser;
    private User $graduateUser;
    private string $validQrString;

    protected function setUp(): void
    {
        parent::setUp();

        // Create users with different roles
        $this->adminUser = User::factory()->create(['role' => 'ADMIN']);
        $this->staffUser = User::factory()->create(['role' => 'STAFF']);
        $this->graduateUser = User::factory()->create(['role' => 'GRADUANDO']);

        // Create a valid QR string for testing
        $payload = [
            'eventId' => 1,
            'ticketId' => 1,
            'nonce' => 'test-nonce-123',
            'issuedAt' => '2023-01-01T00:00:00Z'
        ];
        $signature = hash_hmac('sha256', json_encode($payload, JSON_UNESCAPED_SLASHES), 'test-key');
        $this->validQrString = base64_encode(json_encode([
            'payload' => $payload,
            'signature' => $signature
        ]));
    }

    public function test_validate_qr_requires_authentication()
    {
        $response = $this->postJson('/api/scan/validate-qr', [
            'qr_string' => $this->validQrString,
            'device_id' => 'device123'
        ]);

        $response->assertStatus(401);
    }

    public function test_validate_qr_validates_required_fields()
    {
        $token = JWTAuth::fromUser($this->adminUser);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/scan/validate-qr', []);

        $response->assertStatus(400)
                ->assertJson([
                    'status' => 'INVALID',
                    'reason' => 'Datos inválidos'
                ])
                ->assertJsonStructure(['errors']);
    }

    public function test_admin_can_scan_qr()
    {
        $token = JWTAuth::fromUser($this->adminUser);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/scan/validate-qr', [
                            'qr_string' => $this->validQrString,
                            'device_id' => 'device123'
                        ]);

        $response->assertStatus(200)
                ->assertJsonStructure(['status']);
    }

    public function test_staff_can_scan_qr()
    {
        $token = JWTAuth::fromUser($this->staffUser);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/scan/validate-qr', [
                            'qr_string' => $this->validQrString,
                            'device_id' => 'device123'
                        ]);

        $response->assertStatus(200)
                ->assertJsonStructure(['status']);
    }

    public function test_graduate_cannot_scan_qr()
    {
        $token = JWTAuth::fromUser($this->graduateUser);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/scan/validate-qr', [
                            'qr_string' => $this->validQrString,
                            'device_id' => 'device123'
                        ]);

        $response->assertStatus(403)
                ->assertJson([
                    'status' => 'UNAUTHORIZED',
                    'reason' => 'No autorizado para escanear'
                ]);
    }

    public function test_offline_retry_bypasses_authorization()
    {
        $token = JWTAuth::fromUser($this->graduateUser);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/scan/validate-qr', [
                            'qr_string' => $this->validQrString,
                            'device_id' => 'device123',
                            'is_offline_retry' => true
                        ]);

        $response->assertStatus(200)
                ->assertJsonStructure(['status']);
    }

    public function test_scan_is_logged_to_database()
    {
        // Create a ticket in the database
        TicketModel::factory()->create([
            'id' => 1,
            'nonce' => 'test-nonce-123'
        ]);

        $token = JWTAuth::fromUser($this->adminUser);

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
             ->postJson('/api/scan/validate-qr', [
                 'qr_string' => $this->validQrString,
                 'device_id' => 'device123'
             ]);

        $this->assertDatabaseHas('scans', [
            'ticket_id' => 1,
            'device_id' => 'device123',
            'is_offline_retry' => false
        ]);
    }

    public function test_offline_retry_is_logged_correctly()
    {
        TicketModel::factory()->create([
            'id' => 1,
            'nonce' => 'test-nonce-123'
        ]);

        $token = JWTAuth::fromUser($this->adminUser);

        $this->withHeaders(['Authorization' => "Bearer {$token}"])
             ->postJson('/api/scan/validate-qr', [
                 'qr_string' => $this->validQrString,
                 'device_id' => 'device123',
                 'is_offline_retry' => true
             ]);

        $this->assertDatabaseHas('scans', [
            'ticket_id' => 1,
            'device_id' => 'device123',
            'is_offline_retry' => true
        ]);
    }

    public function test_scan_logging_handles_invalid_qr_gracefully()
    {
        $token = JWTAuth::fromUser($this->adminUser);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/scan/validate-qr', [
                            'qr_string' => 'invalid_base64',
                            'device_id' => 'device123'
                        ]);

        $response->assertStatus(200);

        // Should not create scan log for invalid QR
        $this->assertDatabaseMissing('scans', [
            'device_id' => 'device123'
        ]);
    }

    public function test_scan_result_is_returned_correctly()
    {
        $token = JWTAuth::fromUser($this->adminUser);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/scan/validate-qr', [
                            'qr_string' => $this->validQrString,
                            'device_id' => 'device123'
                        ]);

        $response->assertStatus(200)
                ->assertJsonStructure(['status', 'reason']);
    }
}