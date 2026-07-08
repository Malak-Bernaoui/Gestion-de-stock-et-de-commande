<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;  // ← correction ici
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password'];

    // Relations
    public function administrateur()     { return $this->hasOne(Administrateur::class); }
    public function directeurVentes()    { return $this->hasOne(DirecteurVentes::class); }
    public function responsableStock()   { return $this->hasOne(ResponsableStock::class); }
    public function vendeur()            { return $this->hasOne(Vendeur::class); }
    public function client()             { return $this->hasOne(Client::class); }

    // Méthode pour obtenir le rôle (calculé dynamiquement)
    public function getRole()
    {
        if ($this->administrateur)       return 'admin';
        if ($this->directeurVentes)      return 'directeur_ventes';
        if ($this->responsableStock)     return 'responsable_stock';
        if ($this->vendeur)              return 'vendeur';
        if ($this->client)               return 'client';
        return null;
    }
}