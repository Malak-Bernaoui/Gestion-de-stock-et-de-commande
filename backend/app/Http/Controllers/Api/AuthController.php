<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Inscription
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'sometimes|in:admin,responsable,vendeur,client', // Rôle optionnel
        ]);

        // Définir le rôle par défaut si non fourni
        $role = $request->role ?? 'client';

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $role, // Ajouter le champ role dans la table users
        ]);

        // Créer les relations selon le rôle
        $this->createUserRelations($user, $role);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
            ],
            'token' => $token,
            'message' => 'Inscription réussie !',
        ], 201);
    }

    // Connexion
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants sont incorrects.'],
            ]);
        }

        // Déterminer le type d'utilisateur et l'ID de redirection
        $redirectData = $this->getRedirectData($user);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'client',
            ],
            'token' => $token,
            'role' => [
                'type' => $redirectData['type'],
                'id' => $redirectData['id'],
            ],
            'redirect' => $redirectData,
        ]);
    }

    // Déconnexion
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    // Changer le mot de passe
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Mot de passe actuel incorrect'
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Mot de passe modifié avec succès'
        ]);
    }

    // Récupérer l'utilisateur connecté
    public function me(Request $request)
    {
        $user = $request->user()->load(['administrateur', 'responsable', 'vendeur', 'client']);
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'profile' => $this->getUserProfile($user),
            ]
        ]);
    }

    // Méthode pour créer les relations selon le rôle
    private function createUserRelations($user, $role)
    {
        switch ($role) {
            case 'admin':
                $user->administrateur()->create([
                    'user_id' => $user->id,
                    'permissions' => json_encode(['all' => true]),
                ]);
                break;
            case 'responsable':
                $user->responsable()->create([
                    'user_id' => $user->id,
                    'can_manage_stock' => true,
                    'can_manage_referentials' => true,
                    'can_manage_invoices' => true,
                    'can_view_reports' => true,
                ]);
                break;
            case 'vendeur':
                $user->vendeur()->create([
                    'user_id' => $user->id,
                    'can_create_client_accounts' => true,
                    'can_view_invoices' => true,
                    'can_view_orders' => true,
                ]);
                break;
            case 'client':
                $user->client()->create([
                    'user_id' => $user->id,
                    'can_modify_account' => true,
                    'can_view_invoices' => true,
                ]);
                break;
        }
    }

    // Méthode pour obtenir les données de redirection
    private function getRedirectData($user)
    {
        $redirectType = 'client';
        $redirectId = $user->id;

        // Vérifier les relations dans l'ordre de priorité
        if ($user->administrateur) {
            $redirectType = 'admin';
            $redirectId = $user->administrateur->id;
        } elseif ($user->responsable) {
            $redirectType = 'responsable';
            $redirectId = $user->responsable->id;
        } elseif ($user->vendeur) {
            $redirectType = 'vendeur';
            $redirectId = $user->vendeur->id;
        } elseif ($user->client) {
            $redirectType = 'client';
            $redirectId = $user->client->id;
        } elseif ($user->role) {
            // Utiliser le champ role si les relations n'existent pas
            $redirectType = $user->role;
            $redirectId = $user->id;
        }

        return [
            'type' => $redirectType,
            'id' => $redirectId,
        ];
    }

    // Méthode pour obtenir le profil complet de l'utilisateur
    private function getUserProfile($user)
    {
        $profile = [
            'type' => $user->role ?? 'client',
            'permissions' => [],
        ];

        switch ($user->role) {
            case 'admin':
                $profile['permissions'] = [
                    'manage_stock' => true,
                    'manage_referentials' => true,
                    'manage_client_accounts' => true,
                    'manage_users' => true,
                    'manage_invoices' => true,
                    'view_reports' => true,
                    'view_stock' => true,
                    'reserve_materials' => true,
                ];
                if ($user->administrateur) {
                    $profile['admin_id'] = $user->administrateur->id;
                }
                break;

            case 'responsable':
                $profile['permissions'] = [
                    'manage_stock' => true,
                    'manage_referentials' => true,
                    'manage_invoices' => true,
                    'view_reports' => true,
                    'view_stock' => true,
                    'reserve_materials' => true,
                ];
                if ($user->responsable) {
                    $profile['responsable_id'] = $user->responsable->id;
                }
                break;

            case 'vendeur':
                $profile['permissions'] = [
                    'create_client_accounts' => true,
                    'view_invoices' => true,
                    'view_orders' => true,
                    'reserve_materials' => true,
                ];
                if ($user->vendeur) {
                    $profile['vendeur_id'] = $user->vendeur->id;
                }
                break;

            case 'client':
                $profile['permissions'] = [
                    'modify_account' => true,
                    'view_invoices' => true,
                    'view_orders' => true,
                ];
                if ($user->client) {
                    $profile['client_id'] = $user->client->id;
                }
                break;
        }

        return $profile;
    }
}