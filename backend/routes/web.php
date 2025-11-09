<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/login', function () {
    return redirect('/'); // Redirect to frontend login
})->name('login');

// API routes (temporary for debugging)
Route::post('/api/register', [App\Http\Controllers\AuthController::class, 'register'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
Route::post('/api/login', [App\Http\Controllers\AuthController::class, 'login'])->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'Test route works']);
});
