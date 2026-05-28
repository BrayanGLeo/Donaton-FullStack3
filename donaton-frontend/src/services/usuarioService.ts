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
