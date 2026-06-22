import axios from 'axios';

export interface DonacionPayload {
  recurso?: string;
  cantidad?: number;
  origen?: string;
  estado?: string;
  categoria?: string;
  descripcion?: string;
  estadoArticulo?: string;
  fechaVencimiento?: string;
  unidadMedida?: string;
  pesoAproximado?: number;
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
}

export interface DonacionResponse extends DonacionPayload {
  id: number;
  trackingId?: string;
  fechaRegistro: string;
  nombreDonante?: string;
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
