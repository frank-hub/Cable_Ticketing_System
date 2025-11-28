<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TicketNote extends Model
{
     use HasFactory;

    protected $fillable = [
        'ticket_id',
        'user_id',
        'author_name',
        'note',
        'is_internal'
    ];

    protected $casts = [
        'is_internal' => 'boolean'
    ];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
