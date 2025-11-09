<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            EventDemoSeeder::class,
            GraduateSeeder::class,
            InvitationSeeder::class,
            // BulkInvitationImport::class, // Descomentar para carga masiva desde CSV
        ]);
    }
}
