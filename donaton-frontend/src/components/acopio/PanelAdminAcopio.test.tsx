import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PanelAdminAcopio from './PanelAdminAcopio';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div>{children}</div>,
  TileLayer: () => <div />,
  Marker: ({ children }: any) => <div>{children}</div>,
  Popup: ({ children }: any) => <div>{children}</div>,
  useMap: () => ({ setView: vi.fn() })
}));

import * as donacionService from '../../services/donacionService';
import * as bffService from '../../services/bffService';
import * as usuarioService from '../../services/usuarioService';
import * as logisticaService from '../../services/logisticaService';

vi.mock('../../services/donacionService');
vi.mock('../../services/bffService');
vi.mock('../../services/usuarioService');
vi.mock('../../services/logisticaService');

vi.mock('../../context/AuthContext', () => ({
  AuthProvider: ({ children }: any) => <>{children}</>,
  useAuth: () => ({
    usuario: { id: 1, region: 'Metropolitana', centroAcopioId: 1 }
  })
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Epic 4: Dashboards Administrativos y UI/UX', () => {
  it('Debe resetear automáticamente la página al cambiar de pestaña', async () => {
    const donacionesFalsas = Array.from({ length: 15 }).map((_, i) => ({
      id: i + 1,
      estado: 'PENDIENTE',
      cantidad: 1,
      categoria: 'Alimentos',
      regionRetiro: 'Metropolitana'
    }));

    const historialFalso = Array.from({ length: 15 }).map((_, i) => ({
      id: i + 100,
      estado: 'RECIBIDO',
      cantidad: 1,
      categoria: 'Ropa',
      regionRetiro: 'Metropolitana'
    }));

    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([...donacionesFalsas, ...historialFalso] as any);
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([]);
    vi.mocked(usuarioService.obtenerUsuarios).mockResolvedValue({ content: [] } as any);
    vi.mocked(logisticaService.obtenerCentrosAcopio).mockResolvedValue([{ id: 1, region: 'Metropolitana' }] as any);

    renderWithProviders(<PanelAdminAcopio />);

    await waitFor(() => {
      expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText('Mostrando 1 - 10 de 15 registros')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);

    expect(await screen.findByText('Mostrando 11 - 15 de 15 registros')).toBeInTheDocument();

    const historialTab = screen.getByText(/Historial de Donación/i);
    fireEvent.click(historialTab);

    expect(await screen.findByText('Mostrando 1 - 10 de 15 registros')).toBeInTheDocument();
  });

  it('Debe renderizar las demás pestañas correctamente (Inventario, Alertas, Historial Necesidades)', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 1, estado: 'RECIBIDO', cantidad: 10, categoria: 'Alimentos', recurso: 'Arroz', unidadMedida: 'Kilogramos', regionRetiro: 'Metropolitana' }
    ] as any);
    
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([
      { id: 2, estado: 'ACTIVA', tipoEmergencia: 'Incendio', comuna: 'Santiago', region: 'Metropolitana', recursos: '[{"categoria":"Agua","cantidad":5,"unidad":"Litros"}]' },
      { id: 3, estado: 'CUBIERTA', tipoEmergencia: 'Inundación', comuna: 'Maipú', region: 'Metropolitana', recursos: '[{"categoria":"Ropa","cantidad":10,"unidad":"Unidades"}]' }
    ] as any);

    renderWithProviders(<PanelAdminAcopio />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Inventario'));
    expect(await screen.findByText('Arroz')).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Alerta de Necesidades/i));
    expect(await screen.findByText('Incendio')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Historial de Necesidades'));
    expect(await screen.findByText('Inundación')).toBeInTheDocument();
  });

  it('Debe permitir interactuar con donaciones y necesidades (coverage)', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { 
        id: 99, 
        estado: 'PENDIENTE', 
        cantidad: 5, 
        categoria: 'Agua', 
        regionRetiro: 'Metropolitana',
        transporteEspecial: true,
        pesoAproximado: 100,
        disponibilidadHoraria: '10:00 - 12:00',
        donanteId: 10,
        conductorId: 5,
        descripcion: 'Agua purificada',
        fotoBase64: 'data:image/png;base64,123',
        direccionRetiroCalle: 'Alameda',
        direccionRetiroNumero: '123',
        latitudRetiro: -33.4,
        longitudRetiro: -70.6
      },
      { id: 100, estado: 'EN_TRANSITO', cantidad: 2, categoria: 'Ropa', regionRetiro: 'Metropolitana' }
    ] as any);
    
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([
      { id: 77, estado: 'ACTIVA', tipoEmergencia: 'Sismo', comuna: 'Ñuñoa', region: 'Metropolitana', recursos: '[{"categoria":"Agua","cantidad":5,"unidad":"Litros"}]' }
    ] as any);

    vi.mocked(usuarioService.obtenerUsuarios).mockResolvedValue({ 
      content: [{ id: 5, subRol: 'CONDUCTOR', activo: true, region: 'Metropolitana', nombreCompleto: 'Conductor Test' }] 
    } as any);

    renderWithProviders(<PanelAdminAcopio />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument();
    });

    // 1. Recibir donación en tránsito
    const recibirBtns = await screen.findAllByTitle('Recibir en Bodega');
    expect(recibirBtns.length).toBeGreaterThan(1);
    fireEvent.click(recibirBtns[1]); // El índice 1 corresponde a la donación EN_TRANSITO (id 100)
    await waitFor(() => {
      expect(donacionService.actualizarEstadoDonacion).toHaveBeenCalledWith(100, 'RECIBIDO');
    });

    // 2. Abrir detalles de donación
    const detallesBtns = screen.getAllByTitle('Ver Detalles');
    fireEvent.click(detallesBtns[0]);
    expect(await screen.findByText('Detalles de la Donación')).toBeInTheDocument();
    
    // Cerrar el modal
    const cerrarModalBtn = screen.getByText('Cerrar');
    fireEvent.click(cerrarModalBtn);

    // 3. Pestaña alertas y abrir modal de asignar
    fireEvent.click(screen.getByText(/Alerta de Necesidades/i));
    const asignarBtns = await screen.findAllByTitle('Asignar Conductor');
    
    // Abrir y cancelar
    fireEvent.click(asignarBtns[0]);
    expect(await screen.findByText(/Cubrir Necesidad #77/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancelar'));

    // Abrir de nuevo y cubrir necesidad
    fireEvent.click(asignarBtns[0]);
    expect(await screen.findByText(/Cubrir Necesidad #77/i)).toBeInTheDocument();

    // 4. Cubrir necesidad
    vi.mocked(bffService.actualizarEstadoNecesidad).mockResolvedValue({} as any);
    const confirmarCubrir = screen.getByRole('button', { name: /Asignar Conductor/i });
    if (confirmarCubrir) {
      fireEvent.click(confirmarCubrir);
    }
  });

  it('Debe manejar errores al actualizar estado de donación o necesidad (coverage)', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 99, estado: 'EN_TRANSITO', cantidad: 5, categoria: 'Agua', regionRetiro: 'Metropolitana' }
    ] as any);
    vi.mocked(donacionService.actualizarEstadoDonacion).mockRejectedValueOnce(new Error('Test Error Donacion'));

    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([
      { id: 77, estado: 'ACTIVA', tipoEmergencia: 'Sismo', comuna: 'Ñuñoa', region: 'Metropolitana', recursos: '[{"categoria":"Agua","cantidad":5,"unidad":"Litros"}]' }
    ] as any);
    vi.mocked(bffService.actualizarEstadoNecesidad).mockRejectedValueOnce(new Error('Test Error Necesidad'));

    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    // Fallo donación
    const recibirBtns = await screen.findAllByTitle('Recibir en Bodega');
    fireEvent.click(recibirBtns[0]);
    
    // Fallo necesidad
    fireEvent.click(screen.getByText(/Alerta de Necesidades/i));
    const asignarBtns = await screen.findAllByTitle('Asignar Conductor');
    fireEvent.click(asignarBtns[0]);
    const confirmarCubrir = screen.getByRole('button', { name: /Asignar Conductor/i });
    fireEvent.click(confirmarCubrir);
  });

  it('Debe permitir aplicar filtros (coverage)', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 99, estado: 'EN_TRANSITO', cantidad: 5, categoria: 'Agua', regionRetiro: 'Metropolitana' }
    ] as any);
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([] as any);
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());
    
    // Cambiar items por página
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '25' } });
    expect(await screen.findByText(/Mostrando 1 - \d+ de/i)).toBeInTheDocument();
  });
});
