<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scan extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'scanned_at',
        'device_id',
        'result',
        'is_offline_retry',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'is_offline_retry' => 'boolean',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(TicketModel::class, 'ticket_id');
    }
}