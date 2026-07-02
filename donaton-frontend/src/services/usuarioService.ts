import axios from 'axios';
import type { Usuario } from '../context/AuthContext';

const getHeaders = () => {
  const token = localStorage.getItem('donaton_token') || sessionStorage.getItem('donaton_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export interface UsuarioFiltros {
  rol?: string;
  region?: string;
  comuna?: string;
  rut?: string;
  nombre?: string;
  activo?: string | boolean;
  page?: number;
  size?: number;
  sortField?: string;
  sortDir?: string;
}

export const obtenerUsuarios = async (filtros?: UsuarioFiltros): Promise<PageResponse<Usuario>> => {
  try {
    const cleanFiltros = Object.fromEntries(
      Object.entries(filtros || {}).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    const response = await axios.get<PageResponse<Usuario>>('/api/auth/usuarios', { params: cleanFiltros, headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    throw error;
  }
};

export const obtenerUsuariosStats = async (): Promise<{ total: number; activos: number; donantes: number; logistica: number }> => {
  try {
    const response = await axios.get('/api/auth/admin/usuarios/stats', { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error al obtener stats:', error);
    throw error;
  }
};

export const registrarUsuarioAdmin = async (nuevoUsuario: Partial<Usuario> & { password?: string }): Promise<string> => {
  try {
    const response = await axios.post('/api/auth/admin/registro', nuevoUsuario, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

export const registrarDonante = async (datos: Record<string, unknown>): Promise<string> => {
  try {
    const response = await axios.post('/api/auth/registro', datos); // Public endpoint
    return response.data;
  } catch (error) {
    console.error('Error al registrar donante:', error);
    throw error;
  }
};

export interface CentroAcopio {
  id: number;
  nombre: string;
  region: string;
  comuna: string;
  direccion: string;
}

export const obtenerCentrosAcopioPorRegion = async (region: string): Promise<CentroAcopio[]> => {
  if (!region) return [];
  try {
    const response = await axios.get<CentroAcopio[]>(`/api/logistica/centros-acopio/region/${region}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener centros de acopio:', error);
    return [];
  }
};

export const verificarEmailDisponible = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.get('/api/auth/verificar-email', { params: { email } });
    return response.data.disponible ?? true;
  } catch (error: any) {
    if (error.response?.status === 409) return false;
    console.warn('Endpoint verificar-email no disponible', error);
    return true; // En caso de error de red o que el endpoint no exista, dejamos pasar la validación
  }
};

export const verificarRutDisponible = async (rut: string): Promise<boolean> => {
  try {
    const response = await axios.get('/api/auth/verificar-rut', { params: { rut } });
    return response.data.disponible ?? true;
  } catch (error: any) {
    if (error.response?.status === 409) return false;
    console.warn('Endpoint verificar-rut no disponible', error);
    return true;
  }
};

export const actualizarUsuario = async (id: number, datos: Partial<Usuario>): Promise<void> => {
  try {
    await axios.put(`/api/auth/admin/usuarios/${id}`, datos, { headers: getHeaders() });
  } catch (error) {
    console.error(`Error al actualizar el usuario ${id}:`, error);
    throw error;
  }
};

export const eliminarUsuario = async (id: number): Promise<void> => {
  try {
    await axios.delete(`/api/auth/admin/usuarios/${id}`, { headers: getHeaders() });
  } catch (error) {
    console.error(`Error al eliminar (desactivar) el usuario ${id}:`, error);
    throw error;
  }
};

export const reactivarUsuario = async (id: number): Promise<void> => {
  try {
    await axios.put(`/api/auth/admin/usuarios/${id}/reactivar`, {}, { headers: getHeaders() });
  } catch (error) {
    console.error(`Error al reactivar usuario con id ${id}:`, error);
    throw error;
  }
};

export const actualizarEstadoMasivoUsuarios = async (ids: number[], activo: boolean): Promise<void> => {
  try {
    await axios.put('/api/auth/admin/usuarios/bulk-status', { ids, activo }, { headers: getHeaders() });
  } catch (error) {
    console.error('Error al actualizar estado masivo:', error);
    throw error;
  }
};

export const cambiarPassword = async (id: number, currentPassword: string, newPassword: string): Promise<void> => {
  try {
    await axios.put(`/api/auth/usuarios/${id}/password`, { currentPassword, newPassword }, { headers: getHeaders() });
  } catch (error) {
    console.error(`Error al cambiar contraseña para el usuario ${id}:`, error);
    throw error;
  }
};
