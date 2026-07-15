import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  PlusIcon,
  ShoppingCartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

const PER_PAGE = 8;
const money = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 });
const labels = { en_attente: 'En attente', disponible: 'Disponible', retiree: 'Validée', annulee: 'Annulée' };
const colors = {
  en_attente: 'bg-amber-50 text-amber-700',
  disponible: 'bg-blue-50 text-blue-700',
  retiree: 'bg-emerald-50 text-emerald-700',
  annulee: 'bg-red-50 text-red-700',
};

const CommandesVendeur = () => {
  const [commandes, setCommandes] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, from: 0, to: 0 });
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [creating, setCreating] = useState(false);
  const [materiels, setMateriels] = useState([]);
  const [clients, setClients] = useState([]);
  const [pointsVente, setPointsVente] = useState([]);
  const [form, setForm] = useState({});
  const [isNr, setIsNr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/commandes', { params: { page, per_page: PER_PAGE, search, statut } });
      setCommandes(data.data || []);
      setMeta({ current_page: data.current_page || 1, last_page: data.last_page || 1, total: data.total || 0, from: data.from || 0, to: data.to || 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger vos commandes.');
      setCommandes([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statut]);

  useEffect(() => {
    load();
  }, [load]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const updateStatus = async (commande, action) => {
    const text = action === 'valider' ? 'valider cette commande et générer sa facture' : 'annuler cette commande et remettre le stock à jour';
    if (!window.confirm(`Voulez-vous ${text} ?`)) return;
    setActionId(`${action}-${commande.id}`);
    setMessage('');
    setError('');
    try {
      const { data } = await api.post(`/commandes/${commande.id}/${action}`);
      setMessage(data.message);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "L'action a échoué.");
    } finally {
      setActionId(null);
    }
  };

  const openCreate = async () => {
    setCreating(true);
    setFormError('');
    setIsNr(false);
    setForm({
      materiel_id: '',
      quantite: 1,
      client_id: '',
      client_nom: '',
      point_vente_id: '',
      dateCommande: new Date().toISOString().slice(0, 10),
      prixHT: '',
    });
    try {
      const [materielsRes, clientsRes, pointsRes] = await Promise.all([
        api.get('/materiels'),
        api.get('/clients'),
        api.get('/points-vente'),
      ]);
      setMateriels(Array.isArray(materielsRes.data) ? materielsRes.data : []);
      setClients(Array.isArray(clientsRes.data) ? clientsRes.data : []);
      setPointsVente(Array.isArray(pointsRes.data) ? pointsRes.data : []);
    } catch (err) {
      setFormError("Impossible de charger les données nécessaires à la création.");
    }
  };

  const selectedMateriel = useMemo(
    () => materiels.find((m) => String(m.id) === String(form.materiel_id)) || null,
    [materiels, form.materiel_id]
  );

  const updateMateriel = (materielId) => {
    const materiel = materiels.find((m) => String(m.id) === String(materielId));
    setForm((f) => ({
      ...f,
      materiel_id: materielId,
      prixHT: materiel ? (Number(materiel.prixVente || 0) * Number(f.quantite || 1)).toFixed(2) : f.prixHT,
    }));
  };

  const updateQuantite = (quantite) => {
    setForm((f) => ({
      ...f,
      quantite,
      prixHT: selectedMateriel ? (Number(selectedMateriel.prixVente || 0) * Number(quantite || 0)).toFixed(2) : f.prixHT,
    }));
  };

  const submitCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await api.post('/commandes', {
        client_id: isNr ? null : form.client_id || null,
        is_nr: isNr,
        client_nom: isNr ? form.client_nom : null,
        materiel_id: form.materiel_id,
        quantite: Number(form.quantite),
        point_vente_id: form.point_vente_id,
        dateCommande: form.dateCommande,
        prixHT: Number(form.prixHT),
      });
      setCreating(false);
      setPage(1);
      setMessage('Commande créée avec succès.');
      await load();
    } catch (err) {
      setFormError(err.response?.data?.message || 'La création a échoué.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-amber-500 p-3 text-white shadow-lg shadow-amber-200">
            <ShoppingCartIcon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-600">Vendeur</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Mes commandes</h1>
            <p className="mt-1 text-sm text-gray-500">Créez de nouvelles ventes et suivez leur statut.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-200 transition hover:bg-amber-600"
          >
            <PlusIcon className="h-4 w-4" />
            Nouvelle commande
          </button>
          <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

      <form onSubmit={submitSearch} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="N° de commande, client ou produit"
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
        </div>
        <select value={statut} onChange={(e) => { setStatut(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700">
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="disponible">Disponible</option>
          <option value="retiree">Validée</option>
          <option value="annulee">Annulée</option>
        </select>
        <button className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">Rechercher</button>
      </form>

      <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4 text-sm text-gray-500">
          {meta.total} commande{meta.total !== 1 ? 's' : ''} trouvée{meta.total !== 1 ? 's' : ''}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Commande</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Produit</th>
                <th className="px-5 py-3 text-center">Qté</th>
                <th className="px-5 py-3 text-right">Montant TTC</th>
                <th className="px-5 py-3 text-center">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-5 py-12 text-center text-gray-400">Chargement…</td></tr>
              ) : commandes.length ? commandes.map((commande) => (
                <tr key={commande.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono text-gray-600">#{commande.id}</td>
                  <td className="px-5 py-4 font-medium text-gray-800">{commande.client?.nom || commande.client_nom || 'Client non renseigné'}</td>
                  <td className="px-5 py-4 text-gray-600">{commande.materiel?.nom || 'Produit supprimé'}</td>
                  <td className="px-5 py-4 text-center text-gray-600">{commande.quantite}</td>
                  <td className="px-5 py-4 text-right font-medium text-gray-800">{money.format(commande.prixTTC || 0)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${colors[commande.statut] || 'bg-gray-100 text-gray-700'}`}>
                      {labels[commande.statut] || commande.statut}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {!['retiree', 'annulee'].includes(commande.statut) && (
                        <>
                          <button
                            disabled={actionId !== null}
                            onClick={() => updateStatus(commande, 'valider')}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            {actionId === `valider-${commande.id}` ? 'Validation…' : 'Valider'}
                          </button>
                          <button
                            disabled={actionId !== null}
                            onClick={() => updateStatus(commande, 'annuler')}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            <NoSymbolIcon className="h-4 w-4" />
                            {actionId === `annuler-${commande.id}` ? 'Annulation…' : 'Annuler'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="7" className="px-5 py-12 text-center text-gray-400">Aucune commande ne correspond à votre recherche.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{meta.from}–{meta.to} sur {meta.total}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-50">Précédent</button>
            <span className="px-3 py-2 text-gray-600">Page {meta.current_page} / {meta.last_page}</span>
            <button disabled={page === meta.last_page} onClick={() => setPage(page + 1)} className="rounded-lg border border-gray-300 px-3 py-2 disabled:opacity-50">Suivant</button>
          </div>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={submitCreate} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nouvelle commande</h2>
              <button type="button" onClick={() => setCreating(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {formError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Article *</span>
                <select required value={form.materiel_id} onChange={(e) => updateMateriel(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm">
                  <option value="">Sélectionner un article…</option>
                  {materiels.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.quantiteDisponible === 0}>
                      {m.nom} — {Number(m.prixVente || 0).toLocaleString('fr-MA')} DH ({m.quantiteDisponible} dispo)
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Quantité *</span>
                <input
                  required
                  type="number"
                  min="1"
                  max={selectedMateriel?.quantiteDisponible || undefined}
                  value={form.quantite}
                  onChange={(e) => updateQuantite(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-50"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Prix HT total *</span>
                <input
                  required
                  type="number"
                  step="any"
                  min="0"
                  value={form.prixHT}
                  onChange={(e) => setForm({ ...form, prixHT: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-50"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Point de vente *</span>
                <select required value={form.point_vente_id} onChange={(e) => setForm({ ...form, point_vente_id: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm">
                  <option value="">Sélectionner…</option>
                  {pointsVente.map((p) => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1.5 block text-sm font-semibold text-gray-700">Date de commande *</span>
                <input
                  required
                  type="date"
                  value={form.dateCommande}
                  onChange={(e) => setForm({ ...form, dateCommande: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-50"
                />
              </label>

              <div className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <button
                  type="button"
                  onClick={() => setIsNr(false)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${!isNr ? 'bg-amber-500 text-white' : 'text-gray-600'}`}
                >
                  Client enregistré
                </button>
                <button
                  type="button"
                  onClick={() => setIsNr(true)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${isNr ? 'bg-amber-500 text-white' : 'text-gray-600'}`}
                >
                  Client non enregistré
                </button>
              </div>

              {isNr ? (
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700">Nom du client *</span>
                  <input
                    required
                    value={form.client_nom}
                    onChange={(e) => setForm({ ...form, client_nom: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-50"
                  />
                </label>
              ) : (
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold text-gray-700">Client</span>
                  <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm">
                    <option value="">Sélectionner…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom} — {c.telephone}</option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button type="button" onClick={() => setCreating(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100">
                Annuler
              </button>
              <button disabled={saving} className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? 'Création…' : 'Créer la commande'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommandesVendeur;
