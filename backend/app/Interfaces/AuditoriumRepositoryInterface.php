<?php

namespace App\Interfaces;

use App\Entities\Auditorium;

interface AuditoriumRepositoryInterface
{
    public function findById(int $id): ?Auditorium;
    public function findByEventId(int $eventId): array;
    public function save(Auditorium $auditorium): Auditorium;
    public function updateOccupancy(int $auditoriumId, int $newOccupancy): bool;
    public function incrementOccupancy(int $auditoriumId): bool;
}