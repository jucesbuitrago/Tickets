<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Invitation;
use App\Models\Graduate;
use App\Models\Event;
use Illuminate\Support\Facades\Storage;

class BulkInvitationImport extends Seeder
{
    /**
     * Run the database seeds.
     * Script para carga masiva de invitaciones desde un archivo CSV.
     * Formato esperado del CSV: graduate_email,event_name,num_invitations
     */
    public function run(): void
    {
        $csvPath = storage_path('app/bulk_invitations.csv');

        if (!file_exists($csvPath)) {
            $this->command->error('Archivo bulk_invitations.csv no encontrado en storage/app/');
            return;
        }

        $handle = fopen($csvPath, 'r');
        $header = fgetcsv($handle); // Saltar header

        $created = 0;
        $errors = [];

        while (($row = fgetcsv($handle)) !== false) {
            try {
                [$graduateEmail, $eventName, $numInvitations] = $row;

                $graduate = Graduate::whereHas('user', function($query) use ($graduateEmail) {
                    $query->where('email', $graduateEmail);
                })->first();

                $event = Event::where('name', $eventName)->first();

                if (!$graduate) {
                    $errors[] = "Graduado no encontrado: {$graduateEmail}";
                    continue;
                }

                if (!$event) {
                    $errors[] = "Evento no encontrado: {$eventName}";
                    continue;
                }

                $availableSlots = $graduate->cupos_permitidos - $graduate->cupos_usados;
                $numInvitations = min((int)$numInvitations, $availableSlots);

                for ($i = 0; $i < $numInvitations; $i++) {
                    Invitation::create([
                        'graduate_id' => $graduate->id,
                        'event_id' => $event->id,
                        'status' => 'CREATED',
                    ]);
                    $created++;
                }

                // Actualizar cupos usados
                $graduate->increment('cupos_usados', $numInvitations);

            } catch (\Exception $e) {
                $errors[] = "Error procesando fila: " . implode(',', $row) . " - " . $e->getMessage();
            }
        }

        fclose($handle);

        $this->command->info("Invitaciones creadas: {$created}");

        if (!empty($errors)) {
            $this->command->error('Errores encontrados:');
            foreach ($errors as $error) {
                $this->command->error($error);
            }
        }
    }
}