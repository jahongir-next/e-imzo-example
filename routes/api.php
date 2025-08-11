<?php

use App\Http\Controllers\EimzoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/eimzo/challenge', [EimzoController::class, 'challenge'])->name('eimzo.challenge');
Route::post('/eimzo/auth', [EimzoController::class, 'auth'])->name('eimzo.auth');

// Sign

Route::post('/eimzo/timestamp' , [EimzoController::class, 'timestamp'])->name('eimzo.timestamp');
Route::post('/eimzo/verify' , [EimzoController::class, 'verify'])->name('eimzo.verify');
