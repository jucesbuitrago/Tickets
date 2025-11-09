<?php

namespace App\Infrastructure\Repositories;

use App\Entities\Auditorium;
use App\Interfaces\AuditoriumRepositoryInterface;
use App\Models\Auditorium as AuditoriumModel;

class EloquentAuditoriumRepository implements AuditoriumRepositoryInterface
{
    public function __construct(
        private AuditoriumModel $model,
    ) {}

    public function findById(int $id): ?Auditorium
    {
        $record = $this->model->find($id);
        return $record ? Auditorium::fromArray($record->toArray()) : null;
    }

    public function findByEventId(int $eventId): array
    {
        return $this->model->where('event_id', $eventId)
            ->get()
            ->map(fn($record) => Auditorium::fromArray($record->toArray()))
            ->toArray();
    }

    public function save(Auditorium $auditorium): Auditorium
    {
        $data = [
            'event_id' => $auditorium->eventId,
            'name' => $auditorium->name,
            'capacity' => $auditorium->capacity,
            'current_occupancy' => $auditorium->currentOccupancy,
        ];

        if ($auditorium->id) {
            $this->model->where('id', $auditorium->id)->update($data);
            return $auditorium;
        } else {
            $record = $this->model->create($data);
            return Auditorium::fromArray($record->toArray());
        }
    }

    public function updateOccupancy(int $auditoriumId, int $newOccupancy): bool
    {
        return $this->model->where('id', $auditoriumId)->update(['current_occupancy' => $newOccupancy]) > 0;
    }

    public function incrementOccupancy(int $auditoriumId): bool
    {
        return $this->model->where('id', $auditoriumId)->increment('current_occupancy') > 0;
    }
}