<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Commande;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FactureController extends Controller
{
    // Générer une facture (appelée par le contrôleur Commande)
    public function genererFacture(Commande $commande)
    {
        $facture = Facture::create([
            'reference' => 'FAC-' . strtoupper(Str::random(8)),
            'commande_id' => $commande->id,
            'generee_par' => auth()->id() ?? 1, // fallback admin
            'date_generation' => now(),
        ]);
        return $facture;
    }

    // Afficher toutes les factures
    public function index()
    {
        $factures = Facture::with(['commande.client', 'commande.materiel', 'generateur'])->get();
        return response()->json($factures);
    }

    // Afficher une facture
    public function show($id)
    {
        $facture = Facture::with(['commande.client', 'commande.materiel', 'generateur'])->findOrFail($id);
        return response()->json($facture);
    }

    // Créer une facture manuellement (admin ou vendeur) – on utilise la même méthode store
    public function store(Request $request)
    {
        $validated = $request->validate([
            'commande_id' => 'required|exists:commandes,id',
        ]);

        $commande = Commande::findOrFail($validated['commande_id']);
        if ($commande->statut !== 'retiree') {
            return response()->json(['message' => 'La commande doit être validée avant de générer une facture'], 400);
        }

        // Vérifier si une facture existe déjà
        if ($commande->facture) {
            return response()->json(['message' => 'Une facture existe déjà pour cette commande'], 400);
        }

        $facture = $this->genererFacture($commande);
        return response()->json($facture, 201);
    }
}