import { useEffect, useState } from 'react';
import api from '../api/axios';

const ResponsableStockDashboard = () => {
  const [alertes, setAlertes] = useState([]);

  useEffect(() => {
    api.get('/stock/alertes').then(res => setAlertes(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestion du stock</h2>
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">Alertes de réapprovisionnement</h3>
        {alertes.length === 0 ? (
          <p className="text-green-600">✅ Aucun stock critique</p>
        ) : (
          <ul className="divide-y">
            {alertes.map(a => (
              <li key={a.id} className="py-2 flex justify-between">
                <span>{a.nom} (réf. {a.reference})</span>
                <span className="text-red-500">Stock : {a.quantiteDisponible}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Transfert de stock</h3>
        {/* Formulaire de transfert */}
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Article" className="border p-2 rounded" />
            <input type="number" placeholder="Quantité" className="border p-2 rounded" />
          </div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">Transférer</button>
        </form>
      </div>
    </div>
  );
};

export default ResponsableStockDashboard;