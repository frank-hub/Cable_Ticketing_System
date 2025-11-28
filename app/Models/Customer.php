<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Ticket;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name',
        'account_number',
        'primary_phone',
        'email_address',
        'physical_address',
        'service_package',
        'status',
        'installation_date',
    ];

    protected $casts = [
        'installation_date' => 'date',
    ];

     public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public static function generateAccountNumber(): string
    {
        $lastCustomer = self::latest('id')->first();
        $number = $lastCustomer ? $lastCustomer->id + 1 : 1;
        return 'ACC-' . str_pad($number, 4, '0', STR_PAD_LEFT);
    }

        // Helper Methods
    public function suspend()
    {
        $this->update(['status' => 'Suspended']);
    }

    public function activate()
    {
        $this->update(['status' => 'Active']);
    }

    public function deactivate()
    {
        $this->update(['status' => 'Inactive']);
    }

}
