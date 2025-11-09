<?php

namespace App\Entities;

class Graduate
{
    public function __construct(
        public readonly int $id,
        public readonly int $userId,
        public readonly int $cuposPermitidos,
        public readonly int $cuposUsados,
    ) {}

    public function hasAvailableSlots(): bool
    {
        return $this->cuposUsados < $this->cuposPermitidos;
    }

    public function getRemainingSlots(): int
    {
        return max(0, $this->cuposPermitidos - $this->cuposUsados);
    }

    public function canCreateInvitation(): bool
    {
        return $this->hasAvailableSlots();
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            userId: $data['user_id'],
            cuposPermitidos: $data['cupos_permitidos'],
            cuposUsados: $data['cupos_usados'],
        );
    }
}