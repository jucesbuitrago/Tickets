<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate([
            'email' => 'admin@ut.edu.co',
        ], [
            'name' => 'super_adminitrador',
            'password' => Hash::make('super123***'),
            'role' => 'ADMIN',
            'first_login' => false,
        ]);
    }
}