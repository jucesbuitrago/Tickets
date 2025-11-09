<?php

namespace App\Interfaces;

interface SignatureServiceInterface
{
    public function sign(array $payload): string;
    public function verify(array $payload, string $signature): bool;
    public function rotateKey(): void;
}