<?php

namespace App\Http\Controllers;

use App\Entities\Graduate;
use App\Entities\Invitation;
use App\Entities\Ticket;
use App\Interfaces\GraduateRepositoryInterface;
use App\Interfaces\InvitationRepositoryInterface;
use App\Interfaces\TicketRepositoryInterface;
use App\Interfaces\EventRepositoryInterface;
use App\Interfaces\QrGeneratorInterface;
use App\UseCases\CreateInvitationUseCase;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class GraduateController extends Controller
{
    public function __construct(
        private GraduateRepositoryInterface $graduateRepository,
        private InvitationRepositoryInterface $invitationRepository,
        private TicketRepositoryInterface $ticketRepository,
        private EventRepositoryInterface $eventRepository,
        private QrGeneratorInterface $qrGenerator,
        private CreateInvitationUseCase $createInvitationUseCase,
    ) {}

    /**
     * Get current graduate data
     */
    public function me(): JsonResponse
    {
        $user = Auth::user();
        $graduate = $this->graduateRepository->findByUserId($user->id);

        if (!$graduate) {
            return response()->json([
                'success' => false,
                'message' => 'Graduate not found',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $graduate->id,
                'user_id' => $graduate->userId,
                'cupos_permitidos' => $graduate->cuposPermitidos,
                'cupos_usados' => $graduate->cuposUsados,
                'cupos_disponibles' => $graduate->getRemainingSlots(),
            ],
        ]);
    }

    /**
     * Get graduate invitations
     */
    public function getInvitations(): JsonResponse
    {
        $user = Auth::user();
        $graduate = $this->graduateRepository->findByUserId($user->id);

        if (!$graduate) {
            return response()->json([
                'success' => false,
                'message' => 'Graduate not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $invitations = $this->invitationRepository->findByGraduateId($graduate->id);

        $data = array_map(function ($invitation) {
            return [
                'id' => $invitation->id,
                'event_id' => $invitation->eventId,
                'status' => $invitation->status,
                'created_at' => $invitation->createdAt->toISOString(),
            ];
        }, $invitations);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Create invitation with slot validation
     */
    public function createInvitation(Request $request): JsonResponse
    {
        $this->authorize('createInvitation', 'graduate');

        $validator = Validator::make($request->all(), [
            'event_id' => 'required|integer|exists:events,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $user = Auth::user();
        $graduate = $this->graduateRepository->findByUserId($user->id);

        if (!$graduate) {
            return response()->json([
                'success' => false,
                'message' => 'Graduate not found',
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            $invitation = $this->createInvitationUseCase->execute($graduate->id, $request->event_id);

            return response()->json([
                'success' => true,
                'message' => 'Invitation created successfully',
                'data' => [
                    'id' => $invitation->id,
                    'event_id' => $invitation->eventId,
                    'status' => $invitation->status,
                    'created_at' => $invitation->createdAt->toISOString(),
                ],
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * Delete invitation
     */
    public function deleteInvitation(int $invitationId): JsonResponse
    {
        $user = Auth::user();
        $graduate = $this->graduateRepository->findByUserId($user->id);

        if (!$graduate) {
            return response()->json([
                'success' => false,
                'message' => 'Graduate not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $invitation = $this->invitationRepository->findById($invitationId);

        if (!$invitation || $invitation->graduateId !== $graduate->id) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation not found',
            ], Response::HTTP_NOT_FOUND);
        }

        if (!$invitation->isCreated()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete invitation with status: ' . $invitation->status,
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Update status to REVOKED
            $success = $this->invitationRepository->updateStatus($invitationId, 'REVOKED');

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete invitation',
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            // Decrement used slots
            $this->graduateRepository->decrementUsedSlots($graduate->id);

            return response()->json([
                'success' => true,
                'message' => 'Invitation deleted successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete invitation: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get graduate tickets
     */
    public function getTickets(): JsonResponse
    {
        $user = Auth::user();
        $graduate = $this->graduateRepository->findByUserId($user->id);

        if (!$graduate) {
            return response()->json([
                'success' => false,
                'message' => 'Graduate not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $invitations = $this->invitationRepository->findByGraduateId($graduate->id);
        $tickets = [];

        foreach ($invitations as $invitation) {
            $invitationTickets = $this->ticketRepository->getByInvitationId($invitation->id);
            foreach ($invitationTickets as $ticket) {
                $tickets[] = [
                    'id' => $ticket->id,
                    'invitation_id' => $ticket->invitationId,
                    'status' => $ticket->status,
                    'created_at' => $ticket->createdAt->toISOString(),
                    'updated_at' => $ticket->updatedAt->toISOString(),
                    'invitation' => [
                        'id' => $invitation->id,
                        'event_id' => $invitation->eventId,
                        'status' => $invitation->status,
                        'event' => [
                            'id' => $invitation->eventId,
                            'name' => $this->eventRepository->findById($invitation->eventId)?->name ?? 'Evento',
                            'date' => $this->eventRepository->findById($invitation->eventId)?->date->toISOString() ?? null,
                        ],
                    ],
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $tickets,
        ]);
    }

    /**
     * Get QR code for ticket
     */
    public function getTicketQr(int $ticketId): JsonResponse
    {
        $user = Auth::user();
        $graduate = $this->graduateRepository->findByUserId($user->id);

        if (!$graduate) {
            return response()->json([
                'success' => false,
                'message' => 'Graduate not found',
            ], Response::HTTP_NOT_FOUND);
        }

        $ticket = $this->ticketRepository->findById($ticketId);

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found',
            ], Response::HTTP_NOT_FOUND);
        }

        // Check if ticket belongs to graduate's invitation
        $invitation = $this->invitationRepository->findById($ticket->invitationId);
        if (!$invitation || $invitation->graduateId !== $graduate->id) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found',
            ], Response::HTTP_NOT_FOUND);
        }

        try {
            // Generate QR from payload
            $qrData = base64_encode(json_encode([
                'payload' => $ticket->qrPayload,
                'signature' => $ticket->qrSignature,
            ]));

            $qrImage = $this->qrGenerator->generate($qrData);

            return response()->json([
                'success' => true,
                'data' => [
                    'qr_code' => $qrImage, // Base64 encoded PNG
                    'format' => 'png',
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}