<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->input('limit', 10); // default 10

        $users = User::with(['administrateur', 'directeurVentes', 'responsableStock', 'vendeur'])
                     ->limit($limit)
                     ->get();

        return response()->json([
            'data' => $users,
            'meta' => ['total' => User::count()],
        ]);
    }
}