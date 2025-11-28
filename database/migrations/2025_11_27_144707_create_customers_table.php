<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('account_number')->unique();
            $table->string('primary_phone');
            $table->string('email_address')->nullable();
            $table->text('physical_address')->nullable();
            $table->enum('service_package', [
                'Basic 20Mbps',
                'Standard 50Mbps',
                'Premium 100Mbps',
                'Business 200Mbps'
            ])->default('Standard 50Mbps');
            $table->enum('status', ['Active', 'Suspended', 'Inactive'])->default('Active');
            $table->date('installation_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
