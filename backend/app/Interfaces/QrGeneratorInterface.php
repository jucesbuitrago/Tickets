<?php

namespace App\Interfaces;

interface QrGeneratorInterface
{
    public function generate(string $data): string;
    public function generateWithLogo(string $data, string $logoPath = null): string;
}