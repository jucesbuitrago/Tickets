<?php

namespace App\Interfaces;

interface MailServiceInterface
{
    public function sendInvitationEmail(string $to, array $invitationData): bool;
    public function sendTicketEmail(string $to, array $ticketData): bool;
}