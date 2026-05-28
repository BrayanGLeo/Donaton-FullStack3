import React, { createContext, useContext, useState, useEffect } from 'react';

export type Rol = 'DONANTE' | 'LOGISTICA' | 'COORDINADOR' | 'ADMIN';

export interface Usuario {
  id: string | number;
  nombre: string;
  email?: string;
  rol: Rol;
}

interface AuthContextType {
  token: string | null;
  usuario: Usuario | null;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Restaurar sesión desde localStorage al cargar la app
    const storedToken = localStorage.getItem('donaton_token');
    const storedUser = localStorage.getItem('donaton_user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUsuario(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error al parsear el usuario almacenado', e);
      }
    }
    setIsReady(true);
  }, []);

  const login = (newToken: string, newUsuario: Usuario) => {
    setToken(newToken);
    setUsuario(newUsuario);
    localStorage.setItem('donaton_token', newToken);
    localStorage.setItem('donaton_user', JSON.stringify(newUsuario));
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('donaton_token');
    localStorage.removeItem('donaton_user');
  };

  if (!isReady) {
    return null; // Espera a que se hidrate el estado local
  }

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, isAuthenticated: !!token }}>
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
