import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './Pages/Login';
import AdminDashboard from './Pages/admin/AdminDashboard';
import ResponsableStockDashboard from './Pages/stock/ResponsableStockDashboard';
import GestionStock from './Pages/stock/GestionStock';
import Transferts from './Pages/stock/Transferts';
import Alertes from './Pages/stock/Alertes';
import VendeurDashboard from './Pages/vendeur/VendeurDashboard';
import ConsultationStock from './Pages/vendeur/ConsultationStock';
import CommandesVendeur from './Pages/vendeur/CommandesVendeur';
import ClientsVendeur from './Pages/vendeur/ClientsVendeur';
import FacturesVendeur from './Pages/vendeur/FacturesVendeur';
import ClientDashboard from './Pages/ClientDashboard';
import Commandes from './Pages/admin/Commandes';
import Stock from './Pages/admin/Stock';
import Clients from './Pages/admin/Clients';
import Factures from './Pages/admin/Factures';
import Partenaires from './Pages/admin/Partenaires';
import Utilisateurs from './Pages/admin/Utilisateurs';
import Reporting from './Pages/directeur/Reporting';
import StockDirecteur from './Pages/directeur/StockDirecteur';
import CommandesDirecteur from './Pages/directeur/CommandesDirecteur';
import FacturesDirecteur from './Pages/directeur/FacturesDirecteur';
import DirecteurDashboard from './Pages/directeur/DirecteurDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Routes protégées avec Layout */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="admin/commandes" element={<Commandes />} />
            <Route path="admin/stock" element={<Stock />} />
            <Route path="admin/clients" element={<Clients />} />
            <Route path="admin/factures" element={<Factures />} />
            <Route path="admin/partenaires" element={<Partenaires />} />
            <Route path="admin/users" element={<Utilisateurs />} />
            <Route path="/directeur" element={<DirecteurDashboard />} />
            <Route path="/directeur/reporting" element={<Reporting />} />
            <Route path="/directeur/stock" element={<StockDirecteur />} />
            <Route path="/directeur/commandes" element={<CommandesDirecteur />} />
            <Route path="/directeur/factures" element={<FacturesDirecteur />} />
            <Route path="/stock" element={<ResponsableStockDashboard />} />
            <Route path="stock/stock" element={<GestionStock />} />
            <Route path="stock/transferts" element={<Transferts />} />
            <Route path="stock/alertes" element={<Alertes />} />
            <Route path="/vendeur" element={<VendeurDashboard />} />
            <Route path="vendeur/stock" element={<ConsultationStock />} />
            <Route path="vendeur/commandes" element={<CommandesVendeur />} />
            <Route path="vendeur/clients" element={<ClientsVendeur />} />
            <Route path="vendeur/factures" element={<FacturesVendeur />} />
            <Route path="/client" element={<ClientDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
