import { ShoppingBagIcon, CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import DirecteurResourcePage from './DirecteurResourcePage';
import api from '../../api/axios';

const CommandesDirecteur = () => {
  const normalize = (data) =>
    data.map(item => ({
      ...item,
      client_nom: item.client?.nom || item.client_nom || 'NR',
    }));

  return (
    <DirecteurResourcePage
      title="Suivi des commandes"
      description="Validation et suivi des commandes."
      endpoint="/commandes"
      icon={ShoppingBagIcon}
      normalize={normalize}
      getSearchText={(item) => `${item.id} ${item.client_nom}`}
      getMetrics={(items) => [
        { label: 'Total commandes', value: items.length, hint: 'enregistrées' },
        { label: 'En attente', value: items.filter(i => i.statut === 'en_attente').length, hint: 'à valider' },
        { label: 'Validées', value: items.filter(i => i.statut === 'retiree').length, hint: 'terminées' },
      ]}
      columns={[
        { label: 'Commande', render: (item) => `#${item.id}` },
        { label: 'Client', render: (item) => item.client_nom },
        { label: 'Montant', render: (item) => `${Number(item.prixTTC || 0).toLocaleString('fr-MA')} DH` },
        {
          label: 'Statut',
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              item.statut === 'retiree' ? 'bg-green-100 text-green-700' :
              item.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-700' :
              item.statut === 'annulee' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {item.statut}
            </span>
          )
        },
      ]}
      actions={[
        {
          label: 'Voir',
          icon: EyeIcon,
          onClick: (item) => alert(`Commande #${item.id}\nClient: ${item.client_nom}\nMontant: ${item.prixTTC} DH`),
          className: 'text-indigo-700 hover:bg-indigo-50'
        },
        {
          label: 'Valider',
          icon: CheckIcon,
          onClick: async (item) => {
            if (window.confirm(`Valider la commande #${item.id} ?`)) {
              try {
                await api.post(`/commandes/${item.id}/valider`);
                alert('Commande validée !');
                window.location.reload();
              } catch (e) {
                alert('Erreur lors de la validation.');
              }
            }
          },
          className: 'text-green-700 hover:bg-green-50'
        },
        {
          label: 'Annuler',
          icon: XMarkIcon,
          onClick: async (item) => {
            if (window.confirm(`Annuler la commande #${item.id} ?`)) {
              try {
                await api.post(`/commandes/${item.id}/annuler`);
                alert('Commande annulée.');
                window.location.reload();
              } catch (e) {
                alert('Erreur lors de l\'annulation.');
              }
            }
          },
          className: 'text-red-700 hover:bg-red-50'
        },
      ]}
    />
  );
};

export default CommandesDirecteur;