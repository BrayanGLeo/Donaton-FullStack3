import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  rolesPermitidos?: Rol[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, rolesPermitidos }) => {
  const { isAuthenticated, usuario } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && rolesPermitidos.length > 0) {
    if (!usuario?.rol || !rolesPermitidos.includes(usuario.rol)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
