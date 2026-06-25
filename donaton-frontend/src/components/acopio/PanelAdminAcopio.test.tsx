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
});
