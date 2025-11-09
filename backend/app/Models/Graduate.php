<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Graduate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'cupos_permitidos',
        'cupos_usados',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
