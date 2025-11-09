<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Auditorium extends Model
{
    use HasFactory;

    protected $table = 'auditoriums';

    protected $fillable = [
        'event_id',
        'name',
        'capacity',
        'current_occupancy',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
