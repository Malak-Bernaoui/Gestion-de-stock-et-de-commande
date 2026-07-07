<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use App\Models\Ville;

class VilleController extends Controller
{
    // 1. LISTE DES VILLES (avec recherche et pagination)
    public function index(Request $request)
    {
        $query = Ville::query();

        // Recherche
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('code', 'LIKE', "%{$search}%")
                  ->orWhere('libelle', 'LIKE', "%{$search}%");
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $villes = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $villes
        ]);
    }

    // 2. CRÉER UNE VILLE
    public function store(Request $request)
    {
        $code = $request->input('code');
       
        if (is_string($code) && strlen($code) > 50) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'code' => ['Le code ne peut pas dépasser 50 caractères.']
                ]
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:villes,code',
            'libelle' => 'required|string|max:255'
        ], [
            'code.required' => 'Le code est obligatoire.',
            'code.string' => 'Le code doit être une chaîne de caractères.',
            'code.max' => 'Le code ne peut pas dépasser 50 caractères.',
            'code.unique' => 'Ce code est déjà utilisé.',
            'libelle.required' => 'Le libellé est obligatoire.',
            'libelle.string' => 'Le libellé doit être une chaîne de caractères.',
            'libelle.max' => 'Le libellé ne peut pas dépasser 255 caractères.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ville = Ville::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Ville créée avec succès ✅',
                'data' => $ville
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erreur création ville: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la ville'
            ], 500);
        }
    }

    // 3. AFFICHER UNE VILLE
    public function show($id)
    {
        $ville = Ville::find($id);

        if (!$ville) {
            return response()->json([
                'success' => false,
                'message' => 'Ville non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $ville
        ]);
    }

    // 4. MODIFIER UNE VILLE
    public function update(Request $request, $id)
    {
        $ville = Ville::find($id);

        if (!$ville) {
            return response()->json([
                'success' => false,
                'message' => 'Ville non trouvée'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:villes,code,' . $id,
            'libelle' => 'required|string|max:255'
        ], [
            'code.required' => 'Le code est obligatoire.',
            'code.string' => 'Le code doit être une chaîne de caractères.',
            'code.max' => 'Le code ne peut pas dépasser 50 caractères.',
            'code.unique' => 'Ce code est déjà utilisé.',
            'libelle.required' => 'Le libellé est obligatoire.',
            'libelle.string' => 'Le libellé doit être une chaîne de caractères.',
            'libelle.max' => 'Le libellé ne peut pas dépasser 255 caractères.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $ville->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Ville mise à jour avec succès ✅',
                'data' => $ville
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur mise à jour ville: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la ville'
            ], 500);
        }
    }

    // 5. SUPPRIMER UNE VILLE
    public function destroy($id)
    {
        $ville = Ville::find($id);

        if (!$ville) {
            return response()->json([
                'success' => false,
                'message' => 'Ville non trouvée'
            ], 404);
        }

        try {
            $ville->delete();

            return response()->json([
                'success' => true,
                'message' => 'Ville supprimée avec succès ✅'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur suppression ville: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la ville'
            ], 500);
        }
    }

    // 6. STATISTIQUES
    public function getStats()
    {
        try {
            $stats = [
                'total' => Ville::count(),
                'total_unique_codes' => Ville::distinct('code')->count()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des statistiques'
            ], 500);
        }
    }
}