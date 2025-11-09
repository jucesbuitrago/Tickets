<?php

namespace App\Services;

class ScanResult
{
    public function __construct(
        public readonly string $status,
        public readonly ?string $reason = null,
    ) {}

    public static function success(): self
    {
        return new self('OK');
    }

    public static function invalid(string $reason): self
    {
        return new self('INVALID', $reason);
    }

    public static function duplicate(): self
    {
        return new self('DUPLICATE', 'Ticket ya usado');
    }

    public static function revoked(): self
    {
        return new self('REVOKED', 'Ticket revocado');
    }

    public static function expired(): self
    {
        return new self('EXPIRED', 'Ticket expirado');
    }

    public static function error(string $reason): self
    {
        return new self('ERROR', $reason);
    }

    public function isSuccessful(): bool
    {
        return $this->status === 'OK';
    }

    public function toArray(): array
    {
        return [
            'status' => $this->status,
            'reason' => $this->reason,
        ];
    }
}