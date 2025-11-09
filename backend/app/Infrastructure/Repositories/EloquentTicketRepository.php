<?php

namespace App\Infrastructure\Repositories;

use App\Entities\Ticket;
use App\Interfaces\TicketRepositoryInterface;
use App\Models\TicketModel;
use Illuminate\Support\Str;

class EloquentTicketRepository implements TicketRepositoryInterface
{
    public function __construct(
        private TicketModel $model,
    ) {}

    public function findById(int $id): ?Ticket
    {
        $record = $this->model->find($id);
        return $record ? Ticket::fromArray($record->toArray()) : null;
    }

    public function findByNonce(string $nonce): ?Ticket
    {
        $record = $this->model->where('nonce', $nonce)->first();
        return $record ? Ticket::fromArray($record->toArray()) : null;
    }

    public function save(Ticket $ticket): Ticket
    {
        $data = [
            'invitation_id' => $ticket->invitationId,
            'qr_payload' => json_encode($ticket->qrPayload),
            'qr_signature' => $ticket->qrSignature,
            'nonce' => $ticket->nonce,
            'issued_at' => $ticket->issuedAt,
            'used_at' => $ticket->usedAt,
            'revoked_at' => $ticket->revokedAt,
        ];

        if ($ticket->id) {
            $this->model->where('id', $ticket->id)->update($data);
            return $ticket;
        } else {
            $record = $this->model->create($data);
            return Ticket::fromArray($record->toArray());
        }
    }

    public function markAsUsed(int $ticketId): ?Ticket
    {
        $record = $this->model->find($ticketId);
        if (!$record || $record->used_at) {
            return null;
        }

        $record->update(['used_at' => now()]);
        return Ticket::fromArray($record->toArray());
    }

    public function revoke(int $ticketId): bool
    {
        return $this->model->where('id', $ticketId)->update(['revoked_at' => now()]) > 0;
    }

    public function getByInvitationId(int $invitationId): array
    {
        return $this->model->where('invitation_id', $invitationId)
            ->get()
            ->map(fn($record) => Ticket::fromArray($record->toArray()))
            ->toArray();
    }
}