<?php

namespace App\Services;

use App\Interfaces\QrGeneratorInterface;
use App\Interfaces\SignatureServiceInterface;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

class QrCodeGenerator implements QrGeneratorInterface
{
    public function __construct(
        private ?QROptions $options = null,
        private SignatureServiceInterface $signatureService,
    ) {
        if (!$this->options) {
            $this->options = new QROptions([
                'version' => 5,
                'outputType' => QRCode::OUTPUT_IMAGE_PNG,
                'eccLevel' => QRCode::ECC_L,
                'scale' => 10,
                'imageTransparent' => false,
                'imageTransparencyBG' => [255, 255, 255],
            ]);
        }
    }

    public function generate(string $data): string
    {
        $qrCode = new QRCode($this->options);
        return $qrCode->render($data);
    }

    public function generateWithLogo(string $data, string $logoPath = null): string
    {
        $qrCode = new QRCode($this->options);

        if ($logoPath && file_exists($logoPath)) {
            // Para simplificar, por ahora solo retornamos el QR sin logo
            // En una implementación completa, se usaría una librería como intervention/image
            return $qrCode->render($data);
        }

        return $qrCode->render($data);
    }

    public function generateSignedQr(int $eventId, int $ticketId, string $nonce, \DateTime $issuedAt): string
    {
        $payload = [
            'eventId' => $eventId,
            'ticketId' => $ticketId,
            'nonce' => $nonce,
            'issuedAt' => $issuedAt->format('c'), // ISO 8601 format
        ];

        $signature = $this->signatureService->sign($payload);

        $qrData = base64_encode(json_encode([
            'payload' => $payload,
            'signature' => $signature,
        ]));

        return $this->generate($qrData);
    }
}