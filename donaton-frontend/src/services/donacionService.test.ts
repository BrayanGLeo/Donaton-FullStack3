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

  it('registrarDonacion', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });
    const data = await registrarDonacion({} as any);
    expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringContaining('/donaciones'), expect.any(Object), expect.any(Object));
    expect(data).toEqual({ id: 1 });
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
});
