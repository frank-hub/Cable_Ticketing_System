<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InternetPackages extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'speed',
        'price',
        'type',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'price'     => 'decimal:2',
        'speed'     => 'integer',
    ];

    // ── Scopes ─────────────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeHome($query)
    {
        return $query->where('type', 'Home');
    }

    public function scopeBusiness($query)
    {
        return $query->where('type', 'Business');
    }

    // ── Helpers ────────────────────────────────────────────────────────

    public function getFormattedSpeedAttribute(): string
    {
        return $this->speed >= 1000
            ? ($this->speed / 1000) . ' Gbps'
            : $this->speed . ' Mbps';
    }

    public function getFormattedPriceAttribute(): string
    {
        return 'KES ' . number_format($this->price, 0);
    }
}
