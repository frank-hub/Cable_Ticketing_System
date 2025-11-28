<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Customer;
use App\Models\User;
use App\Models\TicketNote;

class Ticket extends Model
{
       use HasFactory, SoftDeletes;

    protected $fillable = [
        'ticket_number',
        'customer_id',
        'customer_name',
        'account_number',
        'phone',
        'email',
        'subject',
        'ticket_type',
        'escalation_level',
        'priority',
        'category',
        'description',
        'assigned_to',
        'assigned_user_id',
        'status',
        'first_response_at',
        'resolved_at',
        'closed_at',
        'response_time_minutes',
        'resolution_time_minutes',
        'resolution_summary',
        'internal_notes',
        'satisfaction_rating'
    ];

    protected $casts = [
        'first_response_at' => 'datetime',
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'satisfaction_rating' => 'integer'
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function notes()
    {
        return $this->hasMany(TicketNote::class);
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'Open');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'In Progress');
    }

    public function scopeResolved($query)
    {
        return $query->where('status', 'Resolved');
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'Closed');
    }

    public function scopeCritical($query)
    {
        return $query->where('priority', 'Critical');
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeAssignedTo($query, $userId)
    {
        return $query->where('assigned_user_id', $userId);
    }

    // Accessors
    public function getIsOverdueAttribute(): bool
    {
        if (in_array($this->status, ['Resolved', 'Closed'])) {
            return false;
        }

        $slaHours = match($this->priority) {
            'Critical' => 2,
            'High' => 8,
            'Medium' => 24,
            'Low' => 48,
            default => 24
        };

        return $this->created_at->addHours($slaHours)->isPast();
    }

    public function getTimeElapsedAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }

    // Methods
    public static function generateTicketNumber(): string
    {
        $lastTicket = self::latest('id')->first();
        $number = $lastTicket ? $lastTicket->id + 1 : 1;
        return 'TK-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

    public function markAsInProgress()
    {
        $this->update([
            'status' => 'In Progress',
            'first_response_at' => $this->first_response_at ?? now(),
            'response_time_minutes' => $this->response_time_minutes ?? $this->created_at->diffInMinutes(now())
        ]);
    }

    public function markAsResolved($summary = null)
    {
        $this->update([
            'status' => 'Resolved',
            'resolved_at' => now(),
            'resolution_time_minutes' => $this->created_at->diffInMinutes(now()),
            'resolution_summary' => $summary
        ]);
    }

    public function markAsClosed()
    {
        $this->update([
            'status' => 'Closed',
            'closed_at' => now()
        ]);
    }

    public function escalate($level)
    {
        $this->update([
            'escalation_level' => $level,
            'priority' => $level === 'Level 3' ? 'Critical' : $this->priority
        ]);
    }

    public function addNote($note, $authorName, $isInternal = false, $userId = null)
    {
        return $this->notes()->create([
            'note' => $note,
            'author_name' => $authorName,
            'is_internal' => $isInternal,
            'user_id' => $userId
        ]);
    }
}
