import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/common/Navigation';
import LandingPage from './components/common/LandingPage';
import Login from './components/auth/Login';
import Registro from './components/auth/Registro';
import RecuperarPassword from './components/auth/RecuperarPassword';
import ProtectedRoute from './components/common/ProtectedRoute';
import { DonacionForm } from './components/donante/DonacionForm';
import { DonacionList } from './components/donante/DonacionList';
import PerfilDonante from './components/donante/PerfilDonante';
import DashboardCoordinador from './components/coordinador/DashboardCoordinador';
import HistorialAcopio from './components/acopio/HistorialAcopio';
import IngresarNecesidad from './components/coordinador/IngresarNecesidad';
import AdminDashboard from './components/admin/AdminDashboard';
import PanelAdminAcopio from './components/acopio/PanelAdminAcopio';
import PanelConductor from './components/conductor/PanelConductor';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontWeight: '500', borderRadius: '10px' } }} />
      <Navigation />
      <main className="flex-grow-1">
        {children}
      </main>
      
      <footer className="bg-dark text-light py-4 mt-auto">
        <div className="container text-center">
          <p className="mb-0 text-white-50">© 2026 Sistema Donatón. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDonacionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/recuperar-password" element={<RecuperarPassword />} />
            <Route path="/historial-acopio" element={
              <div className="container-fluid py-5 px-xl-5">
                <HistorialAcopio />
              </div>
            } />
            
            {/* Rutas Protegidas - Solo DONANTE */}
            <Route path="/donar" element={
              <ProtectedRoute rolesPermitidos={['DONANTE']}>
                <div className="container py-5">
                  <DonacionForm onSuccess={handleDonacionSuccess} />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/mis-donaciones" element={
              <ProtectedRoute rolesPermitidos={['DONANTE']}>
                <div className="container py-5">
                  <DonacionList refreshTrigger={refreshTrigger} />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute rolesPermitidos={['DONANTE']}>
                <PerfilDonante />
              </ProtectedRoute>
            } />

            {/* Rutas Protegidas - Solo ADMINISTRADOR DE ACOPIO (LOGISTICA) */}
            <Route path="/admin-acopio" element={
              <ProtectedRoute rolesPermitidos={['LOGISTICA']} subRolesPermitidos={['RECEPCIONISTA']}>
                <PanelAdminAcopio />
              </ProtectedRoute>
            } />
            <Route path="/panel-conductor" element={
              <ProtectedRoute rolesPermitidos={['LOGISTICA']} subRolesPermitidos={['CONDUCTOR']}>
                <PanelConductor />
              </ProtectedRoute>
            } />
            
            {/* Rutas Protegidas - Solo COORDINADOR */}
            <Route path="/dashboard" element={
              <ProtectedRoute rolesPermitidos={['COORDINADOR']}>
                <DashboardCoordinador />
              </ProtectedRoute>
            } />
            <Route path="/ingresar-necesidad" element={
              <ProtectedRoute rolesPermitidos={['COORDINADOR']}>
                <IngresarNecesidad />
              </ProtectedRoute>
            } />

            {/* Rutas Protegidas - Solo ADMIN */}
            <Route path="/admin" element={
              <ProtectedRoute rolesPermitidos={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
