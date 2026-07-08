import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function DirecteurDashboard() {
    const { user, logout } = useAuth();
    return (
        <div>
            <h1>Tableau de bord Directeur des ventes</h1>
            <p>Bienvenue {user?.name}</p>
            <button onClick={logout}>Déconnexion</button>
        </div>
    );
}

export default DirecteurDashboard;