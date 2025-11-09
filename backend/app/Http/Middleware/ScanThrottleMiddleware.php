<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class ScanThrottleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $deviceId = $request->input('device_id');

        if (!$deviceId) {
            return response()->json([
                'status' => 'INVALID',
                'reason' => 'Device ID requerido',
            ], 400);
        }

        $rateLimitKey = 'scan:' . $deviceId;

        // Rate limiting: máximo 10 escaneos por minuto por dispositivo
        if (RateLimiter::tooManyAttempts($rateLimitKey, 10)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);

            return response()->json([
                'status' => 'RATE_LIMITED',
                'reason' => 'Demasiados escaneos desde este dispositivo. Intente en ' . $seconds . ' segundos.',
            ], 429);
        }

        RateLimiter::hit($rateLimitKey, 60); // 60 segundos

        return $next($request);
    }
}