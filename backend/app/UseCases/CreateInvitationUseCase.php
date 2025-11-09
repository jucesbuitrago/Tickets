<?php

namespace App\UseCases;

use App\Entities\Graduate;
use App\Entities\Event;
use App\Entities\Invitation;
use App\Entities\Ticket;
use App\Interfaces\GraduateRepositoryInterface;
use App\Interfaces\InvitationRepositoryInterface;
use App\Interfaces\EventRepositoryInterface;
use App\Interfaces\TicketRepositoryInterface;
use App\Interfaces\SignatureServiceInterface;
use App\Interfaces\QrGeneratorInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateInvitationUseCase
{
    public function __construct(
        private GraduateRepositoryInterface $graduateRepository,
        private InvitationRepositoryInterface $invitationRepository,
        private EventRepositoryInterface $eventRepository,
        private TicketRepositoryInterface $ticketRepository,
        private SignatureServiceInterface $signatureService,
        private QrGeneratorInterface $qrGenerator,
    ) {}

    public function execute(int $graduateId, int $eventId): Invitation
    {
        return DB::transaction(function () use ($graduateId, $eventId) {
            // Verificar graduando
            $graduate = $this->graduateRepository->findById($graduateId);
            if (!$graduate) {
                throw new \Exception('Graduando no encontrado');
            }

            if (!$graduate->canCreateInvitation()) {
                throw new \Exception('El graduando no tiene cupos disponibles');
            }

            // Verificar evento
            $event = $this->eventRepository->findById($eventId);
            if (!$event) {
                throw new \Exception('Evento no encontrado');
            }

            if (!$event->isActive()) {
                throw new \Exception('El evento no está activo');
            }

            // Crear invitación
            $invitation = new Invitation(
                id: 0, // Se asignará en el repositorio
                graduateId: $graduateId,
                eventId: $eventId,
                status: 'CREATED',
                createdAt: now(),
            );

            $savedInvitation = $this->invitationRepository->save($invitation);

            // Crear ticket con QR
            $payload = [
                'invitation_id' => $savedInvitation->id,
                'event_id' => $eventId,
                'nonce' => Str::uuid()->toString(),
                'issued_at' => now()->toISOString(),
            ];

            $signature = $this->signatureService->sign($payload);
            $qrPayload = base64_encode(json_encode([
                'payload' => $payload,
                'signature' => $signature,
            ]));

            $ticket = new Ticket(
                id: 0,
                invitationId: $savedInvitation->id,
                qrPayload: $payload,
                qrSignature: $signature,
                nonce: $payload['nonce'],
                issuedAt: now(),
                usedAt: null,
                revokedAt: null,
            );

            $this->ticketRepository->save($ticket);

            // Actualizar cupos del graduando
            $this->graduateRepository->incrementUsedSlots($graduateId);

            return $savedInvitation;
        });
    }
}