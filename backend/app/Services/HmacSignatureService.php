<?php

namespace App\Services;

use App\Interfaces\SignatureServiceInterface;
use Illuminate\Support\Facades\Cache;

class HmacSignatureService implements SignatureServiceInterface
{
    private const KEY_PREFIX = 'hmac_key_';
    private const CURRENT_KEY_ID = 'current_key_id';

    public function __construct(
        private string $algorithm = 'sha256',
        private int $keyRotationHours = 24,
    ) {}

    public function sign(array $payload): string
    {
        $key = $this->getCurrentKey();
        $data = json_encode($payload, JSON_UNESCAPED_SLASHES);
        return hash_hmac($this->algorithm, $data, $key);
    }

    public function verify(array $payload, string $signature): bool
    {
        $key = $this->getCurrentKey();
        $data = json_encode($payload, JSON_UNESCAPED_SLASHES);
        $expected = hash_hmac($this->algorithm, $data, $key);

        // Verificar con clave actual
        if (hash_equals($expected, $signature)) {
            return true;
        }

        // Verificar con clave anterior (para transición)
        $previousKey = $this->getPreviousKey();
        if ($previousKey) {
            $expectedPrevious = hash_hmac($this->algorithm, $data, $previousKey);
            return hash_equals($expectedPrevious, $signature);
        }

        return false;
    }

    public function rotateKey(): void
    {
        $newKeyId = uniqid();
        $newKey = $this->generateKey();

        // Guardar clave anterior
        $currentKeyId = Cache::get(self::CURRENT_KEY_ID);
        if ($currentKeyId) {
            Cache::put(self::KEY_PREFIX . 'previous', Cache::get(self::KEY_PREFIX . $currentKeyId), now()->addHours($this->keyRotationHours * 2));
        }

        // Establecer nueva clave
        Cache::put(self::KEY_PREFIX . $newKeyId, $newKey, now()->addHours($this->keyRotationHours));
        Cache::put(self::CURRENT_KEY_ID, $newKeyId, now()->addHours($this->keyRotationHours));
    }

    private function getCurrentKey(): string
    {
        $keyId = Cache::get(self::CURRENT_KEY_ID);
        if (!$keyId) {
            $this->rotateKey();
            $keyId = Cache::get(self::CURRENT_KEY_ID);
        }

        return Cache::get(self::KEY_PREFIX . $keyId, $this->generateKey());
    }

    private function getPreviousKey(): ?string
    {
        return Cache::get(self::KEY_PREFIX . 'previous');
    }

    private function generateKey(): string
    {
        return bin2hex(random_bytes(32)); // 256-bit key
    }
}