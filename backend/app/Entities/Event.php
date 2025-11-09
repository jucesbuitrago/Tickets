<?php

namespace App\Entities;

use Illuminate\Support\Carbon;

class Event
{
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly Carbon $date,
        public readonly string $status,
    ) {}

    public function isActive(): bool
    {
        return $this->status === 'ACTIVE';
    }

    public function isUpcoming(): bool
    {
        return $this->date->isFuture();
    }

    public function isPast(): bool
    {
        return $this->date->isPast();
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            name: $data['name'],
            date: Carbon::parse($data['date']),
            status: $data['status'],
        );
    }
}