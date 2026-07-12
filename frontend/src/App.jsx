import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DirecteurDashboard from './pages/DirecteurDashboard';
import ResponsableStockDashboard from './pages/ResponsableStockDashboard';
import VendeurDashboard from './pages/VendeurDashboard';
import ClientDashboard from './pages/ClientDashboard';

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
            <Route path="/directeur" element={<DirecteurDashboard />} />
            <Route path="/stock" element={<ResponsableStockDashboard />} />
            <Route path="/vendeur" element={<VendeurDashboard />} />
            <Route path="/client" element={<ClientDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;