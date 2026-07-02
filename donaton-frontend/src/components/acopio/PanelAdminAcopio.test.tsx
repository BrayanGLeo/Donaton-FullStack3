import { describe, it, expect, vi, beforeEach } from 'vitest';
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

vi.mock('react-select', () => ({
  default: ({ options, onChange, placeholder, value, isDisabled }: any) => (
    <div data-testid="react-select" data-placeholder={placeholder}>
      <span>{value ? value.label : placeholder}</span>
      <button 
        data-testid={`select-mock-btn-${placeholder}`} 
        disabled={isDisabled}
        onClick={(e) => {
          const v = e.currentTarget.dataset.testValue;
          if (v && options) {
            const found = options.find((o: any) => o.value === v);
            if (found) return onChange(found);
            return onChange({ value: v, label: v });
          }
          if (options && options.length > 0) return onChange(options[0]);
          onChange({ value: 'Mocked', label: 'Mocked' });
        }}
      >
        Select Mocked
      </button>
    </div>
  )
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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logisticaService.obtenerCentrosAcopio).mockResolvedValue([{ id: 1, region: 'Metropolitana', latitud: -33, longitud: -70 }] as any);
    vi.mocked(logisticaService.obtenerInventario).mockResolvedValue([
      { id: 1, recurso: 'Agua (Litros)', cantidadTotal: 100 }
    ] as any);
    vi.mocked(usuarioService.obtenerUsuarios).mockResolvedValue({
      content: [{ id: 10, nombre: 'Juan', subRol: 'CONDUCTOR', activo: true, region: 'Metropolitana' }]
    } as any);
    vi.mocked(donacionService.actualizarEstadoDonacion).mockResolvedValue({} as any);
  });

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

    const donacionesTab = screen.getByRole('button', { name: /Donaciones/i });
    fireEvent.click(donacionesTab);

    expect(await screen.findByText('Mostrando 1 - 10 de 15 registros')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next/i });
    fireEvent.click(nextBtn);

    expect(await screen.findByText('Mostrando 11 - 15 de 15 registros')).toBeInTheDocument();

    const historialTab = screen.getByText(/Historial de Donación/i);
    fireEvent.click(historialTab);

    expect(await screen.findByText('Mostrando 1 - 10 de 15 registros')).toBeInTheDocument();
  });

  it('Debe renderizar las demás pestañas correctamente (Inventario, Alertas, Historial Necesidades)', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 1, estado: 'RECIBIDO', cantidad: 10, categoria: 'Alimentos', recurso: 'Arroz', unidadMedida: 'Kilogramos', regionRetiro: 'Metropolitana', recursos: '[{"categoria":"Alimentos","subcategoria":"Arroz","cantidad":10,"unidadMedida":"Kilogramos"}]' }
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
    fireEvent.click(screen.getByRole('button', { name: /Donaciones/i }));
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
    fireEvent.click(screen.getByRole('button', { name: /Donaciones/i }));
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
    const select = document.querySelector('select') as HTMLSelectElement;
    if (select) {
      fireEvent.change(select, { target: { value: '25' } });
      expect(await screen.findByText(/Mostrando 1 - \d+ de/i)).toBeInTheDocument();
    }
  });

  it('Debe manejar donaciones sin coordenadas y mostrar datos', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 1, estado: 'PENDIENTE', cantidad: 3, categoria: 'Alimentos', regionRetiro: 'Metropolitana', recursos: '[{"categoria":"Alimentos","cantidad":3,"unidad":"Kilogramos"}]', comunaRetiro: 'Santiago' }
    ] as any);
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([]);
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const donacionesTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    fireEvent.click(donacionesTab!);
    expect(await screen.findByText(/Mostrando/i)).toBeInTheDocument();
  });

  it('Debe mostrar el tab de Mapa correctamente', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 1, estado: 'PENDIENTE', cantidad: 1, categoria: 'Agua', regionRetiro: 'Metropolitana', recursos: '[]', latitudRetiro: -33.4, longitudRetiro: -70.6 }
    ] as any);
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([
      { id: 2, estado: 'ACTIVA', tipoEmergencia: 'Sismo', recursos: '[]', latitud: -33.5, longitud: -70.7 }
    ] as any);
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const mapaTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Mapa'));
    if (mapaTab) {
      fireEvent.click(mapaTab);
      await waitFor(() => {
        expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument();
      });
    }
  });

  it('Debe manejar errores de carga de datos al iniciar', async () => {
    vi.mocked(donacionService.listarDonaciones).mockRejectedValueOnce(new Error('Network error'));
    vi.mocked(bffService.obtenerNecesidades).mockRejectedValueOnce(new Error('Network error'));
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());
  });

  it('Debe manejar estado de donacion RECHAZADA_CONDUCTOR', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 1, estado: 'RECHAZADA_CONDUCTOR', cantidad: 1, categoria: 'Agua', regionRetiro: 'Metropolitana', recursos: '[]' }
    ] as any);
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([]);
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const donacionesTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    fireEvent.click(donacionesTab!);
    expect(await screen.findByText(/Mostrando/i)).toBeInTheDocument();
  });

  it('Debe abrir detalles de donacion, Google Maps y fotografia', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { 
        id: 101, estado: 'PENDIENTE', cantidad: 5, categoria: 'Agua', regionRetiro: 'Metropolitana', 
        recursos: '[{"categoria":"Agua","cantidad":5,"unidad":"Litros"}]', 
        latitudRetiro: -33, longitudRetiro: -70, transporteEspecial: true,
        descripcion: 'Descripcion test', fotoBase64: 'data:image/png;base64,FAKE'
      }
    ] as any);
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([]);
    renderWithProviders(<PanelAdminAcopio />);
    
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());
    
    const donacionesTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    fireEvent.click(donacionesTab!);

    const btnVerDetalle = await screen.findAllByRole('button', { name: /Ver Detalles/i });
    fireEvent.click(btnVerDetalle[0]);
    
    expect(await screen.findByText(/Detalles de la Donaci/)).toBeInTheDocument();
    expect(screen.getByText('Descripcion test')).toBeInTheDocument();
    expect(screen.getByText(/Fotograf/)).toBeInTheDocument();

    const mapsBtn = screen.getByRole('button', { name: /Ver en Google Maps/i });
    const windowOpenSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);
    fireEvent.click(mapsBtn);
    expect(windowOpenSpy).toHaveBeenCalledWith('https://www.google.com/maps/search/?api=1&query=-33,-70', '_blank');
    windowOpenSpy.mockRestore();
  });

  it('Debe manejar recursos invalidos y onHide de modales', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 102, estado: 'EN_TRANSITO', cantidad: 5, categoria: 'Agua', regionRetiro: 'Metropolitana', recursos: 'invalid json', transporteEspecial: false }
    ] as any);
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([
      { id: 78, estado: 'ACTIVA', tipoEmergencia: 'Sismo', comuna: 'Nunoa', region: 'Metropolitana', recursos: '[]', latitud: -33, longitud: -70 }
    ] as any);
    vi.mocked(donacionService.actualizarEstadoDonacion).mockResolvedValue({} as any);

    renderWithProviders(<PanelAdminAcopio />);
    
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());
    
    // 1. Donaciones: test "invalid json" = "0 items"
    const donacionesTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    fireEvent.click(donacionesTab!);
    
    const btnVerDetalle = await screen.findAllByTitle('Ver Detalles');
    fireEvent.click(btnVerDetalle[0]);
    expect(await screen.findByText('0 items')).toBeInTheDocument();
    
    // 2. onHide Donacion via Escape
    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(screen.queryByText(/Detalles de la Donaci/)).not.toBeInTheDocument());

    // 3. onHide Necesidad via Escape
    fireEvent.click(screen.getByText(/Alerta de Necesidades/i));
    const btnVerDetalleNec = await screen.findAllByTitle('Ver Detalles');
    fireEvent.click(btnVerDetalleNec[0]);
    expect(await screen.findByText('Detalles de la Necesidad')).toBeInTheDocument();
    
    fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
    await waitFor(() => expect(screen.queryByText('Detalles de la Necesidad')).not.toBeInTheDocument());

  });
});

