import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Tableau de bord Client</h1>
      <p>Bienvenue {user?.name}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
};

export default ClientDashboard;