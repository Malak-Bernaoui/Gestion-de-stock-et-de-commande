import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Login from './Pages/Login.jsx';
import AdminDashboard from './Pages/AdminDashboard.jsx';
import DirecteurDashboard from './Pages/DirecteurDashboard.jsx';
import ResponsableStockDashboard from './Pages/ResponsableStockDashboard.jsx';
import VendeurDashboard from './Pages/VendeurDashboard.jsx';
import ClientDashboard from './Pages/ClientDashboard.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/directeur" element={
            <PrivateRoute allowedRoles={['directeur_ventes']}>
              <DirecteurDashboard />
            </PrivateRoute>
          } />
          <Route path="/stock" element={
            <PrivateRoute allowedRoles={['responsable_stock']}>
              <ResponsableStockDashboard />
            </PrivateRoute>
          } />
          <Route path="/vendeur" element={
            <PrivateRoute allowedRoles={['vendeur']}>
              <VendeurDashboard />
            </PrivateRoute>
          } />
          <Route path="/client" element={
            <PrivateRoute allowedRoles={['client']}>
              <ClientDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;