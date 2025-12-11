<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/user', [UserController::class, 'storeUser']);



Route::group(['prefix' => 'customers'], function () {
    Route::post('/', [CustomerController::class, 'store']);

})->middleware('auth:sanctum');


Route::group(['prefix' => 'support'], function () {

    Route::post('ticket',[TicketController::class, 'store']);
    Route::get('/ticket/{ticket_number}',[TicketController::class, 'show']);

});
