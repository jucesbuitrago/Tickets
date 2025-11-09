<?php

namespace App\Infrastructure\Repositories;

use App\Entities\Invitation;
use App\Interfaces\InvitationRepositoryInterface;
use App\Models\Invitation as InvitationModel;

class EloquentInvitationRepository implements InvitationRepositoryInterface
{
    public function __construct(
        private InvitationModel $model,
    ) {}

    public function findById(int $id): ?Invitation
    {
        $record = $this->model->find($id);
        return $record ? Invitation::fromArray($record->toArray()) : null;
    }

    public function save(Invitation $invitation): Invitation
    {
        $data = [
            'graduate_id' => $invitation->graduateId,
            'event_id' => $invitation->eventId,
            'status' => $invitation->status,
            'created_at' => $invitation->createdAt,
        ];

        if ($invitation->id) {
            $this->model->where('id', $invitation->id)->update($data);
            return $invitation;
        } else {
            $record = $this->model->create($data);
            return Invitation::fromArray($record->toArray());
        }
    }

    public function findByGraduateId(int $graduateId): array
    {
        return $this->model->where('graduate_id', $graduateId)
            ->get()
            ->map(fn($record) => Invitation::fromArray($record->toArray()))
            ->toArray();
    }

    public function findByEventId(int $eventId): array
    {
        return $this->model->where('event_id', $eventId)
            ->get()
            ->map(fn($record) => Invitation::fromArray($record->toArray()))
            ->toArray();
    }

    public function updateStatus(int $invitationId, string $status): bool
    {
        return $this->model->where('id', $invitationId)->update(['status' => $status]) > 0;
    }
}