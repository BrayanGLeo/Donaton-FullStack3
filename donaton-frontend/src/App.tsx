import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Registro from './components/Registro';
import ProtectedRoute from './components/ProtectedRoute';
import { DonacionForm } from './components/DonacionForm';
import { DonacionList } from './components/DonacionList';
import PanelLogistico from './components/PanelLogistico';
import DashboardCoordinador from './components/DashboardCoordinador';
import ControlIngreso from './components/ControlIngreso';
import { PanelConductor } from './components/PanelConductor';
import HistorialAcopio from './components/HistorialAcopio';
import IngresarNecesidad from './components/IngresarNecesidad';
import AdminDashboard from './components/AdminDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
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
            <Route path="/historial-acopio" element={
              <ProtectedRoute rolesPermitidos={['DONANTE']}>
                <div className="container py-5">
                  <HistorialAcopio />
                </div>
              </ProtectedRoute>
            } />

            {/* Rutas Protegidas - Solo LOGISTICA */}
            <Route path="/logistica" element={
              <ProtectedRoute rolesPermitidos={['LOGISTICA']}>
                <div className="container py-5">
                  <PanelLogistico />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/recepcion" element={
              <ProtectedRoute rolesPermitidos={['LOGISTICA']}>
                <div className="container py-5">
                  <ControlIngreso />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/conductor" element={
              <ProtectedRoute rolesPermitidos={['LOGISTICA']}>
                <div className="container py-5">
                  <PanelConductor />
                </div>
              </ProtectedRoute>
            } />
            
            {/* Rutas Protegidas - Solo COORDINADOR */}
            <Route path="/dashboard" element={
              <ProtectedRoute rolesPermitidos={['COORDINADOR']}>
                <div className="container py-5">
                  <DashboardCoordinador />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/ingresar-necesidad" element={
              <ProtectedRoute rolesPermitidos={['COORDINADOR']}>
                <div className="container py-5">
                  <IngresarNecesidad />
                </div>
              </ProtectedRoute>
            } />

            {/* Rutas Protegidas - Solo ADMIN */}
            <Route path="/admin" element={
              <ProtectedRoute rolesPermitidos={['ADMIN']}>
                <div className="container py-5">
                  <AdminDashboard />
                </div>
              </ProtectedRoute>
            } />

          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
