import axios from 'axios';

export interface Necesidad {
  id: number;
  recursos: string;
  latitud: number;
  longitud: number;
  fechaReporte: string;
  tipoEmergencia?: string;
}

export const obtenerNecesidades = async (): Promise<Necesidad[]> => {
  try {
    const response = await axios.get<Necesidad[]>('/api/bff/necesidades');
    return response.data;
  } catch (error) {
    console.error('Error al obtener necesidades del BFF:', error);
    throw error;
  }
};

export const ingresarNecesidad = async (necesidad: Omit<Necesidad, 'id' | 'fechaReporte'>): Promise<Necesidad> => {
  try {
    const response = await axios.post<Necesidad>('/api/bff/necesidades', necesidad);
    return response.data;
  } catch (error) {
    console.error('Error al ingresar necesidad:', error);
    throw error;
  }
};

