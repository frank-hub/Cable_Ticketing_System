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
        Schema::create('installations', function (Blueprint $table) {
            $table->id();
            $table->string('installation_number')->unique(); // INS-XXXX

            // Customer Information (matching UI)
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->string('customer_name');
            $table->string('address'); // Installation address
            $table->string('contact_number');

            // Scheduling (matching UI)
            $table->dateTime('scheduled_date'); // Combined date and time

            // Assignment (matching UI)
            $table->string('technician')->default('Unassigned');
            $table->foreignId('assigned_technician_id')->nullable()->constrained('users')->onDelete('set null');

            // Equipment (matching UI)
            $table->text('equipment')->nullable(); // Required Equipment

            // Status (matching UI exactly)
            $table->enum('status', [
                'Pending',
                'Scheduled',
                'In Progress',
                'Completed',
                'Cancelled'
            ])->default('Pending');

            // Notes (matching UI)
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('installation_number');
            $table->index('status');
            $table->index('customer_id');
            $table->index('scheduled_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('installations');
    }
};
