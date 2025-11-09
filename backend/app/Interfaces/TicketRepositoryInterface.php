<?php

namespace App\Interfaces;

use App\Entities\Ticket;

interface TicketRepositoryInterface
{
    public function findById(int $id): ?Ticket;
    public function findByNonce(string $nonce): ?Ticket;
    public function save(Ticket $ticket): Ticket;
    public function markAsUsed(int $ticketId): ?Ticket;
    public function revoke(int $ticketId): bool;
    public function getByInvitationId(int $invitationId): array;
}