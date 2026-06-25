import axios from 'axios';

const getHeaders = () => {
  const token = localStorage.getItem('donaton_token') || sessionStorage.getItem('donaton_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface InventarioItem {
  id: number;
  recurso: string;
  cantidadTotal: number;
}

export interface DespachoRequest {
  inventarioId: number;
  cantidad: number;
  vehiculo: string;
  horario: string;
}

export interface DespachoItem {
  id: number;
  inventarioId: number;
  cantidadDespachada: number;
  vehiculo: string;
  estado: string;
}

export interface CentroAcopio {
  id: number;
  nombre: string;
  region: string;
  comuna: string;
  direccion: string;
  latitud?: number;
  longitud?: number;
}

export const obtenerInventario = async (): Promise<InventarioItem[]> => {
  const response = await axios.get('/api/logistica/inventario', { headers: getHeaders() });
  return response.data;
};

export const obtenerDespachos = async (): Promise<DespachoItem[]> => {
  const response = await axios.get('/api/logistica/despachos', { headers: getHeaders() });
  return response.data;
};

export const asignarTransporte = async (request: DespachoRequest): Promise<DespachoItem> => {
  const response = await axios.post('/api/logistica/despachos', request, { headers: getHeaders() });
  return response.data;
};

export const confirmarIngresoAcopio = async (trackingId: string): Promise<any> => {
  const response = await axios.put(`/api/logistica/ingreso/${trackingId}`, {}, { headers: getHeaders() });
  return response.data;
};

export const confirmarEntrega = async (id: number): Promise<string> => {
  const response = await axios.put(`/api/logistica/despachos/${id}/entrega`, {}, { headers: getHeaders() });
  return response.data;
};

export const obtenerCentrosAcopio = async (): Promise<CentroAcopio[]> => {
  const response = await axios.get('/api/logistica/centros-acopio', { headers: getHeaders() });
  return response.data;
};

export const obtenerCentrosAcopioPorRegion = async (region: string): Promise<CentroAcopio[]> => {
  const response = await axios.get(`/api/logistica/centros-acopio/region/${encodeURIComponent(region)}`, { headers: getHeaders() });
  return response.data;
};
