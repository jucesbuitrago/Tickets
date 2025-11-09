<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ScanController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Rutas públicas para escaneo (sin auth para lectores PWA, pero con rate limiting y autorización STAFF/ADMIN)
Route::middleware('scan')->post('/scan/validate-qr', [ScanController::class, 'validateQr']);

// Rutas protegidas
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Role-based routes
    Route::middleware('role:ADMIN')->group(function () {
        // Admin routes
        Route::post('/admin/import-graduates', [App\Http\Controllers\AdminController::class, 'importGraduates']);
        Route::post('/admin/events', [App\Http\Controllers\AdminController::class, 'createEvent']);
        Route::post('/admin/auditoriums', [App\Http\Controllers\AdminController::class, 'createAuditorium']);
        Route::post('/admin/tickets/{ticketId}/revoke', [App\Http\Controllers\AdminController::class, 'revokeTicket']);
        Route::get('/admin/dashboard/aforo', [App\Http\Controllers\AdminController::class, 'getDashboardAforo']);

        // New admin routes for the module
        Route::get('/admin/auditoriums', [App\Http\Controllers\AdminController::class, 'getAuditoriums']);
        Route::post('/admin/auditoriums/import', [App\Http\Controllers\AdminController::class, 'importAuditoriums']);
        Route::delete('/admin/auditoriums/{id}', [App\Http\Controllers\AdminController::class, 'deleteAuditorium']);

        Route::get('/admin/graduates', [App\Http\Controllers\AdminController::class, 'getGraduates']);
        Route::post('/admin/graduates/import', [App\Http\Controllers\AdminController::class, 'importGraduates']);
        Route::delete('/admin/graduates/{id}', [App\Http\Controllers\AdminController::class, 'deleteGraduate']);
    });

    Route::middleware('role:ADMIN,STAFF')->group(function () {
        // Admin and Staff routes
    });

    Route::middleware('role:GRADUANDO')->group(function () {
        // Graduate routes
        Route::get('/graduate/me', [App\Http\Controllers\GraduateController::class, 'me']);
        Route::get('/graduate/invitations', [App\Http\Controllers\GraduateController::class, 'getInvitations']);
        Route::post('/graduate/invitations', [App\Http\Controllers\GraduateController::class, 'createInvitation']);
        Route::delete('/graduate/invitations/{invitationId}', [App\Http\Controllers\GraduateController::class, 'deleteInvitation']);
        Route::get('/graduate/tickets', [App\Http\Controllers\GraduateController::class, 'getTickets']);
        Route::get('/graduate/tickets/{ticketId}/qr', [App\Http\Controllers\GraduateController::class, 'getTicketQr']);
    });
});
