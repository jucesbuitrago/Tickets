<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_with_temp_password()
    {
        Mail::fake();

        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com'
        ];

        $response = $this->postJson('/api/register', $userData);

        $response->assertStatus(201)
                ->assertJson(['message' => 'User registered successfully. Check your email for temporary password.']);

        $this->assertDatabaseHas('users', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'first_login' => true,
            'role' => 'GRADUANDO'
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user->password_temp_expire_at);

        Mail::assertSent(function ($mail) use ($user) {
            return $mail->hasTo($user->email) &&
                   $mail->subject === 'Your Temporary Password';
        });
    }

    public function test_register_validates_required_fields()
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'email']);
    }

    public function test_register_validates_unique_email()
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'existing@example.com'
        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    public function test_login_with_valid_credentials_returns_token()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
            'first_login' => false
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'token',
                    'user',
                    'requires_password_change'
                ])
                ->assertJson([
                    'requires_password_change' => false
                ]);
    }

    public function test_login_with_first_login_returns_password_change_flag()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
            'first_login' => true
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123'
        ]);

        $response->assertStatus(200)
                ->assertJson([
                    'requires_password_change' => true,
                    'message' => 'First login detected. Please change your password.'
                ]);
    }

    public function test_login_with_invalid_credentials_returns_unauthorized()
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123')
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrongpassword'
        ]);

        $response->assertStatus(401)
                ->assertJson(['error' => 'Unauthorized']);
    }

    public function test_login_validates_required_fields()
    {
        $response = $this->postJson('/api/login', []);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_change_password_updates_password_and_clears_flags()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword'),
            'first_login' => true,
            'password_temp_expire_at' => now()
        ]);

        $token = JWTAuth::fromUser($user);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/change-password', [
                            'current_password' => 'oldpassword',
                            'password' => 'newpassword123',
                            'password_confirmation' => 'newpassword123'
                        ]);

        $response->assertStatus(200)
                ->assertJson(['message' => 'Password changed successfully']);

        $user->refresh();
        $this->assertFalse($user->first_login);
        $this->assertNull($user->password_temp_expire_at);
        $this->assertTrue(Hash::check('newpassword123', $user->password));
    }

    public function test_change_password_validates_current_password()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword')
        ]);

        $token = JWTAuth::fromUser($user);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/change-password', [
                            'current_password' => 'wrongpassword',
                            'password' => 'newpassword123',
                            'password_confirmation' => 'newpassword123'
                        ]);

        $response->assertStatus(400)
                ->assertJson(['error' => 'Current password is incorrect']);
    }

    public function test_change_password_validates_confirmation()
    {
        $user = User::factory()->create([
            'password' => Hash::make('oldpassword')
        ]);

        $token = JWTAuth::fromUser($user);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/change-password', [
                            'current_password' => 'oldpassword',
                            'password' => 'newpassword123',
                            'password_confirmation' => 'differentpassword'
                        ]);

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['password']);
    }

    public function test_logout_invalidates_token()
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/logout');

        $response->assertStatus(200)
                ->assertJson(['message' => 'Successfully logged out']);

        // Verify token is invalidated
        $this->assertFalse(JWTAuth::check());
    }

    public function test_refresh_token_returns_new_token()
    {
        $user = User::factory()->create();
        $token = JWTAuth::fromUser($user);

        $response = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                        ->postJson('/api/refresh');

        $response->assertStatus(200)
                ->assertJsonStructure([
                    'token',
                    'user'
                ]);
    }
}