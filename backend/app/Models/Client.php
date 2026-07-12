<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $fillable = ['CIN', 'nom', 'telephone', 'email', 'dateCreation', 'motDePasse'];
    public function commandes() { return $this->hasMany(Commande::class); }
}