import React, { createContext, useContext, useState } from 'react';

export type Rol = 'DONANTE' | 'LOGISTICA' | 'COORDINADOR' | 'ADMIN';

export interface Usuario {
  id: string | number;
  nombre: string;
  nombreCompleto?: string;
  razonSocial?: string;
  tipoPersona?: string;
  email?: string;
  rol: Rol;
  sitioWeb?: string;
  subRol?: string;
  tipoVehiculo?: string;
  matricula?: string;
  centroAcopioId?: number;
  latitud?: number;
  longitud?: number;
  ultimaConexion?: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  rut?: string;
  giro?: string;
  telefono?: string;
  activo?: boolean;
}

interface AuthContextType {
  token: string | null;
  usuario: Usuario | null;
  login: (token: string, usuario: Usuario, rememberMe?: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('donaton_token') || localStorage.getItem('donaton_token'));
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const storedUser = sessionStorage.getItem('donaton_user') || localStorage.getItem('donaton_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.id != null) return parsed;
      } catch (e) {
        console.error('Error al parsear el usuario almacenado', e);
      }
    }
    return null;
  });

  const login = (newToken: string, newUsuario: Usuario, rememberMe: boolean = false) => {
    setToken(newToken);
    setUsuario(newUsuario);
    
    if (rememberMe) {
      localStorage.setItem('donaton_token', newToken);
      localStorage.setItem('donaton_user', JSON.stringify(newUsuario));
      sessionStorage.removeItem('donaton_token');
      sessionStorage.removeItem('donaton_user');
    } else {
      sessionStorage.setItem('donaton_token', newToken);
      sessionStorage.setItem('donaton_user', JSON.stringify(newUsuario));
      localStorage.removeItem('donaton_token');
      localStorage.removeItem('donaton_user');
    }
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('donaton_token');
    localStorage.removeItem('donaton_user');
    sessionStorage.removeItem('donaton_token');
    sessionStorage.removeItem('donaton_user');
  };

  const contextValue = React.useMemo(() => ({ token, usuario, login, logout, isAuthenticated: !!token }), [token, usuario]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
