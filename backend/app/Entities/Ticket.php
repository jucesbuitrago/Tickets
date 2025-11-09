<?php

namespace App\Entities;

use Illuminate\Support\Carbon;

class Ticket
{
    public function __construct(
        public readonly int $id,
        public readonly int $invitationId,
        public readonly array $qrPayload,
        public readonly string $qrSignature,
        public readonly string $nonce,
        public readonly Carbon $issuedAt,
        public readonly ?Carbon $usedAt,
        public readonly ?Carbon $revokedAt,
    ) {}

    public function isUsed(): bool
    {
        return $this->usedAt !== null;
    }

    public function isRevoked(): bool
    {
        return $this->revokedAt !== null;
    }

    public function isExpired(): bool
    {
        return $this->issuedAt->addHours(24)->isPast();
    }

    public function canBeUsed(): bool
    {
        return !$this->isUsed() && !$this->isRevoked() && !$this->isExpired();
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            invitationId: $data['invitation_id'],
            qrPayload: json_decode($data['qr_payload'], true),
            qrSignature: $data['qr_signature'],
            nonce: $data['nonce'],
            issuedAt: Carbon::parse($data['issued_at']),
            usedAt: isset($data['used_at']) ? Carbon::parse($data['used_at']) : null,
            revokedAt: isset($data['revoked_at']) ? Carbon::parse($data['revoked_at']) : null,
        );
    }
}