<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InstallationController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware([ 'role:Admin,Manager'])->group(function () {
    Route::post('/user', [UserController::class, 'storeUser']);
    Route::post('/support/ticket', [TicketController::class, 'store']);
});



Route::group(['prefix' => 'customers'], function () {
    Route::post('/', [CustomerController::class, 'store']);
    Route::post('/installations', [InstallationController::class, 'store']);

})->middleware('auth:sanctum');



