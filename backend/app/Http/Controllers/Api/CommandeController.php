<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commande;
use App\Models\Materiel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandeController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);
        $search = trim((string) $request->input('search', ''));

        $commandes = Commande::with(['client:id,nom', 'materiel:id,nom,type_materiel_id', 'materiel.type:id,libelle', 'vendeur:id,name', 'pointVente:id,nom', 'facture'])
            ->when($this->estVendeur(), fn ($query) => $query->where('vendeur_id', auth()->id()))
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->input('statut')))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('id', 'like', "%{$search}%")
                        ->orWhere('client_nom', 'like', "%{$search}%")
                        ->orWhereHas('client', fn ($client) => $client->where('nom', 'like', "%{$search}%"))
                        ->orWhereHas('materiel', fn ($materiel) => $materiel->where('nom', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('dateCommande')
            ->paginate($perPage);

        return response()->json($commandes);
    }

    public function show($id)
    {
        return response()->json(Commande::with(['client', 'materiel', 'vendeur', 'pointVente', 'facture'])->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'is_nr' => 'required|boolean',
            'client_nom' => 'required_if:is_nr,true|nullable|string',
            'materiel_id' => 'required|exists:materiels,id',
            'quantite' => 'required|integer|min:1',
            'point_vente_id' => 'required|exists:point_de_ventes,id',
            'dateCommande' => 'required|date',
            'dateDisponibilite' => 'nullable|date',
            'prixHT' => 'required|numeric|min:0',
        ]);

        $commande = DB::transaction(function () use ($validated) {
            $materiel = Materiel::lockForUpdate()->findOrFail($validated['materiel_id']);
            if ($validated['quantite'] > $materiel->quantiteDisponible) {
                abort(422, 'Quantité en stock insuffisante.');
            }

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
                'prixTTC' => $validated['prixHT'] * 1.20,
                'statut' => 'en_attente',
            ]);

            $materiel->decrement('quantiteDisponible', $validated['quantite']);
            return $commande;
        });

        return response()->json($commande->load(['client', 'materiel', 'vendeur', 'pointVente']), 201);
    }

    public function valider($id)
    {
        $result = DB::transaction(function () use ($id) {
            $commande = Commande::with('facture')->lockForUpdate()->findOrFail($id);
            $this->assertProprietaire($commande);
            if ($commande->statut === 'annulee') {
                abort(422, 'Cette commande est annulée.');
            }
            if ($commande->statut === 'retiree') {
                abort(422, 'Cette commande est déjà validée.');
            }

            $commande->update(['statut' => 'retiree', 'dateAchat' => now()]);
            $facture = $commande->facture ?? (new FactureController())->genererFacture($commande);
            return compact('commande', 'facture');
        });

        return response()->json([
            'message' => 'Commande validée et facture générée.',
            'commande' => $result['commande']->load(['client', 'materiel', 'facture']),
            'facture' => $result['facture'],
        ]);
    }

    public function annuler($id)
    {
        $commande = DB::transaction(function () use ($id) {
            $commande = Commande::lockForUpdate()->findOrFail($id);
            $this->assertProprietaire($commande);
            if ($commande->statut === 'retiree') {
                abort(422, 'Impossible d’annuler une commande déjà validée.');
            }
            if ($commande->statut === 'annulee') {
                abort(422, 'Cette commande est déjà annulée.');
            }

            $materiel = Materiel::lockForUpdate()->findOrFail($commande->materiel_id);
            $materiel->increment('quantiteDisponible', $commande->quantite);
            $commande->update(['statut' => 'annulee']);
            return $commande;
        });

        return response()->json([
            'message' => 'Commande annulée et stock remis à jour.',
            'commande' => $commande->load(['client', 'materiel']),
        ]);
    }

    private function estVendeur(): bool
    {
        return auth()->user()?->getRole() === 'vendeur';
    }

    private function assertProprietaire(Commande $commande): void
    {
        if ($this->estVendeur() && $commande->vendeur_id !== auth()->id()) {
            abort(403, 'Vous ne pouvez agir que sur vos propres commandes.');
        }
    }
}