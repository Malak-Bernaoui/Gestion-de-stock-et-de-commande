import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Tableau de bord Admin</h1>
      <p>Bienvenue {user?.name}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
};

export default AdminDashboard;