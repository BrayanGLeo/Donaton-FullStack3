import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { 
  obtenerNecesidades,
  ingresarNecesidad,
  actualizarEstadoNecesidad,
  consumirInventario,
  obtenerHistorialNecesidades
} from './bffService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('bffService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtenerNecesidades', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const data = await obtenerNecesidades();
    expect(data).toEqual([{ id: 1 }]);
  });

  it('ingresarNecesidad', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
    const data = await ingresarNecesidad({} as any);
    expect(data).toEqual({ id: 1 });
  });

  it('actualizarEstadoNecesidad', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });
    const data = await actualizarEstadoNecesidad(1, 'EN_PROCESO');
    expect(data).toEqual({ success: true });
  });

  it('consumirInventario', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: 'OK' });
    await consumirInventario('Agua', 10);
    expect(mockedAxios.post).toHaveBeenCalled();
  });

  it('obtenerHistorialNecesidades', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const data = await obtenerHistorialNecesidades();
    expect(data).toEqual([{ id: 1 }]);
  });
});
