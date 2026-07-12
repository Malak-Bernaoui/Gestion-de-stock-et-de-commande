import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [commandes, setCommandes] = useState([]);

  useEffect(() => {
    api.get('/client/commandes').then(res => setCommandes(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Mes commandes</h2>
      {commandes.length === 0 ? (
        <p>Aucune commande</p>
      ) : (
        <div className="space-y-4">
          {commandes.map(c => (
            <div key={c.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <p className="font-semibold">Commande #{c.id}</p>
                <p className="text-sm text-gray-600">Article : {c.materiel?.nom}</p>
                <p className="text-sm text-gray-600">Statut : {c.statut}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{c.prixTTC} €</p>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {c.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;