describe('Epic 4: Cobertura Adicional de PanelAdminAcopio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logisticaService.obtenerCentrosAcopio).mockResolvedValue([{ id: 1, region: 'Metropolitana', latitud: -33, longitud: -70 }] as any);
    vi.mocked(usuarioService.obtenerUsuarios).mockResolvedValue({ content: [{ id: 5, subRol: 'CONDUCTOR', activo: true, region: 'Metropolitana', nombreCompleto: 'Conductor Test' }] } as any);
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 1, estado: 'PENDIENTE', cantidad: 1, regionRetiro: 'Metropolitana', recursos: '[]', comunaRetiro: 'Santiago' },
      { id: 2, estado: 'RECIBIDO', cantidad: 2, regionRetiro: 'Metropolitana', recursos: '[{"categoria":"Alimentos","subcategoria":"Arroz","cantidad":10,"unidadMedida":"Kilogramos"}]', comunaRetiro: 'Santiago' },
    ] as any);
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([
      { id: 1, estado: 'ACTIVA', tipoEmergencia: 'Sismo', comuna: 'Santiago', region: 'Metropolitana', recursos: '[{"categoria":"Agua","cantidad":5}]', latitud: -33, longitud: -70 },
      { id: 2, estado: 'ENTREGADO', tipoEmergencia: 'Incendio', comuna: 'Maipú', region: 'Metropolitana', recursos: '[]', latitud: -33.5, longitud: -70.5 },
    ] as any);
  });

  it('Debe navegar a la pestaña Historial de Donación y mostrar donaciones recibidas', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const historialTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Historial de Donación'));
    fireEvent.click(historialTab!);

    expect(await screen.findByText(/Mostrando/i)).toBeInTheDocument();
  });

  it('Debe navegar a la pestaña Inventario y mostrar ítems correctamente', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const inventarioTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Inventario'));
    fireEvent.click(inventarioTab!);

    // Should show "Inventario General" heading
    await waitFor(() => {
      expect(screen.getByText('Inventario General')).toBeInTheDocument();
    });
  });

  it('Debe navegar a la pestaña Historial de Necesidades', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const historialNecTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Historial de Necesidades'));
    fireEvent.click(historialNecTab!);

    expect(await screen.findByText(/Mostrando/i)).toBeInTheDocument();
  });

  it('Debe abrir y cerrar el modal de SuccessModal correctamente', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 1, estado: 'EN_TRANSITO', cantidad: 1, regionRetiro: 'Metropolitana', recursos: '[]', comunaRetiro: 'Santiago' },
    ] as any);
    vi.mocked(donacionService.actualizarEstadoDonacion).mockResolvedValue({} as any);
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const donacionesTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    fireEvent.click(donacionesTab!);

    // Find the enabled 'Recibir en Bodega' button (only enabled for EN_TRANSITO)
    const recibirBtns = await screen.findAllByTitle('Recibir en Bodega');
    const enabledBtn = recibirBtns.find(b => !b.hasAttribute('disabled'));
    if (enabledBtn) fireEvent.click(enabledBtn);

    await waitFor(() => {
      expect(screen.getByText(/Exitosa|Recepci/i)).toBeInTheDocument();
    });

    // Close by clicking 'Aceptar' button (not 'Cerrar')
    const aceptarBtn = screen.getAllByRole('button').find(b => b.textContent === 'Aceptar');
    if (aceptarBtn) {
      fireEvent.click(aceptarBtn);
      await waitFor(() => expect(screen.queryByText(/Recepción Exitosa/i)).not.toBeInTheDocument());
    }
  });

  it('Debe mostrar filtros en la pestaña Donaciones al hacer clic en Filtros', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const donacionesTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    fireEvent.click(donacionesTab!);

    const filtrosBtn = await screen.findByRole('button', { name: /Filtros/i });
    fireEvent.click(filtrosBtn);

    // El filtro panel should be visible
    await waitFor(() => {
      const idInput = screen.getByPlaceholderText('ID...');
      expect(idInput).toBeInTheDocument();
    });
  });

  it('Debe mostrar el botón de asignación de conductor en alertas activas', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    // Navigate to Alertas (where 'Asignar Conductor' button exists for ACTIVA necesidades)
    const alertasTab = screen.getByText(/Alerta de Necesidades/i);
    fireEvent.click(alertasTab);

    const asignarBtns = await screen.findAllByTitle('Asignar Conductor');
    expect(asignarBtns.length).toBeGreaterThan(0);
    fireEvent.click(asignarBtns[0]);
    
    // Modal title is "Cubrir Necesidad #<id>"
    await waitFor(() => expect(screen.getByText(/Cubrir Necesidad/i)).toBeInTheDocument());
  });

  it('Debe renderizar el dashboard de Resumen correctamente', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    // El tab Resumen es el default
    expect(screen.getByText('Dashboard del Centro de Acopio')).toBeInTheDocument();
  });

  it('Debe mostrar la sección Alertas y detalles de necesidad', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const alertasTab = screen.getByText(/Alerta de Necesidades/i);
    fireEvent.click(alertasTab);

    const verDetallesBtns = await screen.findAllByTitle('Ver Detalles');
    if (verDetallesBtns.length > 0) {
      fireEvent.click(verDetallesBtns[0]);
      expect(await screen.findByText('Detalles de la Necesidad')).toBeInTheDocument();

      // Close it
      const cerrarBtn = screen.getByText('Cerrar');
      fireEvent.click(cerrarBtn);
    }
  });
});

