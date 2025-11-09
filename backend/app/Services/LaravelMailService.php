<?php

namespace App\Services;

use App\Interfaces\MailServiceInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class LaravelMailService implements MailServiceInterface
{
    public function sendInvitationEmail(string $to, array $invitationData): bool
    {
        try {
            Mail::send('emails.invitation', $invitationData, function ($message) use ($to, $invitationData) {
                $message->to($to)
                        ->subject('Invitación a Evento de Graduación - ' . $invitationData['event_name']);
            });
            return true;
        } catch (\Exception $e) {
            Log::error('Error sending invitation email', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function sendTicketEmail(string $to, array $ticketData): bool
    {
        try {
            Mail::send('emails.ticket', $ticketData, function ($message) use ($to, $ticketData) {
                $message->to($to)
                        ->subject('Tu Ticket para el Evento - ' . $ticketData['event_name']);
            });
            return true;
        } catch (\Exception $e) {
            Log::error('Error sending ticket email', [
                'to' => $to,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}