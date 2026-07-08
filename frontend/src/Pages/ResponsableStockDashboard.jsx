import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const ResponsableStockDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Tableau de bord Responsable de stock</h1>
      <p>Bienvenue {user?.name}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
};

export default ResponsableStockDashboard;