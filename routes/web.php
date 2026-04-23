<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InstallationController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


// Route::get('sendSms', [TicketController::class, 'sendSms'])->name('sendSms');
Route::middleware(['auth', 'role:Admin,Manager'])->group(function () {
        Route::get('/dashboard/sla',         [DashboardController::class, 'sla']);
        Route::get('/dashboard/performance', [DashboardController::class, 'performance']);
        Route::get('/dashboard/insights',    [DashboardController::class, 'insights']);

        Route::group(['prefix' => 'settings'], function () {
        Route::get('users', [UserController::class, 'index'])->name('settings.users');
        Route::get('user/{id}', [UserController::class, 'show']);
        Route::put('user/{id}', [UserController::class, 'updateUser']);
        Route::delete('delete-user/{id}', [UserController::class, 'deleteUser']);
        Route::get('system', function () {
            return Inertia::render('admin_settings/system');
        });
    });

    Route::get('/ticket/delete/{ticket_number}', [TicketController::class, 'destroy']);

});

Route::middleware(['auth'])->group(function () {

    Route::get('/dashboard',             [DashboardController::class, 'index'])->name('dashboard');

    // JSON endpoint for live refresh
    Route::get('/api/dashboard',         [DashboardController::class, 'data']);


    Route::group(['prefix' => 'support'], function () {
        Route::get('tickets',[TicketController::class, 'index'])->name('support.tickets');
        Route::get('ticket/{ticket_number}',[TicketController::class, 'show']);
        Route::post('tickets/{ticket_number}/escalate',[TicketController::class, 'escalate']);
    });

    Route::post('tickets/{ticket_number}/notes',[TicketController::class, 'addNote']);


});
Route::middleware(['auth', 'role:Admin,Manager,Support Agent'])->group(function () {

    Route::group(['prefix' => 'customers'], function () {
        Route::get('list',[CustomerController::class, 'index'])->name('customers.list');

        Route::get('installations', [InstallationController::class, 'index'])->name('customers.installations');
        Route::get('leads', function () {
            return Inertia::render('customers/leads');
        });
        Route::get('installation/{id}', [InstallationController::class, 'show'])->name('customers.installation.show');
    });

    // Reassign
    Route::patch('tickets/{ticket_number}/reassign',[TicketController::class,'reassign'])->name('ticket.reassign');

});

Route::middleware(['auth', 'role:Technician,Admin,Manager'])->group(function () {

    // Ticket updates and details
    Route::get('tickets/{ticket}/start',   [TicketController::class, 'startWorking']);
    Route::post('tickets/{ticket}/hold',    [TicketController::class, 'putOnHold']);
    Route::post('tickets/{ticket}/resume',  [TicketController::class, 'resumeFromHold']);
    Route::post('tickets/{ticket}/resolve', [TicketController::class, 'resolve']);
    Route::post('tickets/{ticket}/close',   [TicketController::class, 'close']);
    Route::post('tickets/{ticket_number}/escalate',[TicketController::class, 'escalate']);


});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
