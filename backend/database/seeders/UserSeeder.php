<?php
namespace Database\Seeders;
use App\Models\User;
use App\Models\Administrateur;
use App\Models\DirecteurVentes;
use App\Models\ResponsableStock;
use App\Models\Vendeur;
use App\Models\Client;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Admin
        $user = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => Hash::make('password')]);
        Administrateur::create(['user_id' => $user->id]);

        // Directeur
        $user2 = User::create(['name' => 'Directeur', 'email' => 'directeur@example.com', 'password' => Hash::make('password')]);
        DirecteurVentes::create(['user_id' => $user2->id]);

        // Responsable stock
        $user3 = User::create(['name' => 'RespStock', 'email' => 'stock@example.com', 'password' => Hash::make('password')]);
        ResponsableStock::create(['user_id' => $user3->id]);

        // Vendeur
        $user4 = User::create(['name' => 'Vendeur', 'email' => 'vendeur@example.com', 'password' => Hash::make('password')]);
        Vendeur::create(['user_id' => $user4->id]);

        // Client
        $user5 = User::create(['name' => 'Client', 'email' => 'client@example.com', 'password' => Hash::make('password')]);
        Client::create([
            'user_id' => $user5->id,
            'CIN' => 'AB123456',
            'nom' => 'Dupont',
            'telephone' => '0612345678',
            'email' => 'client@example.com',
            'dateCreation' => now(),
        ]);
    }
}
