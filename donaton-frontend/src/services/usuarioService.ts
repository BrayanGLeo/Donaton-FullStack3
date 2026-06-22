import axios from 'axios';
import type { Usuario } from '../context/AuthContext';

export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  try {
    const response = await axios.get<Usuario[]>('/api/auth/usuarios');
    return response.data;
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    throw error;
  }
};

export const registrarUsuarioAdmin = async (nuevoUsuario: Partial<Usuario> & { password?: string }): Promise<string> => {
  try {
    const response = await axios.post('/api/auth/admin/registro', nuevoUsuario);
    return response.data;
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
};

export const registrarDonante = async (datos: Record<string, unknown>): Promise<string> => {
  try {
    const response = await axios.post('/api/auth/registro', datos);
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
