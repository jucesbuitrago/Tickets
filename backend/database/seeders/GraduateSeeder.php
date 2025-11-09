<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Graduate;
use Illuminate\Support\Facades\Hash;

class GraduateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $graduates = [
            [
                'name' => 'Juan Pérez',
                'email' => 'juan.perez@example.com',
                'cupos_permitidos' => 5,
            ],
            [
                'name' => 'María García',
                'email' => 'maria.garcia@example.com',
                'cupos_permitidos' => 3,
            ],
            [
                'name' => 'Carlos Rodríguez',
                'email' => 'carlos.rodriguez@example.com',
                'cupos_permitidos' => 4,
            ],
            [
                'name' => 'Ana López',
                'email' => 'ana.lopez@example.com',
                'cupos_permitidos' => 2,
            ],
            [
                'name' => 'Pedro Martínez',
                'email' => 'pedro.martinez@example.com',
                'cupos_permitidos' => 6,
            ],
        ];

        foreach ($graduates as $graduateData) {
            $user = User::firstOrCreate([
                'email' => $graduateData['email'],
            ], [
                'name' => $graduateData['name'],
                'password' => Hash::make('password'),
                'role' => 'GRADUANDO',
                'first_login' => true,
            ]);

            Graduate::create([
                'user_id' => $user->id,
                'cupos_permitidos' => $graduateData['cupos_permitidos'],
                'cupos_usados' => 0,
            ]);
        }
    }
}
