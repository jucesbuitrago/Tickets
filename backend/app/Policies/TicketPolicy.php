<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TicketPolicy
{
    use HandlesAuthorization;

    public function scan(User $user): bool
    {
        return $user->hasRole('STAFF') || $user->hasRole('ADMIN');
    }

    public function revoke(User $user): bool
    {
        return $user->hasRole('ADMIN');
    }

    public function view(User $user): bool
    {
        return $user->hasRole('ADMIN') || $user->hasRole('STAFF');
    }
}