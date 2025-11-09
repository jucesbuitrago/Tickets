<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Invitation;
use App\Models\Graduate;
use App\Models\Event;

class InvitationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $graduates = Graduate::all();
        $event = Event::first();

        if ($graduates->isEmpty() || !$event) {
            return;
        }

        foreach ($graduates as $graduate) {
            // Crear algunas invitaciones para cada graduado
            $numInvitations = rand(1, min(3, $graduate->cupos_permitidos));

            for ($i = 0; $i < $numInvitations; $i++) {
                Invitation::create([
                    'graduate_id' => $graduate->id,
                    'event_id' => $event->id,
                    'status' => 'CREATED',
                ]);
            }
        }
    }
}
