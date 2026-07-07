<?php

use App\Http\Controllers\Api\VilleController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    
    Route::get('/villes/stats', [VilleController::class, 'getStats']);  
    Route::get('/villes', [VilleController::class, 'index']);      
    Route::post('/villes', [VilleController::class, 'store']);     
    Route::get('/villes/{id}', [VilleController::class, 'show']);  
    Route::put('/villes/{id}', [VilleController::class, 'update']);
    Route::delete('/villes/{id}', [VilleController::class, 'destroy']); 
    // Test
    Route::get('/test', function () {
        return response()->json([
            'message' => 'API fonctionne correctement ✅',
            'status' => 'success'
        ]);
    });
});