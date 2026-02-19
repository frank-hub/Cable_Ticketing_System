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


Route::get('sendSms', [TicketController::class, 'sendSms'])->name('sendSms');


Route::group(['prefix' => 'customers'], function () {
    Route::get('list',[CustomerController::class, 'index'])->name('customers.list');

    Route::get('installations', [InstallationController::class, 'index'])->name('customers.installations');
    Route::get('leads', function () {
        return Inertia::render('customers/leads');
    });
});

Route::group(['prefix' => 'settings'], function () {
    Route::get('users', [UserController::class, 'index'])->name('settings.users');

    Route::get('system', function () {
        return Inertia::render('admin_settings/system');
    });
});

Route::group(['prefix' => 'support'], function () {

    Route::get('tickets',[TicketController::class, 'index'])->name('support.tickets');

    // Route::get('ticket/{id}', function () {
    //     return Inertia::render('support/ticket_details');
    // });
    Route::get('ticket/{ticket_number}',[TicketController::class, 'show']);


});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard',             [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/sla',         [DashboardController::class, 'sla']);
    Route::get('/dashboard/performance', [DashboardController::class, 'performance']);
    Route::get('/dashboard/insights',    [DashboardController::class, 'insights']);

    // JSON endpoint for live refresh
    Route::get('/api/dashboard',         [DashboardController::class, 'data']);
});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
