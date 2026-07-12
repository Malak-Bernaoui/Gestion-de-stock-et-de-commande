import { NavLink } from 'react-router-dom';

const Sidebar = ({ role }) => {
  const getMenu = () => {
    const items = {
      admin: [
        { label: 'Dashboard', path: '/admin' },
        { label: 'Utilisateurs', path: '/admin/users' },
        { label: 'Référentiels', path: '/admin/referentiels' },
        { label: 'Stock', path: '/admin/stock' },
        { label: 'Clients', path: '/admin/clients' },
        { label: 'Commandes', path: '/admin/commandes' },
        { label: 'Factures', path: '/admin/factures' },
      ],
      directeur_ventes: [
        { label: 'Dashboard', path: '/directeur' },
        { label: 'Reporting', path: '/directeur/reporting' },
        { label: 'Stock', path: '/directeur/stock' },
        { label: 'Commandes', path: '/directeur/commandes' },
        { label: 'Factures', path: '/directeur/factures' },
      ],
      responsable_stock: [
        { label: 'Dashboard', path: '/stock' },
        { label: 'Stock', path: '/stock/stock' },
        { label: 'Transferts', path: '/stock/transferts' },
        { label: 'Alertes', path: '/stock/alertes' },
      ],
      vendeur: [
        { label: 'Dashboard', path: '/vendeur' },
        { label: 'Consultation stock', path: '/vendeur/stock' },
        { label: 'Commandes', path: '/vendeur/commandes' },
        { label: 'Clients', path: '/vendeur/clients' },
        { label: 'Factures', path: '/vendeur/factures' },
      ],
    };
    return items[role] || [];
  };

  const menu = getMenu();

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-gray-700">
        Gestion Stock
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menu.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded hover:bg-gray-700 ${
                    isActive ? 'bg-gray-700 font-semibold' : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;