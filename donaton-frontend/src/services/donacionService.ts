import axios from 'axios';

export interface DonacionPayload {
  nombreArticulo?: string;
  recursos?: string; // JSON string
  origen?: string;
  estado?: string;
  descripcion?: string;
  fotoBase64?: string;
  modalidadEntrega?: string;
  centroAcopioDestinoId?: number;
  direccionRetiro?: string;
  disponibilidadHoraria?: string;
  transporteEspecial?: boolean;
  regionRetiro?: string;
  comunaRetiro?: string;
  latitudRetiro?: number | null;
  longitudRetiro?: number | null;
  visibilidad?: string;
  direccionRetiroCalle?: string;
  direccionRetiroNumero?: string;
  donanteId?: number;
  conductorId?: number;
}

export interface DonacionResponse extends DonacionPayload {
  id: number;
  trackingId?: string;
  fechaRegistro: string;
  fechaActualizacion?: string;
  nombreDonante?: string;
  conductorId?: number;
}

export const registrarDonacion = async (payload: DonacionPayload): Promise<DonacionResponse> => {
  try {
    const token = localStorage.getItem('donaton_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post<DonacionResponse>('/api/donaciones', payload, { headers });
    return response.data;
  } catch (error) {
    console.error('Error al registrar la donación:', error);
    throw error;
  }
};

export const listarDonaciones = async (): Promise<DonacionResponse[]> => {
  try {
    const response = await axios.get<DonacionResponse[]>('/api/donaciones');
    return response.data;
  } catch (error) {
    console.error('Error al obtener las donaciones:', error);
    throw error;
  }
};

export const actualizarEstadoDonacion = async (id: number, estado: string): Promise<DonacionResponse> => {
  try {
    const response = await axios.put<DonacionResponse>(`/api/donaciones/${id}/estado`, { estado });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar el estado de la donación:', error);
    throw error;
  }
};

export const asignarConductor = async (id: number, conductorId: number): Promise<DonacionResponse> => {
  try {
    const response = await axios.put<DonacionResponse>(`/api/donaciones/${id}/conductor/${conductorId}`);
    return response.data;
  } catch (error) {
    console.error('Error al asignar el conductor a la donación:', error);
    throw error;
  }
};
