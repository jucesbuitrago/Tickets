<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class GraduatePolicy
{
    use HandlesAuthorization;

    public function createInvitation(User $user): bool
    {
        return $user->hasRole('GRADUANDO');
    }

    public function viewInvitations(User $user): bool
    {
        return $user->hasRole('GRADUANDO') || $user->hasRole('ADMIN');
    }

    public function import(User $user): bool
    {
        return $user->hasRole('ADMIN');
    }
}