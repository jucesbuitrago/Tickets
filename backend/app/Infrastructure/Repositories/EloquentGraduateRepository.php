<?php

namespace App\Infrastructure\Repositories;

use App\Entities\Graduate;
use App\Interfaces\GraduateRepositoryInterface;
use App\Models\Graduate as GraduateModel;

class EloquentGraduateRepository implements GraduateRepositoryInterface
{
    public function __construct(
        private GraduateModel $model,
    ) {}

    public function findById(int $id): ?Graduate
    {
        $record = $this->model->find($id);
        return $record ? Graduate::fromArray($record->toArray()) : null;
    }

    public function findByUserId(int $userId): ?Graduate
    {
        $record = $this->model->where('user_id', $userId)->first();
        return $record ? Graduate::fromArray($record->toArray()) : null;
    }

    public function save(Graduate $graduate): Graduate
    {
        $data = [
            'user_id' => $graduate->userId,
            'cupos_permitidos' => $graduate->cuposPermitidos,
            'cupos_usados' => $graduate->cuposUsados,
        ];

        if ($graduate->id) {
            $this->model->where('id', $graduate->id)->update($data);
            return $graduate;
        } else {
            $record = $this->model->create($data);
            return Graduate::fromArray($record->toArray());
        }
    }

    public function incrementUsedSlots(int $graduateId): ?Graduate
    {
        $record = $this->model->find($graduateId);
        if (!$record) {
            return null;
        }

        $record->increment('cupos_usados');
        return Graduate::fromArray($record->toArray());
    }

    public function decrementUsedSlots(int $graduateId): ?Graduate
    {
        $record = $this->model->find($graduateId);
        if (!$record) {
            return null;
        }

        if ($record->cupos_usados > 0) {
            $record->decrement('cupos_usados');
        }
        return Graduate::fromArray($record->toArray());
    }

    public function getAll(): array
    {
        return $this->model->all()
            ->map(fn($record) => Graduate::fromArray($record->toArray()))
            ->toArray();
    }
}