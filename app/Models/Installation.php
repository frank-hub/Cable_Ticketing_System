<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Installation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'installation_number',
        'customer_id',
        'customer_name',
        'address',
        'contact_number',
        'scheduled_date',
        'technician',
        'assigned_technician_id',
        'equipment',
        'status',
        'notes'
    ];

    protected $casts = [
        'scheduled_date' => 'datetime'
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignedTechnician()
    {
        return $this->belongsTo(User::class, 'assigned_technician_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'Scheduled');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'In Progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'Completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'Cancelled');
    }

    // Methods
    public static function generateInstallationNumber(): string
    {

         $last = self::withTrashed()
            ->where('installation_number', 'like', 'INS-%')
            ->orderByDesc('id')
            ->value('installation_number');

        if (!$last) {
            return 'INS-0001';
        }

        $lastNumber = (int) str_replace('INS-', '', $last);
        return 'INS-' . str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
    }
}
