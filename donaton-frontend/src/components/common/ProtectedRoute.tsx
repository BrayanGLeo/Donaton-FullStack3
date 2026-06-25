import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Rol } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  rolesPermitidos?: Rol[];
  subRolesPermitidos?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, rolesPermitidos, subRolesPermitidos }) => {
  const { isAuthenticated, usuario } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && rolesPermitidos.length > 0) {
    if (!usuario?.rol || !rolesPermitidos.includes(usuario.rol)) {
      return <Navigate to="/" replace />;
    }
  }

  if (subRolesPermitidos && subRolesPermitidos.length > 0) {
    if (!usuario?.subRol || !subRolesPermitidos.includes(usuario.subRol)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

