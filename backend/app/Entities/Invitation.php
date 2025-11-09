<?php

namespace App\Entities;

use Illuminate\Support\Carbon;

class Invitation
{
    public function __construct(
        public readonly int $id,
        public readonly int $graduateId,
        public readonly int $eventId,
        public readonly string $status,
        public readonly Carbon $createdAt,
    ) {}

    public function isCreated(): bool
    {
        return $this->status === 'CREATED';
    }

    public function isSent(): bool
    {
        return $this->status === 'SENT';
    }

    public function isRevoked(): bool
    {
        return $this->status === 'REVOKED';
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            graduateId: $data['graduate_id'],
            eventId: $data['event_id'],
            status: $data['status'],
            createdAt: Carbon::parse($data['created_at']),
        );
    }
}