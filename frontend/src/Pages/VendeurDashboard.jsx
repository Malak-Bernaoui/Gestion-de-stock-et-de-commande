import { useEffect, useState } from 'react';
import api from '../api/axios';

const VendeurDashboard = () => {
  const [search, setSearch] = useState('');
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.get('/materiels').then(res => setArticles(res.data));
  }, []);

  const filtered = articles.filter(a =>
    a.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Consultation stock</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filtered.slice(0, 9).map(article => (
          <div key={article.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-bold">{article.nom}</h3>
            <p className="text-gray-600">Réf : {article.reference}</p>
            <p className="text-green-600 font-semibold">Dispo : {article.quantiteDisponible}</p>
            <p className="text-blue-600">Prix : {article.prixVente} €</p>
            {/* Le prix d'achat est masqué automatiquement */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendeurDashboard;