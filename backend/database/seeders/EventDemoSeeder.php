<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Auditorium;

class EventDemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $event = Event::create([
            'name' => 'Ceremonia de Graduación 2025',
            'date' => now()->addDays(30),
            'status' => 'ACTIVE',
        ]);

        Auditorium::create([
            'event_id' => $event->id,
            'name' => 'Auditorio Principal',
            'capacity' => 500,
            'current_occupancy' => 0,
        ]);

        Auditorium::create([
            'event_id' => $event->id,
            'name' => 'Auditorio Secundario',
            'capacity' => 200,
            'current_occupancy' => 0,
        ]);
    }
}
