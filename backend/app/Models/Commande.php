<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $fillable = [
        'client_id', 'is_nr', 'client_nom', 'materiel_id', 'quantite',
        'vendeur_id', 'point_vente_id', 'dateCommande', 'dateAchat',
        'dateDisponibilite', 'prixHT', 'prixTTC', 'statut'
    ];

    public function client()    { return $this->belongsTo(Client::class); }
    public function materiel()  { return $this->belongsTo(Materiel::class); }
    public function vendeur()   { return $this->belongsTo(User::class, 'vendeur_id'); }
    public function pointVente(){ return $this->belongsTo(PointDeVente::class); }
    public function facture()   { return $this->hasOne(Facture::class); }
}