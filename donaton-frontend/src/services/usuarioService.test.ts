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

  // PRUEBAS DE ERROR
  it('maneja errores en obtenerUsuarios', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(obtenerUsuarios()).rejects.toThrow('Network error');
  });

  it('maneja errores en obtenerUsuariosStats', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    await expect(obtenerUsuariosStats()).rejects.toThrow('Network error');
  });

  it('maneja errores en registrarUsuarioAdmin', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    await expect(registrarUsuarioAdmin({})).rejects.toThrow('Network error');
  });

  it('maneja errores en registrarDonante', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
    await expect(registrarDonante({})).rejects.toThrow('Network error');
  });

  it('maneja errores en verificarEmailDisponible (409)', async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 409 } });
    const data = await verificarEmailDisponible('test');
    expect(data).toBe(false);
  });

  it('maneja errores en verificarEmailDisponible (otro)', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    const data = await verificarEmailDisponible('test');
    expect(data).toBe(true);
  });

  it('maneja errores en verificarRutDisponible (409)', async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 409 } });
    const data = await verificarRutDisponible('rut');
    expect(data).toBe(false);
  });

  it('maneja errores en verificarRutDisponible (otro)', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    const data = await verificarRutDisponible('rut');
    expect(data).toBe(true);
  });

  it('maneja errores en actualizarUsuario', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));
    await expect(actualizarUsuario(1, {})).rejects.toThrow('Network error');
  });

  it('maneja errores en eliminarUsuario', async () => {
    mockedAxios.delete.mockRejectedValueOnce(new Error('Network error'));
    await expect(eliminarUsuario(1)).rejects.toThrow('Network error');
  });

  it('maneja errores en reactivarUsuario', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));
    await expect(reactivarUsuario(1)).rejects.toThrow('Network error');
  });

  it('maneja errores en actualizarEstadoMasivoUsuarios', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));
    await expect(actualizarEstadoMasivoUsuarios([1], true)).rejects.toThrow('Network error');
  });

  it('maneja errores en cambiarPassword', async () => {
    mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));
    await expect(cambiarPassword(1, 'old', 'new')).rejects.toThrow('Network error');
  });

  it('obtenerCentrosAcopioPorRegion retorna [] cuando región es string vacío', async () => {
    const result = await obtenerCentrosAcopioPorRegion('');
    expect(result).toEqual([]);
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('obtenerCentrosAcopioPorRegion retorna [] cuando falla', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    const result = await obtenerCentrosAcopioPorRegion('Metropolitana');
    expect(result).toEqual([]);
  });

  it('obtenerUsuarios filtra parámetros vacíos y null', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { content: [] } });
    await obtenerUsuarios({ rol: '', region: undefined, rut: null as any, page: 1 });
    const callArgs = mockedAxios.get.mock.calls[0][1] as any;
    // solo page debe quedar, los vacíos se eliminan
    expect(Object.keys(callArgs.params)).not.toContain('rol');
    expect(Object.keys(callArgs.params)).not.toContain('region');
    expect(callArgs.params.page).toBe(1);
  });

  it('verificarEmailDisponible retorna true cuando disponible es undefined en respuesta', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {} });
    const result = await verificarEmailDisponible('test@gmail.com');
    expect(result).toBe(true);
  });

  it('verificarRutDisponible retorna true cuando disponible es undefined en respuesta', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {} });
    const result = await verificarRutDisponible('12.345.678-5');
    expect(result).toBe(true);
  });
});
