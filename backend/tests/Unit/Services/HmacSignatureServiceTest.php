<?php

namespace Tests\Unit\Services;

use App\Services\HmacSignatureService;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class HmacSignatureServiceTest extends TestCase
{
    private HmacSignatureService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->service = new HmacSignatureService();
    }

    public function test_sign_creates_valid_signature()
    {
        $payload = ['user_id' => 1, 'action' => 'login'];

        $signature = $this->service->sign($payload);

        $this->assertIsString($signature);
        $this->assertEquals(64, strlen($signature)); // SHA256 produces 64 character hex string
    }

    public function test_verify_returns_true_for_valid_signature()
    {
        $payload = ['user_id' => 1, 'action' => 'login'];

        $signature = $this->service->sign($payload);
        $result = $this->service->verify($payload, $signature);

        $this->assertTrue($result);
    }

    public function test_verify_returns_false_for_invalid_signature()
    {
        $payload = ['user_id' => 1, 'action' => 'login'];
        $invalidSignature = 'invalid_signature';

        $result = $this->service->verify($payload, $invalidSignature);

        $this->assertFalse($result);
    }

    public function test_verify_returns_false_for_modified_payload()
    {
        $payload = ['user_id' => 1, 'action' => 'login'];
        $signature = $this->service->sign($payload);

        $modifiedPayload = ['user_id' => 2, 'action' => 'login'];
        $result = $this->service->verify($modifiedPayload, $signature);

        $this->assertFalse($result);
    }

    public function test_rotate_key_maintains_verification_with_previous_key()
    {
        $payload = ['user_id' => 1, 'action' => 'login'];
        $oldSignature = $this->service->sign($payload);

        $this->service->rotateKey();

        // Should still verify with old signature due to key transition
        $result = $this->service->verify($payload, $oldSignature);
        $this->assertTrue($result);

        // New signatures should work
        $newSignature = $this->service->sign($payload);
        $newResult = $this->service->verify($payload, $newSignature);
        $this->assertTrue($newResult);
    }

    public function test_get_current_key_generates_key_if_none_exists()
    {
        Cache::flush();

        $key = $this->invokePrivateMethod($this->service, 'getCurrentKey');

        $this->assertIsString($key);
        $this->assertEquals(64, strlen($key)); // 32 bytes * 2 hex chars per byte
    }

    public function test_generate_key_creates_random_key()
    {
        $key1 = $this->invokePrivateMethod($this->service, 'generateKey');
        $key2 = $this->invokePrivateMethod($this->service, 'generateKey');

        $this->assertIsString($key1);
        $this->assertIsString($key2);
        $this->assertEquals(64, strlen($key1));
        $this->assertEquals(64, strlen($key2));
        $this->assertNotEquals($key1, $key2); // Should be random
    }

    public function test_custom_algorithm()
    {
        $service = new HmacSignatureService('sha512');
        $payload = ['test' => 'data'];

        $signature = $service->sign($payload);

        $this->assertIsString($signature);
        $this->assertEquals(128, strlen($signature)); // SHA512 produces 128 character hex string
    }

    private function invokePrivateMethod($object, $method, $args = [])
    {
        $reflection = new \ReflectionClass($object);
        $method = $reflection->getMethod($method);
        $method->setAccessible(true);
        return $method->invokeArgs($object, $args);
    }
}