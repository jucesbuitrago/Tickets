<?php

namespace App\Interfaces;

use App\Entities\Graduate;

interface GraduateRepositoryInterface
{
    public function findById(int $id): ?Graduate;
    public function findByUserId(int $userId): ?Graduate;
    public function save(Graduate $graduate): Graduate;
    public function incrementUsedSlots(int $graduateId): ?Graduate;
    public function decrementUsedSlots(int $graduateId): ?Graduate;
    public function getAll(): array;
}