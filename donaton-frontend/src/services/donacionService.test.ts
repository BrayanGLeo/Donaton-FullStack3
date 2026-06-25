import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { 
  registrarDonacion,
  listarDonaciones,
  actualizarEstadoDonacion,
  asignarConductor
} from './donacionService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('donacionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registrarDonacion con token', async () => {
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue('mocked_token');
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
    const data = await registrarDonacion({} as any);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/donaciones'), 
      expect.any(Object), 
      { headers: { Authorization: 'Bearer mocked_token' } }
    );
    expect(data).toEqual({ id: 1 });
  });

  it('registrarDonacion sin token', async () => {
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 2 } });
    const data = await registrarDonacion({} as any);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/donaciones'), 
      expect.any(Object), 
      { headers: {} }
    );
    expect(data).toEqual({ id: 2 });
  });

  it('listarDonaciones', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const data = await listarDonaciones();
    expect(data).toEqual([{ id: 1 }]);
  });

  it('actualizarEstadoDonacion', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });
    const data = await actualizarEstadoDonacion(1, 'ENTREGADO');
    expect(data).toEqual({ success: true });
  });

  it('asignarConductor', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });
    const data = await asignarConductor(1, 2);
    expect(data).toEqual({ success: true });
  });

  // PRUEBAS DE ERROR
  it('maneja errores en registrarDonacion', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    await expect(registrarDonacion({} as any)).rejects.toThrow('Network error');
  });

  it('maneja errores en listarDonaciones', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(listarDonaciones()).rejects.toThrow('Network error');
  });

  it('maneja errores en actualizarEstadoDonacion', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));
    await expect(actualizarEstadoDonacion(1, 'ENTREGADO')).rejects.toThrow('Network error');
  });

  it('maneja errores en asignarConductor', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));
    await expect(asignarConductor(1, 2)).rejects.toThrow('Network error');
  });
});
