import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { 
  obtenerUsuarios,
  obtenerUsuariosStats,
  registrarUsuarioAdmin,
  registrarDonante,
  obtenerCentrosAcopioPorRegion,
  verificarEmailDisponible,
  verificarRutDisponible,
  actualizarUsuario,
  eliminarUsuario,
  reactivarUsuario,
  actualizarEstadoMasivoUsuarios,
  cambiarPassword
} from './usuarioService';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('usuarioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('obtenerUsuarios', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { content: [{ id: 1 }] } });
    const data = await obtenerUsuarios();
    expect(data).toEqual({ content: [{ id: 1 }] });
  });

  it('obtenerUsuariosStats', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { total: 10 } });
    const data = await obtenerUsuariosStats();
    expect(data).toEqual({ total: 10 });
  });

  it('registrarUsuarioAdmin', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: 'OK' });
    const data = await registrarUsuarioAdmin({});
    expect(data).toEqual('OK');
  });

  it('registrarDonante', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: 'OK' });
    const data = await registrarDonante({});
    expect(data).toEqual('OK');
  });

  it('obtenerCentrosAcopioPorRegion', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    const data = await obtenerCentrosAcopioPorRegion('13');
    expect(data).toEqual([{ id: 1 }]);
  });

  it('verificarEmailDisponible', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { disponible: true } });
    const data = await verificarEmailDisponible('test');
    expect(data).toBe(true);
  });

  it('verificarRutDisponible', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { disponible: false } });
    const data = await verificarRutDisponible('rut');
    expect(data).toBe(false);
  });

  it('actualizarUsuario', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: 'OK' });
    await actualizarUsuario(1, {});
    expect(mockedAxios.put).toHaveBeenCalled();
  });

  it('eliminarUsuario', async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: 'OK' });
    await eliminarUsuario(1);
    expect(mockedAxios.delete).toHaveBeenCalled();
  });

  it('reactivarUsuario', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: 'OK' });
    await reactivarUsuario(1);
    expect(mockedAxios.put).toHaveBeenCalled();
  });

  it('actualizarEstadoMasivoUsuarios', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: 'OK' });
    await actualizarEstadoMasivoUsuarios([1], true);
    expect(mockedAxios.put).toHaveBeenCalled();
  });

  it('cambiarPassword', async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: 'OK' });
    await cambiarPassword(1, 'old', 'new');
    expect(mockedAxios.put).toHaveBeenCalled();
  });
});
