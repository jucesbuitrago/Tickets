<?php

namespace App\Interfaces;

use App\Entities\Invitation;

interface InvitationRepositoryInterface
{
    public function findById(int $id): ?Invitation;
    public function save(Invitation $invitation): Invitation;
    public function findByGraduateId(int $graduateId): array;
    public function findByEventId(int $eventId): array;
    public function updateStatus(int $invitationId, string $status): bool;
}