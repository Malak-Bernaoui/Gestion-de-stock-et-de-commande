import { CubeIcon } from '@heroicons/react/24/outline';
import DirecteurResourcePage from './DirecteurResourcePage';
import { EyeIcon } from '@heroicons/react/24/outline';

const StockDirecteur = () => {
  return (
    <DirecteurResourcePage
      title="Consultation du stock"
      description="Vue globale des matériels disponibles."
      endpoint="/materiels"
      icon={CubeIcon}
      getSearchText={(item) => `${item.reference} ${item.nom}`}
      getMetrics={(items) => [
        { label: 'Total articles', value: items.length, hint: 'références en stock' },
        { label: 'Disponibles', value: items.filter(i => i.quantiteDisponible > 10).length, hint: 'stock suffisant' },
        { label: 'Faible stock', value: items.filter(i => i.quantiteDisponible > 0 && i.quantiteDisponible <= 10).length, hint: 'moins de 10 unités' },
        { label: 'Rupture', value: items.filter(i => i.quantiteDisponible === 0).length, hint: 'à réapprovisionner' },
      ]}
      columns={[
        { label: 'Référence', render: (item) => <span className="font-mono text-xs">{item.reference}</span> },
        { label: 'Nom', render: (item) => item.nom },
        { label: 'Quantité', render: (item) => item.quantiteDisponible },
        {
          label: 'Statut',
          render: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              item.quantiteDisponible > 10 ? 'bg-green-100 text-green-700' :
              item.quantiteDisponible > 0 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {item.quantiteDisponible > 10 ? 'Disponible' :
               item.quantiteDisponible > 0 ? 'Faible' : 'Rupture'}
            </span>
          )
        },
        { label: 'Prix vente', render: (item) => `${Number(item.prixVente || 0).toLocaleString('fr-MA')} DH` },
      ]}
      actions={[
        {
          label: 'Voir',
          icon: EyeIcon,
          onClick: (item) => alert(`Détails de ${item.nom}\nRéférence: ${item.reference}\nStock: ${item.quantiteDisponible}`),
          className: 'text-indigo-700 hover:bg-indigo-50'
        }
      ]}
    />
  );
};

export default StockDirecteur;