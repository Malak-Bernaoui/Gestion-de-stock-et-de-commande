<?php

use App\Http\Controllers\Api\{
    AuthController,
    ClientController,
    PartenaireController,
    VilleController,
    TypeMaterielController,
    VehicleController,
    AdresseStockController,
    PointDeVenteController,
    MaterielController,
    CommandeController,
    FactureController,
    ReportingController,
    UserController,
    ClientAuthController,
    ClientCommandeController,
    ClientFactureController,
    ClientProfilController
};
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Routes publiques d'authentification
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/client/login', [ClientAuthController::class, 'login']);

    // Routes protégées pour les utilisateurs internes
    Route::middleware('auth:sanctum')->group(function () {

        // Routes réservées à l'admin
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('users', UserController::class);
            Route::apiResource('clients', ClientController::class);
            Route::apiResource('partenaires', PartenaireController::class);
            Route::apiResource('villes', VilleController::class);
            Route::apiResource('types', TypeMaterielController::class);
            Route::apiResource('vehicles', VehicleController::class);
            Route::apiResource('adresses-stock', AdresseStockController::class);
            Route::apiResource('points-vente', PointDeVenteController::class);
        });

        // Routes accessibles à admin et directeur
        Route::middleware('role:admin,directeur_ventes')->group(function () {
            Route::apiResource('materiels', MaterielController::class);
            Route::get('reporting', [ReportingController::class, 'index']);
        });

        // Routes accessibles à admin, directeur, responsable stock
        Route::middleware('role:admin,directeur_ventes,responsable_stock')->group(function () {
            Route::post('materiels/{id}/transfert', [MaterielController::class, 'transfert']);
            Route::get('stock/alertes', [MaterielController::class, 'alertes']);
        });

        // Routes accessibles à tous les rôles internes (admin, directeur, responsable, vendeur)
        Route::middleware('role:admin,directeur_ventes,responsable_stock,vendeur')->group(function () {
            Route::apiResource('commandes', CommandeController::class);
            Route::post('commandes/{id}/valider', [CommandeController::class, 'valider']);
            Route::post('commandes/{id}/annuler', [CommandeController::class, 'annuler']);
            Route::get('factures', [FactureController::class, 'index']);
            Route::get('factures/{id}', [FactureController::class, 'show']);
            Route::post('factures', [FactureController::class, 'store']);
        });

        // Déconnexion (pour tous les utilisateurs internes)
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });

    // Routes pour les clients (authentification avec guard 'client')
    Route::middleware('auth:client')->group(function () {
        Route::get('client/commandes', [ClientCommandeController::class, 'index']);
        Route::get('client/factures', [ClientFactureController::class, 'index']);
        Route::put('client/profil', [ClientProfilController::class, 'update']);
        Route::post('client/logout', [ClientAuthController::class, 'logout']);
    });
});