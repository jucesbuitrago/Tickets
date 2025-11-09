<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'graduate_id',
        'event_id',
        'status',
    ];

    public function graduate()
    {
        return $this->belongsTo(Graduate::class);
    }

    public function event()
    {
        return $this->belongsTo(Event::class);
    }
}
