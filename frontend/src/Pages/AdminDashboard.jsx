import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  CubeIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ArrowRightOnRectangleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    users: 0,
    clients: 0,
    materiels: 0,
    commandes: 0,
    factures: 0,
    references: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [recentFactures, setRecentFactures] = useState([]);
  const [recentReferences, setRecentReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Get counts (using limit=1 and x-total-count header)
        const [
          usersRes,
          clientsRes,
          materielsRes,
          commandesRes,
          facturesRes,
          referencesRes,
        ] = await Promise.all([
          api.get('/users?limit=1'),
          api.get('/clients?limit=1'),
          api.get('/materiels?limit=1'),
          api.get('/commandes?limit=1'),
          api.get('/factures?limit=1'),
          api.get('/references?limit=1'), // adjust to your endpoint
        ]);

        setStats({
          users: usersRes.headers['x-total-count'] || usersRes.data.length,
          clients: clientsRes.headers['x-total-count'] || clientsRes.data.length,
          materiels: materielsRes.headers['x-total-count'] || materielsRes.data.length,
          commandes: commandesRes.headers['x-total-count'] || commandesRes.data.length,
          factures: facturesRes.headers['x-total-count'] || facturesRes.data.length,
          references: referencesRes.headers['x-total-count'] || referencesRes.data.length,
        });

        // 2. Fetch recent lists (last 5)
        const [orders, clients, factures, references] = await Promise.all([
          api.get('/commandes?limit=5&sort=-created_at'),
          api.get('/clients?limit=5&sort=-created_at'),
          api.get('/factures?limit=5&sort=-created_at'),
          api.get('/references?limit=5&sort=-created_at'),
        ]);

        setRecentOrders(orders.data || []);
        setRecentClients(clients.data || []);
        setRecentFactures(factures.data || []);
        setRecentReferences(references.data || []);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
        setError('Impossible de charger les données du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm max-w-md">
          <p className="font-semibold">❌ Une erreur est survenue</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 inline-block text-sm bg-red-100 hover:bg-red-200 px-4 py-2 rounded-md transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow-sm hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-extrabold text-blue-600 tracking-tight">
            Gestion Stock
          </h1>
          <p className="text-xs text-gray-400 mt-1">Administration</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem icon={HomeIcon} label="Tableau de bord" active />
          <SidebarItem icon={UsersIcon} label="Utilisateurs" />
          <SidebarItem icon={BookOpenIcon} label="Référentiels" />
          <SidebarItem icon={CubeIcon} label="Stock" />
          <SidebarItem icon={UserGroupIcon} label="Clients" />
          <SidebarItem icon={ShoppingCartIcon} label="Commandes" />
          <SidebarItem icon={DocumentTextIcon} label="Factures" />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">{user?.email || 'admin@example.com'}</p>
            </div>
            <button
              onClick={logout}
              className="p-1 text-gray-400 hover:text-red-500 transition"
              title="Déconnexion"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Tableau de bord</h2>
            <p className="text-sm text-gray-500 mt-1">
              Bienvenue, <span className="font-medium text-gray-700">{user?.name || 'Admin'}</span> 👋
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              Administrateur
            </span>
            <span className="text-xs text-gray-400">
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Utilisateurs"
            value={stats.users}
            color="blue"
            icon={<UsersIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Clients"
            value={stats.clients}
            color="green"
            icon={<UserGroupIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Articles"
            value={stats.materiels}
            color="purple"
            icon={<CubeIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Commandes"
            value={stats.commandes}
            color="orange"
            icon={<ShoppingCartIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Factures"
            value={stats.factures}
            color="red"
            icon={<DocumentTextIcon className="w-6 h-6" />}
          />
          <StatCard
            title="Référentiels"
            value={stats.references}
            color="teal"
            icon={<BookOpenIcon className="w-6 h-6" />}
          />
        </div>

        {/* Recent Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <RecentTable
            title="Dernières commandes"
            icon={<ClockIcon className="w-5 h-5 text-blue-500" />}
            headers={['ID', 'Client', 'Total', 'Statut', 'Date']}
            data={recentOrders}
            renderRow={(order) => (
              <>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">#{order.id}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{order.client?.nom || 'N/A'}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.total} €</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                      order.statut === 'livrée'
                        ? 'bg-green-100 text-green-700'
                        : order.statut === 'en cours'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {order.statut || 'En attente'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString('fr-FR')}
                </td>
              </>
            )}
            emptyMessage="Aucune commande récente."
          />

          {/* Recent Clients */}
          <RecentTable
            title="Clients récents"
            icon={<UserGroupIcon className="w-5 h-5 text-green-500" />}
            headers={['Nom', 'Email', 'Téléphone', 'Date']}
            data={recentClients}
            renderRow={(client) => (
              <>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{client.nom}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{client.email}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{client.telephone}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(client.created_at).toLocaleDateString('fr-FR')}
                </td>
              </>
            )}
            emptyMessage="Aucun client récent."
          />

          {/* Recent Factures */}
          <RecentTable
            title="Factures récentes"
            icon={<DocumentTextIcon className="w-5 h-5 text-red-500" />}
            headers={['N°', 'Client', 'Total', 'Date']}
            data={recentFactures}
            renderRow={(facture) => (
              <>
                <td className="px-4 py-3 text-sm font-mono text-gray-600">#{facture.id}</td>
                <td className="px-4 py-3 text-sm text-gray-800">{facture.client?.nom || 'N/A'}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{facture.montant} €</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(facture.created_at).toLocaleDateString('fr-FR')}
                </td>
              </>
            )}
            emptyMessage="Aucune facture récente."
          />

          {/* Recent References */}
          <RecentTable
            title="Référentiels récents"
            icon={<BookOpenIcon className="w-5 h-5 text-teal-500" />}
            headers={['Nom', 'Type', 'Date']}
            data={recentReferences}
            renderRow={(ref) => (
              <>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{ref.nom}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{ref.type || 'Catégorie'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(ref.created_at).toLocaleDateString('fr-FR')}
                </td>
              </>
            )}
            emptyMessage="Aucun référentiel récent."
          />
        </div>
      </main>
    </div>
  );
};

// ---------- Sidebar Item ----------
const SidebarItem = ({ icon: Icon, label, active = false }) => (
  <a
    href="#"
    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition ${
      active
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </a>
);

// ---------- Stat Card ----------
const StatCard = ({ title, value, color, icon }) => {
  const colorMap = {
    blue: 'border-blue-500 bg-blue-50 text-blue-700',
    green: 'border-green-500 bg-green-50 text-green-700',
    purple: 'border-purple-500 bg-purple-50 text-purple-700',
    orange: 'border-orange-500 bg-orange-50 text-orange-700',
    red: 'border-red-500 bg-red-50 text-red-700',
    teal: 'border-teal-500 bg-teal-50 text-teal-700',
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-l-4 ${colorMap[color]} p-5 transition hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-extrabold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-50 text-${color}-500`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ---------- Recent Table Component ----------
const RecentTable = ({ title, icon, headers, data, renderRow, emptyMessage }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition hover:shadow-md">
    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
        {data.length} récent{data.length > 1 ? 's' : ''}
      </span>
    </div>
    <div className="overflow-x-auto">
      {data.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">{emptyMessage}</div>
      ) : (
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                {renderRow(item)}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);

export default AdminDashboard;