import axios from 'axios';

export interface DonacionPayload {
  recurso: string;
  cantidad: number;
  origen: string;
}

export interface DonacionResponse extends DonacionPayload {
  id: number;
  estado: string;
  trackingId?: string;
  fechaRegistro: string;
}

export const registrarDonacion = async (payload: DonacionPayload): Promise<DonacionResponse> => {
  try {
    const response = await axios.post<DonacionResponse>('/api/donaciones', payload);
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
