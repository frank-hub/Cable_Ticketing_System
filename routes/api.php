<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\TicketController;

;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::group(['prefix' => 'customers'], function () {
    Route::post('/', [CustomerController::class, 'store']);

})->middleware('auth:sanctum');

Route::group(['prefix' => 'support'], function () {

    Route::post('ticket',[TicketController::class, 'store']);

});
