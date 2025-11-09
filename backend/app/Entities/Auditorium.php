<?php

namespace App\Entities;

class Auditorium
{
    public function __construct(
        public readonly int $id,
        public readonly int $eventId,
        public readonly string $name,
        public readonly int $capacity,
        public readonly int $currentOccupancy,
    ) {}

    public function hasAvailableCapacity(): bool
    {
        return $this->currentOccupancy < $this->capacity;
    }

    public function getAvailableCapacity(): int
    {
        return max(0, $this->capacity - $this->currentOccupancy);
    }

    public function canAccommodate(int $additionalPeople): bool
    {
        return ($this->currentOccupancy + $additionalPeople) <= $this->capacity;
    }

    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'],
            eventId: $data['event_id'],
            name: $data['name'],
            capacity: $data['capacity'],
            currentOccupancy: $data['current_occupancy'],
        );
    }
}