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
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique(); // TK-XXXX

            // Customer Information
            $table->foreignId('customer_id')->nullable()->constrained()->onDelete('set null');
            $table->string('customer_name');
            $table->string('account_number');
            $table->string('phone');
            $table->string('email')->nullable();

            // Ticket Details
            $table->string('subject');
            $table->enum('ticket_type', [
                'Technical Issue',
                'Support Request',
                'Service Request',
                'Escalation',
                'General Inquiry'
            ]);

            $table->enum('escalation_level', [
                'Level 1',
                'Level 2',
                'Level 3'
            ])->default('Level 1');

            $table->enum('priority', [
                'Low',
                'Medium',
                'High',
                'Critical'
            ])->default('Medium');

            $table->enum('category', [
                'Connectivity',
                'Performance',
                'Billing',
                'Equipment',
                'Service Request',
                'Installation',
                'Technical'
            ]);

            $table->text('description');

            // Assignment & Status
            $table->string('assigned_to')->nullable();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->onDelete('set null');

            $table->enum('status', [
                'Open',
                'In Progress',
                'Resolved',
                'Closed',
                'On Hold'
            ])->default('Open');

            // SLA Tracking
            $table->timestamp('first_response_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->integer('response_time_minutes')->nullable();
            $table->integer('resolution_time_minutes')->nullable();

            // Additional Fields
            $table->string('resolution_summary')->nullable();
            $table->text('internal_notes')->nullable();
            $table->integer('satisfaction_rating')->nullable();

            $table->softDeletes();

            // Indexes
            $table->index('ticket_number');
            $table->index('status');
            $table->index('priority');
            $table->index('customer_id');
            $table->index('assigned_user_id');
            $table->index('created_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
