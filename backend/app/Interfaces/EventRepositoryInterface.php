<?php

namespace App\Interfaces;

use App\Entities\Event;

interface EventRepositoryInterface
{
    public function findById(int $id): ?Event;
    public function save(Event $event): Event;
    public function getActiveEvents(): array;
    public function getUpcomingEvents(): array;
    public function updateStatus(int $eventId, string $status): bool;
}