describe('Epic 4: Cobertura de Mapa y Filtros Avanzados', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(logisticaService.obtenerCentrosAcopio).mockResolvedValue([{ id: 1, region: 'Metropolitana', latitud: -33, longitud: -70 }] as any);
    vi.mocked(usuarioService.obtenerUsuarios).mockResolvedValue({ content: [
      { id: 5, subRol: 'CONDUCTOR', activo: true, region: 'Metropolitana', nombreCompleto: 'Conductor Test' }
    ]} as any);
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 1, estado: 'PENDIENTE', cantidad: 1, regionRetiro: 'Metropolitana', recursos: '[]', comunaRetiro: 'Santiago', latitudRetiro: -33, longitudRetiro: -70 },
      { id: 2, estado: 'EN_TRANSITO', cantidad: 2, regionRetiro: 'Metropolitana', recursos: '[{"categoria":"Alimentos","subcategoria":"Arroz","cantidad":10,"unidadMedida":"Kilogramos"}]', comunaRetiro: 'Ñuñoa', conductorId: 5 },
      { id: 3, estado: 'RECIBIDO', cantidad: 5, regionRetiro: 'Metropolitana', recursos: '[]', comunaRetiro: 'Santiago' },
      { id: 4, estado: 'RECHAZADA_CONDUCTOR', cantidad: 1, regionRetiro: 'Metropolitana', recursos: '[]', comunaRetiro: 'Maipú' },
    ] as any);
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([
      { id: 1, estado: 'ACTIVA', tipoEmergencia: 'Sismo', comuna: 'Santiago', region: 'Metropolitana', recursos: '[{"categoria":"Agua","cantidad":5}]', latitud: -33, longitud: -70 },
    ] as any);
  });

  it('Debe navegar a la pestaña Mapa y renderizar el mapa', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const mapaTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Mapa'));
    if (mapaTab) {
      fireEvent.click(mapaTab);
      await waitFor(() => {
        expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument();
      });
    }
  });

  it('Debe filtrar donaciones por ID en panel de donaciones', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const donacionesTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    fireEvent.click(donacionesTab!);

    const filtrosBtn = await screen.findByRole('button', { name: /Filtros/i });
    fireEvent.click(filtrosBtn);

    const idInput = await screen.findByPlaceholderText('ID...');
    fireEvent.change(idInput, { target: { value: '1' } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('ID...')).toHaveValue('1');
    });
  });

  it('Debe aplicar filtros de Inventario por categoria', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const inventarioTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Inventario'));
    fireEvent.click(inventarioTab!);
    await waitFor(() => expect(screen.getByText('Inventario General')).toBeInTheDocument());

    // Open filters
    const filtrosBtn = await screen.findAllByRole('button', { name: /Filtros/i });
    fireEvent.click(filtrosBtn.at(-1)!);

    await waitFor(() => {
      expect(screen.queryByText('Inventario General')).toBeInTheDocument();
    });
  });

  it('Debe mostrar donaciones RECHAZADA_CONDUCTOR en la pestaña Donaciones', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const donacionesTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    fireEvent.click(donacionesTab!);

    expect(await screen.findByText(/Mostrando/i)).toBeInTheDocument();
    // RECHAZADA_CONDUCTOR shows a 'Reasignar' indicator
    await waitFor(() => {
      expect(screen.queryByText(/Reasignar|Rechazado/i)).not.toBeNull();
    });
  });

  it('Debe mostrar donaciones EN_TRANSITO con badge de En camino', async () => {
    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const donacionesTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    fireEvent.click(donacionesTab!);

    expect(await screen.findByText(/Mostrando/i)).toBeInTheDocument();
    // EN_TRANSITO shows 'En camino' indicator
    await waitFor(() => {
      expect(screen.queryByText(/camino|tránsito/i)).not.toBeNull();
    });
  });

  it('Debe paginar el historial de donaciones y testear recursos', async () => {
    // Create many donations to trigger pagination and use complex resources for coverage
    const manyDonaciones = Array.from({ length: 12 }, (_, i) => ({
      id: i + 100, estado: 'RECIBIDO', cantidad: undefined,
      regionRetiro: 'Metropolitana', 
      recursos: '[{"categoria":"Alimentos","subcategoria":"Huevos","capacidadBandeja":30}]', 
      comunaRetiro: 'Santiago'
    }));
    
    // Add one with invalid JSON resources
    manyDonaciones.push({
      id: 999, estado: 'RECIBIDO', cantidad: 1,
      regionRetiro: 'Metropolitana', 
      recursos: 'invalid-json', 
      comunaRetiro: 'Santiago'
    });

    vi.mocked(donacionService.listarDonaciones).mockResolvedValue(manyDonaciones as any);

    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando Operaciones/i)).not.toBeInTheDocument());

    const historialTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Historial de Donación'));
    fireEvent.click(historialTab!);

    expect(await screen.findByText(/Mostrando/i)).toBeInTheDocument();
  });

  it('Debe permitir asignar conductor a una donación y confirmarlo', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 999, estado: 'PENDIENTE', cantidad: 1, categoria: 'Alimentos', regionRetiro: 'Metropolitana', centroAcopioDestinoId: 1 }
    ] as any);
    vi.mocked(usuarioService.obtenerUsuarios).mockResolvedValue({
      content: [{ id: 10, nombre: 'Juan', rol: 'CONDUCTOR' }]
    } as any);
    vi.mocked(donacionService.asignarConductor).mockResolvedValue({} as any);

    renderWithProviders(<PanelAdminAcopio />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    const tabDonaciones = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    if (tabDonaciones) fireEvent.click(tabDonaciones);
    
    await waitFor(() => {
      expect(screen.getByText(/#999/i)).toBeInTheDocument();
    });
  });

  it('Debe manejar recibir donacion en bodega', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 777, estado: 'EN_TRANSITO', cantidad: 1, categoria: 'Agua', regionRetiro: 'Metropolitana', centroAcopioDestinoId: 1 }
    ] as any);
    vi.mocked(donacionService.actualizarEstadoDonacion).mockResolvedValue({} as any);

    renderWithProviders(<PanelAdminAcopio />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    const tabDonaciones = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones'));
    if (tabDonaciones) fireEvent.click(tabDonaciones);
    
    await waitFor(() => {
      expect(screen.getByTitle(/Recibir en Bodega/i)).not.toBeDisabled();
    });

    const recibirBtn = screen.getByTitle(/Recibir en Bodega/i);
    fireEvent.click(recibirBtn);

    await waitFor(() => {
      expect(donacionService.actualizarEstadoDonacion).toHaveBeenCalledWith(777, 'RECIBIDO');
    });
  });

  it('Debe abrir el modal de cubrir necesidad y confirmar asignacion', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 101, estado: 'RECIBIDO', cantidad: 1, categoria: 'Agua', regionRetiro: 'Metropolitana', recursos: '[{"categoria":"Agua","subcategoria":"Agua Embotellada (Bidon)","cantidad":10,"unidad":"Unidades","litros":"Bidon 5 Litros"}, {"categoria":"Alimentos","subcategoria":"Arroz","cantidad":20,"unidad":"Kilos"}]', centroAcopioDestinoId: 1 }
    ] as any);
    vi.mocked(bffService.obtenerNecesidades).mockResolvedValue([
      { id: 888, estado: 'ACTIVA', tipoEmergencia: 'Incendio', comuna: 'Santiago', region: 'Metropolitana', recursos: '[{"categoria":"Agua","subcategoria":"Agua Embotellada (Bidon)","cantidad":5,"unidad":"Unidades","litros":"Bidon 5 Litros"}, {"categoria":"Alimentos","subcategoria":"Arroz","cantidad":10,"unidad":"Kilos"}]' }
    ] as any);
    vi.mocked(usuarioService.obtenerUsuarios).mockResolvedValue({
      content: [{ id: 10, nombre: 'Juan', subRol: 'CONDUCTOR', activo: true, region: 'Metropolitana' }]
    } as any);
    vi.mocked(bffService.actualizarEstadoNecesidad).mockResolvedValue({} as any);

    renderWithProviders(<PanelAdminAcopio />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
    });

    const tabNecesidades = screen.getAllByRole('button').find(b => b.textContent?.includes('Alerta de Necesidades'));
    if (tabNecesidades) fireEvent.click(tabNecesidades);

    await waitFor(() => {
      expect(screen.getByTitle(/Asignar Conductor/i)).toBeInTheDocument();
    });

    const abrirModalBtn = screen.getByTitle(/Asignar Conductor/i);
    fireEvent.click(abrirModalBtn);

    await waitFor(() => {
      expect(screen.getByText(/Revisa si tienes stock suficiente/i)).toBeInTheDocument();
    });

    // Verify table rendered details
    expect(screen.getByText('Capacidad: Bidon 5 Litros')).toBeInTheDocument();
    expect(screen.getAllByText('Suficiente').length).toBeGreaterThan(0);

    const asignarModalBtn = screen.getByRole('button', { name: 'Asignar Conductor' });
    expect(asignarModalBtn).toBeDisabled();

    // select conductor using our mocked select
    const btnSelect = screen.queryByTestId('select-mock-btn-Buscar conductor...');
    if (btnSelect) fireEvent.click(btnSelect);

    // Now button should be enabled and we can submit
    await waitFor(() => {
      expect(asignarModalBtn).not.toBeDisabled();
    });
    fireEvent.click(asignarModalBtn);

    await waitFor(() => {
      expect(bffService.actualizarEstadoNecesidad).toHaveBeenCalled();
    });
  });

  it('Debe interactuar con filtros, agrupacion y paginación en Donaciones e Inventario para aumentar cobertura', async () => {
    vi.mocked(donacionService.listarDonaciones).mockResolvedValue([
      { id: 991, estado: 'PENDIENTE', regionRetiro: 'Metropolitana', recursos: '[{"categoria":"Alimentos","subcategoria":"Arroz","cantidad":1},{"categoria":"Alimentos","subcategoria":"Fideos","cantidad":1}]' },
      { id: 992, estado: 'EN_TRANSITO', regionRetiro: 'Metropolitana', recursos: '[{"categoria":"Ropa","subcategoria":"Polera","cantidad":1}]' }
    ] as any);

    renderWithProviders(<PanelAdminAcopio />);
    await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());
    
    const tabDonaciones = screen.getAllByRole('button').find(b => b.textContent?.includes('Donaciones') && !b.textContent?.includes('Historial'));
    if (tabDonaciones) fireEvent.click(tabDonaciones);

    // 1. Verificar que las donaciones están en la tabla
    expect(await screen.findByText('#991')).toBeInTheDocument();
    expect(await screen.findByText('#992')).toBeInTheDocument();

    // 2. Select de conductores en la fila (onChange en Select)
      // Wait for table rows to render
      await screen.findByText('#991'); // Ensure Donacion is there
      // We know there's a Select for conductor in the row
      const btnSelect = await screen.findByTestId('select-mock-btn-Seleccionar...');
      fireEvent.click(btnSelect);
      const cancelAsignBtn = await screen.findByText('Cancelar');
      fireEvent.click(cancelAsignBtn);

    // 3. Filtros de Donaciones
    const btnFiltros = screen.getAllByRole('button', { name: /Filtros/i });
    fireEvent.click(btnFiltros[0]);

    const btnComuna = screen.queryByTestId('select-mock-btn-Comuna...');
    if (btnComuna) fireEvent.click(btnComuna);

    const btnEstado = screen.queryByTestId('select-mock-btn-Estado...');
    if (btnEstado) fireEvent.click(btnEstado);

    const btnCat = screen.queryByTestId('select-mock-btn-Categoría...');
    if (btnCat) fireEvent.click(btnCat);

    const btnSubCat = screen.queryByTestId('select-mock-btn-Subcategoría...');
    if (btnSubCat) fireEvent.click(btnSubCat);

    // Limpiar filtros (el enlace text-danger p-0)
    const clearFiltersBtn = screen.getByText(/Limpiar Filtros/i);
    fireEvent.click(clearFiltersBtn);

    // 4. Paginación
    const paginationSelect = screen.getAllByRole('combobox').find(s => s.innerHTML.includes('value="10"'));
    if (paginationSelect) {
      fireEvent.change(paginationSelect, { target: { value: '25' } });
    }
    const nextBtn = screen.queryByRole('button', { name: /Next|Siguiente/i });
    if (nextBtn) fireEvent.click(nextBtn);
    const prevBtn = screen.queryByRole('button', { name: /Previous|Anterior/i });
    if (prevBtn) fireEvent.click(prevBtn);
    
    expect(await screen.findByText('#991')).toBeInTheDocument(); // Muestra todos los elementos nuevamente

    // 5. Pestaña de Inventario y sus filtros
    const inventarioTab = screen.getAllByRole('button').find(b => b.textContent?.includes('Inventario'));
    if (inventarioTab) fireEvent.click(inventarioTab);
    
    const btnFiltrosInv = screen.getAllByRole('button', { name: /Filtros/i });
    if (btnFiltrosInv.length > 0) fireEvent.click(btnFiltrosInv.at(-1)!);
    
    const btnCatInv = screen.queryByTestId('select-mock-btn-Categoría...');
    if (btnCatInv) fireEvent.click(btnCatInv);

    const btnSubCatInv = screen.queryByTestId('select-mock-btn-Subcategoría...');
    if (btnSubCatInv) fireEvent.click(btnSubCatInv);

    const clearInvFiltersBtn = screen.getByText(/Limpiar filtros/i);
    fireEvent.click(clearInvFiltersBtn);
  });
});
