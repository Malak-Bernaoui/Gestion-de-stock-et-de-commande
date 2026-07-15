import { DocumentTextIcon } from '@heroicons/react/24/outline';
import DirecteurResourcePage from './DirecteurResourcePage';
import { EyeIcon } from '@heroicons/react/24/outline';

const FacturesDirecteur = () => {
  const normalize = (data) =>
    data.map(item => ({
      ...item,
      commande_ref: item.commande ? `CMD-${item.commande.id}` : '—',
      client_nom: item.commande?.client?.nom || 'NR',
      montant: item.commande?.prixTTC || 0,
    }));

  return (
    <DirecteurResourcePage
      title="Factures générées"
      description="Suivi des factures et montants."
      endpoint="/factures"
      icon={DocumentTextIcon}
      normalize={normalize}
      getSearchText={(item) => `${item.reference} ${item.client_nom}`}
      getMetrics={(items) => [
        { label: 'Total factures', value: items.length, hint: 'documents générés' },
        {
          label: 'Montant total',
          value: `${items.reduce((s, i) => s + Number(i.montant || 0), 0).toLocaleString('fr-MA')} DH`,
          hint: 'cumulé',
        },
        {
          label: 'Ce mois',
          value: items.filter(i => new Date(i.created_at).getMonth() === new Date().getMonth()).length,
          hint: new Date().toLocaleString('fr', { month: 'long' }),
        },
      ]}
      columns={[
        { label: 'Référence', render: (item) => <span className="font-mono font-semibold text-indigo-700">{item.reference}</span> },
        { label: 'Commande', render: (item) => item.commande_ref },
        { label: 'Client', render: (item) => item.client_nom },
        {
          label: 'Montant',
          render: (item) => `${Number(item.montant || 0).toLocaleString('fr-MA')} DH`,
          className: 'text-right font-semibold'
        },
        {
          label: 'Date',
          render: (item) => item.date_generation ? new Date(item.date_generation).toLocaleDateString('fr-FR') : '—'
        },
      ]}
      actions={[
        {
          label: 'Voir',
          icon: EyeIcon,
          onClick: (item) => alert(`Facture ${item.reference}\nClient: ${item.client_nom}\nMontant: ${item.montant} DH`),
          className: 'text-indigo-700 hover:bg-indigo-50'
        }
      ]}
    />
  );
};

export default FacturesDirecteur;