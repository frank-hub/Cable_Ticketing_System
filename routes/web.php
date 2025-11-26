<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::group(['prefix' => 'customers'], function () {
    Route::get('list', function () {
        return Inertia::render('customers/customers');
    })->name('customers.index');

    Route::get('installations', function () {
        return Inertia::render('customers/installations');
    });
    Route::get('leads', function () {
        return Inertia::render('customers/leads');
    });
});

Route::get('support/tickets', function () {
    return Inertia::render('support/tickets');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
