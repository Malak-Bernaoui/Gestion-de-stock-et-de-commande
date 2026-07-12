<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Client;
use App\Models\Materiel;
use App\Models\PointDeVente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    public function index()
    {
        $commandes = Commande::with(['client', 'materiel', 'vendeur', 'pointVente', 'facture'])->get();
        return response()->json($commandes);
    }

    public function show($id)
    {
        $commande = Commande::with(['client', 'materiel', 'vendeur', 'pointVente', 'facture'])->findOrFail($id);
        return response()->json($commande);
    }

    // Créer une commande (vendeur)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'is_nr' => 'required|boolean',
            'client_nom' => 'required_if:is_nr,true|nullable|string',
            'materiel_id' => 'required|exists:materiels,id',
            'quantite' => 'required|integer|min:1',
            'point_vente_id' => 'required|exists:point_ventes,id',
            'dateCommande' => 'required|date',
            'dateDisponibilite' => 'nullable|date',
            'prixHT' => 'required|numeric|min:0',
        ]);

        // Vérifier la disponibilité
        $materiel = Materiel::findOrFail($validated['materiel_id']);
        if ($validated['quantite'] > $materiel->quantiteDisponible) {
            return response()->json(['message' => 'Quantité en stock insuffisante'], 400);
        }

        // Calculer le TTC (TVA 20% par défaut)
        $tva = 0.20;
        $prixTTC = $validated['prixHT'] * (1 + $tva);

        // Créer la commande
        $commande = Commande::create([
            'client_id' => $validated['client_id'] ?? null,
            'is_nr' => $validated['is_nr'],
            'client_nom' => $validated['is_nr'] ? $validated['client_nom'] : null,
            'materiel_id' => $validated['materiel_id'],
            'quantite' => $validated['quantite'],
            'vendeur_id' => auth()->id(),
            'point_vente_id' => $validated['point_vente_id'],
            'dateCommande' => $validated['dateCommande'],
            'dateDisponibilite' => $validated['dateDisponibilite'] ?? null,
            'prixHT' => $validated['prixHT'],
            'prixTTC' => $prixTTC,
            'statut' => 'en_attente',
        ]);

        // Mettre à jour le stock (réserver)
        $materiel->quantiteDisponible -= $validated['quantite'];
        $materiel->save();

        return response()->json($commande->load(['client', 'materiel', 'vendeur', 'pointVente']), 201);
    }

    // Valider une vente (passer en "retiree" et générer une facture)
    public function valider($id)
    {
        $commande = Commande::findOrFail($id);
        if ($commande->statut === 'annulee') {
            return response()->json(['message' => 'Cette commande est annulée'], 400);
        }
        if ($commande->statut === 'retiree') {
            return response()->json(['message' => 'Déjà validée'], 400);
        }

        $commande->statut = 'retiree';
        $commande->dateAchat = now();
        $commande->save();

        // Générer automatiquement une facture (appel à FactureController)
        $factureController = new FactureController();
        $facture = $factureController->genererFacture($commande);

        return response()->json(['message' => 'Vente validée, facture générée', 'facture' => $facture]);
    }

    // Annuler une commande (remettre les quantités en stock)
    public function annuler($id)
    {
        $commande = Commande::findOrFail($id);
        if ($commande->statut === 'retiree') {
            return response()->json(['message' => 'Impossible d\'annuler une commande déjà vendue'], 400);
        }

        // Rendre les quantités au stock
        $materiel = $commande->materiel;
        $materiel->quantiteDisponible += $commande->quantite;
        $materiel->save();

        $commande->statut = 'annulee';
        $commande->save();

        return response()->json(['message' => 'Commande annulée']);
    }
}