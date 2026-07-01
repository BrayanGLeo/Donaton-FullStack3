import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { 
  obtenerInventario,
  obtenerDespachos,
  asignarTransporte,
  confirmarIngresoAcopio,
  confirmarEntrega,
  obtenerCentrosAcopio,
  obtenerCentrosAcopioPorRegion
} from './logisticaService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('logisticaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtenerInventario', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const data = await obtenerInventario();
    expect(data).toEqual([{ id: 1 }]);
  });

  it('usa token si esta presente', async () => {
    localStorage.setItem('donaton_token', 'fake-token');
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    await obtenerInventario();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { Authorization: 'Bearer fake-token' }
      })
    );
    localStorage.removeItem('donaton_token');
  });

  it('obtenerDespachos', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const data = await obtenerDespachos();
    expect(data).toEqual([{ id: 1 }]);
  });

  it('asignarTransporte', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
    const data = await asignarTransporte({} as any);
    expect(data).toEqual({ success: true });
  });

  it('confirmarIngresoAcopio', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });
    const data = await confirmarIngresoAcopio('TRK-123');
    expect(data).toEqual({ success: true });
  });

  it('confirmarEntrega', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: 'OK' });
    const data = await confirmarEntrega(1);
    expect(data).toEqual('OK');
  });

  it('obtenerCentrosAcopio', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const data = await obtenerCentrosAcopio();
    expect(data).toEqual([{ id: 1 }]);
  });

  it('obtenerCentrosAcopioPorRegion', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const data = await obtenerCentrosAcopioPorRegion('Metropolitana');
    expect(data).toEqual([{ id: 1 }]);
  });
});
