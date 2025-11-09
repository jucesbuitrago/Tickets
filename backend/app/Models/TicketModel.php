<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketModel extends Model
{
    use HasFactory;

    protected $table = 'tickets';

    protected $fillable = [
        'invitation_id',
        'qr_payload',
        'qr_signature',
        'nonce',
        'issued_at',
        'used_at',
        'revoked_at',
    ];

    protected $casts = [
        'qr_payload' => 'array',
        'issued_at' => 'datetime',
        'used_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    // Relationship can be added when InvitationModel is created
    // public function invitation()
    // {
    //     return $this->belongsTo(InvitationModel::class);
    // }
}