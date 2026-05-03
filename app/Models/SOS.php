<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SOS extends Model
{
    protected $fillable = [
        'type',
        'message',
        'triggered_by',
        'resolved_by',
        'notified_count',
        'status',
        'resolved_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'created_at'  => 'datetime',
    ];

    public function triggeredBy()
    {
        return $this->belongsTo(User::class, 'triggered_by');
    }

    public function resolvedBy()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function getTypeLabel(): string
    {
        return match($this->type) {
            'network_outage'  => 'Network Outage',
            'urgent_backup'   => 'Urgent Backup Needed',
            'safety_incident' => 'Safety Incident',
            'emergency_sms'   => 'Emergency SMS',
            default           => ucfirst($this->type),
        };
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }
}
