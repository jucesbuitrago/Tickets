<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        dd($request->all());

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
        ]);

        $tempPassword = Str::random(10);
        $expireAt = Carbon::now()->addHours(24);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($tempPassword),
            'role' => 'GRADUANDO',
            'first_login' => true,
            'password_temp_expire_at' => $expireAt,
        ]);

        $user->assignRole('GRADUANDO');

        // Send email with temporary password
        Mail::raw("Your temporary password is: {$tempPassword}. It expires in 24 hours.", function ($message) use ($user) {
            $message->to($user->email)->subject('Your Temporary Password');
        });

        return response()->json(['message' => 'User registered successfully. Check your email for temporary password.'], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user = Auth::user();

        if ($user->first_login) {
            return response()->json([
                'message' => 'First login detected. Please change your password.',
                'token' => $token,
                'user' => $user,
                'requires_password_change' => true
            ]);
        }

        return response()->json([
            'token' => $token,
            'user' => $user,
            'requires_password_change' => false
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Current password is incorrect'], 400);
        }

        User::where('id', $user->id)->update([
            'password' => Hash::make($request->password),
            'first_login' => false,
            'password_temp_expire_at' => null,
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function refresh()
    {
        return response()->json([
            'token' => JWTAuth::refresh(),
            'user' => Auth::user()
        ]);
    }
}
