<?php

namespace App\Infrastructure\Repositories;

use App\Entities\Event;
use App\Interfaces\EventRepositoryInterface;
use App\Models\Event as EventModel;

class EloquentEventRepository implements EventRepositoryInterface
{
    public function __construct(
        private EventModel $model,
    ) {}

    public function findById(int $id): ?Event
    {
        $record = $this->model->find($id);
        return $record ? Event::fromArray($record->toArray()) : null;
    }

    public function save(Event $event): Event
    {
        $data = [
            'name' => $event->name,
            'date' => $event->date,
            'status' => $event->status,
        ];

        if ($event->id) {
            $this->model->where('id', $event->id)->update($data);
            return $event;
        } else {
            $record = $this->model->create($data);
            return Event::fromArray($record->toArray());
        }
    }

    public function getActiveEvents(): array
    {
        return $this->model->where('status', 'ACTIVE')
            ->get()
            ->map(fn($record) => Event::fromArray($record->toArray()))
            ->toArray();
    }

    public function getUpcomingEvents(): array
    {
        return $this->model->where('date', '>', now())
            ->where('status', 'ACTIVE')
            ->get()
            ->map(fn($record) => Event::fromArray($record->toArray()))
            ->toArray();
    }

    public function updateStatus(int $eventId, string $status): bool
    {
        return $this->model->where('id', $eventId)->update(['status' => $status]) > 0;
    }
}