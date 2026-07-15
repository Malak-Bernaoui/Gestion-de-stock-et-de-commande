import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowPathIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

const ResponsableStockDashboard = () => {
  const navigate = useNavigate();
  const [materiels, setMateriels] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [recentCommandes, setRecentCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [materielsRes, alertesRes, commandesRes] = await Promise.all([
        api.get('/materiels'),
        api.get('/stock/alertes'),
        api.get('/commandes', { params: { per_page: 5 } }),
      ]);
      setMateriels(Array.isArray(materielsRes.data) ? materielsRes.data : []);
      setAlertes(Array.isArray(alertesRes.data) ? alertesRes.data : []);
      setRecentCommandes(Array.isArray(commandesRes.data?.data) ? commandesRes.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger le tableau de bord.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totalArticles = materiels.length;
  const totalUnites = materiels.reduce((sum, m) => sum + Number(m.quantiteDisponible || 0), 0);
  const valeurStock = materiels.reduce((sum, m) => sum + Number(m.quantiteDisponible || 0) * Number(m.prixAchat || 0), 0);
  const ruptures = alertes.filter((a) => Number(a.quantiteDisponible) === 0).length;
  const faibles = alertes.length - ruptures;

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-gray-500"><ArrowPathIcon className="mr-3 h-6 w-6 animate-spin" />Chargement du tableau de bord…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-teal-600 p-3 text-white shadow-lg shadow-teal-200">
          <CubeIcon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-sm font-medium text-teal-600">Responsable Stock</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-500">Vue d'ensemble des niveaux de stock et des mouvements.</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-teal-50 p-3"><CubeIcon className="h-6 w-6 text-teal-600" /></div>
            <span className="text-sm font-medium text-gray-500">Articles</span>
          </div>
          <p className="mt-5 text-3xl font-bold text-gray-900">{totalArticles}</p>
          <p className="mt-1 text-xs text-gray-400">{totalUnites} unités au total</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-emerald-50 p-3"><CurrencyDollarIcon className="h-6 w-6 text-emerald-600" /></div>
            <span className="text-sm font-medium text-gray-500">Valeur du stock</span>
          </div>
          <p className="mt-5 text-3xl font-bold text-gray-900">{valeurStock.toLocaleString('fr-MA')} DH</p>
          <p className="mt-1 text-xs text-gray-400">au prix d'achat</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-red-50 p-3"><ExclamationTriangleIcon className="h-6 w-6 text-red-600" /></div>
            <span className="text-sm font-medium text-gray-500">En rupture</span>
          </div>
          <p className="mt-5 text-3xl font-bold text-gray-900">{ruptures}</p>
          <p className="mt-1 text-xs text-gray-400">quantité disponible = 0</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-amber-50 p-3"><ExclamationTriangleIcon className="h-6 w-6 text-amber-600" /></div>
            <span className="text-sm font-medium text-gray-500">Stock faible</span>
          </div>
          <p className="mt-5 text-3xl font-bold text-gray-900">{faibles}</p>
          <p className="mt-1 text-xs text-gray-400">moins de 5 unités</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-900">Dernières commandes</h2>
            <button onClick={() => navigate('/stock/stock')} className="text-sm font-medium text-teal-600 hover:text-teal-800">Voir le stock</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-3">Produit</th>
                  <th className="px-5 py-3 text-center">Qté</th>
                  <th className="px-5 py-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCommandes.length ? recentCommandes.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium text-gray-800">{c.materiel?.nom || 'Produit supprimé'}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{c.quantite}</td>
                    <td className="px-5 py-3 text-center text-gray-600">{c.statut}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={3} className="px-5 py-10 text-center text-gray-400">Aucune commande récente.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2"><ShoppingCartIcon className="h-5 w-5 text-teal-600" /><h2 className="font-semibold text-gray-900">Articles à surveiller</h2></div>
          <div className="mt-4 space-y-2">
            {alertes.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
                <span className="text-sm font-medium text-gray-700">{item.nom}</span>
                <span className={`text-xs font-bold ${Number(item.quantiteDisponible) === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {item.quantiteDisponible} dispo
                </span>
              </div>
            ))}
            {alertes.length === 0 && <p className="text-sm text-emerald-700">✓ Aucune alerte de stock.</p>}
          </div>
          <button onClick={() => navigate('/stock/alertes')} className="mt-4 text-sm font-medium text-teal-600 hover:text-teal-800">Voir toutes les alertes →</button>
        </section>
      </div>
    </div>
  );
};

export default ResponsableStockDashboard;
