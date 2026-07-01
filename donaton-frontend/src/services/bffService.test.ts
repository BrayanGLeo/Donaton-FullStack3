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

  it('actualizarEstadoNecesidad con centroAcopio y conductor', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { id: 1, estado: 'ACTUALIZADO' } });
    const data = await actualizarEstadoNecesidad(1, 'ACTUALIZADO', 99, 100);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      '/api/bff/necesidades/1/estado',
      { estado: 'ACTUALIZADO', centroAcopioId: '99', conductorId: '100' },
      expect.any(Object)
    );
    expect(data).toEqual({ id: 1, estado: 'ACTUALIZADO' });
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

  // PRUEBAS DE ERROR
  it('maneja errores en obtenerNecesidades', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(obtenerNecesidades()).rejects.toThrow('Network error');
  });

  it('maneja errores en ingresarNecesidad', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    await expect(ingresarNecesidad({} as any)).rejects.toThrow('Network error');
  });

  it('maneja errores en actualizarEstadoNecesidad', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));
    await expect(actualizarEstadoNecesidad(1, 'EN_PROCESO')).rejects.toThrow('Network error');
  });

  it('maneja errores en consumirInventario', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    await expect(consumirInventario('Agua', 10)).rejects.toThrow('Network error');
  });

  it('maneja errores en obtenerHistorialNecesidades', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(obtenerHistorialNecesidades()).rejects.toThrow('Network error');
  });
});
