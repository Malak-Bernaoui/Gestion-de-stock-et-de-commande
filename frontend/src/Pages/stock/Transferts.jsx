import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon, ArrowsRightLeftIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const Transferts = () => {
  const [materiels, setMateriels] = useState([]);
  const [adresses, setAdresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [target, setTarget] = useState(null);
  const [quantite, setQuantite] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [materielsRes, adressesRes] = await Promise.all([
        api.get('/materiels'),
        api.get('/adresse-stocks'),
      ]);
      setMateriels(Array.isArray(materielsRes.data) ? materielsRes.data : []);
      setAdresses(Array.isArray(adressesRes.data) ? adressesRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger le stock.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return materiels;
    return materiels.filter((m) => `${m.reference} ${m.nom}`.toLowerCase().includes(query));
  }, [materiels, search]);

  const openTransfer = (materiel) => {
    setTarget(materiel);
    setQuantite('');
    setDestinationId('');
    setError('');
  };

  const submitTransfer = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.post(`/materiels/${target.id}/transfert`, {
        quantite: Number(quantite),
        adresse_stock_destination_id: destinationId,
      });
      setMessage(`Transfert de ${quantite} unité(s) de « ${target.nom} » effectué avec succès.`);
      setTarget(null);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Le transfert a échoué.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-teal-600 p-3 text-white shadow-lg shadow-teal-200">
            <ArrowsRightLeftIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-teal-600">Responsable Stock</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900">Transferts de stock</h1>
            <p className="mt-1 text-sm text-gray-500">Déplacez des articles entre adresses de stockage.</p>
          </div>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}
      {error && !target && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un article…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
          </div>
          <span className="text-sm text-gray-500">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50/80 text-left text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Référence</th>
                <th className="px-5 py-3 font-semibold">Article</th>
                <th className="px-5 py-3 font-semibold">Emplacement actuel</th>
                <th className="px-5 py-3 text-center font-semibold">Disponible</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-gray-400">Chargement…</td>
                </tr>
              ) : filtered.length ? (
                filtered.map((m) => (
                  <tr key={m.id} className="transition hover:bg-teal-50/40">
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{m.reference}</td>
                    <td className="px-5 py-4 font-medium text-gray-900">{m.nom}</td>
                    <td className="px-5 py-4 text-gray-600">{m.adresse_stock?.code || m.adresseStock?.code || '—'}</td>
                    <td className="px-5 py-4 text-center font-semibold text-gray-700">{m.quantiteDisponible}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        disabled={!m.quantiteDisponible}
                        onClick={() => openTransfer(m)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ArrowsRightLeftIcon className="h-4 w-4" />
                        Transférer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center text-gray-400">Aucun article à afficher.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={submitTransfer} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Transférer un article</h2>
                <p className="text-sm text-gray-500">{target.nom} — {target.quantiteDisponible} unité(s) disponible(s)</p>
              </div>
              <button type="button" onClick={() => setTarget(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <div className="mt-6 space-y-4">
              <label>
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Quantité à transférer *</span>
                <input
                  required
                  type="number"
                  min="1"
                  max={target.quantiteDisponible}
                  value={quantite}
                  onChange={(e) => setQuantite(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Adresse de destination *</span>
                <select
                  required
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm"
                >
                  <option value="">Sélectionner…</option>
                  {adresses
                    .filter((a) => a.id !== (target.adresse_stock?.id || target.adresseStock?.id))
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nom || a.code}
                      </option>
                    ))}
                </select>
              </label>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button type="button" onClick={() => setTarget(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                Annuler
              </button>
              <button disabled={saving} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? 'Transfert…' : 'Confirmer le transfert'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Transferts;
