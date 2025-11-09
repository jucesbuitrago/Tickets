<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class EventPolicy
{
    use HandlesAuthorization;

    public function create(User $user): bool
    {
        return $user->hasRole('ADMIN');
    }

    public function update(User $user): bool
    {
        return $user->hasRole('ADMIN');
    }

    public function view(User $user): bool
    {
        return $user->hasRole('ADMIN') || $user->hasRole('STAFF') || $user->hasRole('GRADUANDO');
    }

    public function viewDashboard(User $user): bool
    {
        return $user->hasRole('ADMIN') || $user->hasRole('STAFF');
    }
}