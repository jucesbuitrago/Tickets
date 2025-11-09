<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\ScanResult;
use App\UseCases\ScanTicketUseCase;
use App\Models\Scan;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScanController extends Controller
{
    public function __construct(
        private ScanTicketUseCase $scanUseCase,
    ) {}

    public function validateQr(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'qr_string' => 'required|string',
            'device_id' => 'required|string|max:255',
            'is_offline_retry' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'INVALID',
                'reason' => 'Datos inválidos',
                'errors' => $validator->errors(),
            ], 400);
        }

        // Rate limiting ya manejado por middleware ScanThrottleMiddleware

        // Verificar autorización STAFF/ADMIN si no es retry offline
        if (!$request->boolean('is_offline_retry') && !$this->isAuthorized($request)) {
            return response()->json([
                'status' => 'UNAUTHORIZED',
                'reason' => 'No autorizado para escanear',
            ], 403);
        }

        $result = $this->scanUseCase->execute($request->qr_string);

        // Registrar escaneo en base de datos
        $this->logScan($request->qr_string, $request->device_id, $result, $request->boolean('is_offline_retry'));

        return response()->json($result->toArray());
    }

    private function isAuthorized(Request $request): bool
    {
        $user = $request->user();
        return $user && in_array($user->role, ['ADMIN', 'STAFF']);
    }

    private function logScan(string $qrString, string $deviceId, ScanResult $result, bool $isOfflineRetry = false): void
    {
        try {
            // Decodificar QR para obtener ticket_id
            $decoded = json_decode(base64_decode($qrString), true);
            $ticketId = $decoded['payload']['ticketId'] ?? null;

            if ($ticketId) {
                DB::transaction(function () use ($ticketId, $deviceId, $result, $isOfflineRetry) {
                    Scan::create([
                        'ticket_id' => $ticketId,
                        'scanned_at' => now(),
                        'device_id' => $deviceId,
                        'result' => $result->status,
                        'is_offline_retry' => $isOfflineRetry,
                    ]);
                });
            }
        } catch (\Exception $e) {
            Log::error('Error logging scan', [
                'qr_string' => substr($qrString, 0, 50) . '...',
                'device_id' => $deviceId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}