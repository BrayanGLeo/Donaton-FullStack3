import axios from 'axios';

const getHeaders = () => {
  const token = localStorage.getItem('donaton_token') || sessionStorage.getItem('donaton_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Necesidad {
  id: number;
  recursos: string;
  latitud: number;
  longitud: number;
  fechaReporte: string;
  fechaActualizacion?: string;
  tipoEmergencia?: string;
  estado?: string;
  region?: string;
  comuna?: string;
  conductorId?: number;
  coordinadorId?: number;
  centroAcopioId?: number;
}

export const obtenerNecesidades = async (): Promise<Necesidad[]> => {
  try {
    const response = await axios.get<Necesidad[]>('/api/bff/necesidades', { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error al obtener necesidades del BFF:', error);
    throw error;
  }
};

export const ingresarNecesidad = async (necesidad: Omit<Necesidad, 'id' | 'fechaReporte'>): Promise<Necesidad> => {
  try {
    const response = await axios.post<Necesidad>('/api/necesidades', necesidad, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error al ingresar necesidad:', error);
    throw error;
  }
};

export const actualizarEstadoNecesidad = async (id: number, estado: string, centroAcopioId?: number, conductorId?: number): Promise<Necesidad> => {
  try {
    const payload: Record<string, string> = { estado };
    if (centroAcopioId) {
      payload.centroAcopioId = centroAcopioId.toString();
    }
    if (conductorId) {
      payload.conductorId = conductorId.toString();
    }
    const response = await axios.put<Necesidad>(`/api/bff/necesidades/${id}/estado`, payload, { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el estado de la necesidad:', error);
    throw error;
  }
};

export const consumirInventario = async (recurso: string, cantidad: number): Promise<void> => {
  try {
    await axios.post('/api/bff/logistica/inventario/consumir', { recurso, cantidad }, { headers: getHeaders() });
  } catch (error) {
    console.error('Error al consumir inventario:', error);
    throw error;
  }
};

export interface HistorialNecesidad {
  id: number;
  necesidadId: number;
  categoria: string;
  cantidad: number;
  unidad: string;
  fechaCubierta: string;
  region: string;
  comuna: string;
  centroAcopioId?: number;
}

export const obtenerHistorialNecesidades = async (): Promise<HistorialNecesidad[]> => {
  try {
    const response = await axios.get<HistorialNecesidad[]>('/api/bff/necesidades/historial', { headers: getHeaders() });
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de necesidades:', error);
    throw error;
  }
};
