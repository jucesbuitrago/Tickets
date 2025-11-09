<?php

namespace App\Http\Controllers;

use App\Entities\Event;
use App\Entities\Auditorium;
use App\Interfaces\EventRepositoryInterface;
use App\Interfaces\AuditoriumRepositoryInterface;
use App\Interfaces\TicketRepositoryInterface;
use App\UseCases\ImportGraduatesUseCase;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Collection;
use Illuminate\Support\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\Response;

class AdminController extends Controller
{
    public function __construct(
        private ImportGraduatesUseCase $importGraduatesUseCase,
        private EventRepositoryInterface $eventRepository,
        private AuditoriumRepositoryInterface $auditoriumRepository,
        private TicketRepositoryInterface $ticketRepository,
    ) {}

    /**
     * Import graduates from Excel file
     */
    public function importGraduates(Request $request): JsonResponse
    {
        $this->authorize('importGraduates', 'admin');

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $file = $request->file('file');

            // Import data from Excel
            $data = Excel::toCollection(null, $file)->first();

            if (!$data || $data->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'The Excel file is empty or invalid',
                ], Response::HTTP_BAD_REQUEST);
            }

            // Convert to collection with validation
            $graduatesData = collect();
            $errors = [];

            foreach ($data as $index => $row) {
                if ($index === 0) continue; // Skip header

                try {
                    $rowData = [
                        'user_id' => (int) $row[0], // Assuming column 0 is user_id
                        'cupos_permitidos' => (int) $row[1], // Assuming column 1 is cupos_permitidos
                    ];

                    // Validate row data
                    if (!is_int($rowData['user_id']) || $rowData['user_id'] <= 0) {
                        throw new \Exception('user_id must be a positive integer');
                    }

                    if (!is_int($rowData['cupos_permitidos']) || $rowData['cupos_permitidos'] < 0) {
                        throw new \Exception('cupos_permitidos must be a non-negative integer');
                    }

                    $graduatesData->push($rowData);
                } catch (\Exception $e) {
                    $errors[] = [
                        'row' => $index + 1,
                        'error' => $e->getMessage(),
                        'data' => $row->toArray(),
                    ];
                }
            }

            if ($graduatesData->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid data found in the file',
                    'errors' => $errors,
                ], Response::HTTP_BAD_REQUEST);
            }

            // Execute import
            $result = $this->importGraduatesUseCase->execute($graduatesData);

            return response()->json([
                'success' => true,
                'message' => 'Import completed',
                'data' => [
                    'imported' => $result['imported'],
                    'errors' => array_merge($errors, $result['errors']),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new event
     */
    public function createEvent(Request $request): JsonResponse
    {
        $this->authorize('createEvent', 'admin');

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'date' => 'required|date|after:now',
            'status' => 'sometimes|in:ACTIVE,INACTIVE,CANCELLED',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            $event = new Event(
                id: 0,
                name: $request->name,
                date: Carbon::parse($request->date),
                status: $request->status ?? 'ACTIVE',
            );

            $savedEvent = $this->eventRepository->save($event);

            return response()->json([
                'success' => true,
                'message' => 'Event created successfully',
                'data' => [
                    'id' => $savedEvent->id,
                    'name' => $savedEvent->name,
                    'date' => $savedEvent->date->toISOString(),
                    'status' => $savedEvent->status,
                ],
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create event: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Create a new auditorium
     */
    public function createAuditorium(Request $request): JsonResponse
    {
        $this->authorize('createAuditorium', 'admin');

        $validator = Validator::make($request->all(), [
            'event_id' => 'required|integer|exists:events,id',
            'name' => 'required|string|max:255',
            'capacity' => 'required|integer|min:1|max:10000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        try {
            // Verify event exists and is active
            $event = $this->eventRepository->findById($request->event_id);
            if (!$event || !$event->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Event not found or not active',
                ], Response::HTTP_BAD_REQUEST);
            }

            $auditorium = new Auditorium(
                id: 0,
                eventId: $request->event_id,
                name: $request->name,
                capacity: $request->capacity,
                currentOccupancy: 0,
            );

            $savedAuditorium = $this->auditoriumRepository->save($auditorium);

            return response()->json([
                'success' => true,
                'message' => 'Auditorium created successfully',
                'data' => [
                    'id' => $savedAuditorium->id,
                    'event_id' => $savedAuditorium->eventId,
                    'name' => $savedAuditorium->name,
                    'capacity' => $savedAuditorium->capacity,
                    'current_occupancy' => $savedAuditorium->currentOccupancy,
                ],
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create auditorium: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Revoke a ticket
     */
    public function revokeTicket(int $ticketId): JsonResponse
    {
        $this->authorize('revokeTicket', 'admin');

        try {
            $ticket = $this->ticketRepository->findById($ticketId);
            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket not found',
                ], Response::HTTP_NOT_FOUND);
            }

            if ($ticket->isRevoked()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ticket is already revoked',
                ], Response::HTTP_BAD_REQUEST);
            }

            $success = $this->ticketRepository->revoke($ticketId);

            if (!$success) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to revoke ticket',
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }

            return response()->json([
                'success' => true,
                'message' => 'Ticket revoked successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to revoke ticket: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get dashboard occupancy metrics
     */
    public function getDashboardAforo(): JsonResponse
    {
        $this->authorize('viewDashboard', 'admin');

        try {
            // Get all active events
            $activeEvents = $this->eventRepository->getActiveEvents();

            $metrics = [
                'total_events' => count($activeEvents),
                'total_auditoriums' => 0,
                'total_capacity' => 0,
                'total_occupancy' => 0,
                'occupancy_rate' => 0,
                'events' => [],
            ];

            foreach ($activeEvents as $event) {
                $auditoriums = $this->auditoriumRepository->findByEventId($event->id);

                $eventMetrics = [
                    'id' => $event->id,
                    'name' => $event->name,
                    'date' => $event->date->toISOString(),
                    'auditoriums_count' => count($auditoriums),
                    'total_capacity' => 0,
                    'total_occupancy' => 0,
                    'occupancy_rate' => 0,
                    'auditoriums' => [],
                ];

                foreach ($auditoriums as $auditorium) {
                    $eventMetrics['total_capacity'] += $auditorium->capacity;
                    $eventMetrics['total_occupancy'] += $auditorium->currentOccupancy;

                    $eventMetrics['auditoriums'][] = [
                        'id' => $auditorium->id,
                        'name' => $auditorium->name,
                        'capacity' => $auditorium->capacity,
                        'current_occupancy' => $auditorium->currentOccupancy,
                        'available_capacity' => $auditorium->getAvailableCapacity(),
                        'occupancy_rate' => $auditorium->capacity > 0 ? round(($auditorium->currentOccupancy / $auditorium->capacity) * 100, 2) : 0,
                    ];
                }

                $eventMetrics['occupancy_rate'] = $eventMetrics['total_capacity'] > 0
                    ? round(($eventMetrics['total_occupancy'] / $eventMetrics['total_capacity']) * 100, 2)
                    : 0;

                $metrics['total_auditoriums'] += count($auditoriums);
                $metrics['total_capacity'] += $eventMetrics['total_capacity'];
                $metrics['total_occupancy'] += $eventMetrics['total_occupancy'];
                $metrics['events'][] = $eventMetrics;
            }

            $metrics['occupancy_rate'] = $metrics['total_capacity'] > 0
                ? round(($metrics['total_occupancy'] / $metrics['total_capacity']) * 100, 2)
                : 0;

            return response()->json([
                'success' => true,
                'data' => $metrics,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard metrics: ' . $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}