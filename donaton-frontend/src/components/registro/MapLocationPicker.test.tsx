import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MapLocationPicker } from './MapLocationPicker';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  useMapEvents: vi.fn(),
  useMap: () => ({
    flyTo: vi.fn(),
    getZoom: vi.fn().mockReturnValue(15)
  })
}));

describe('MapLocationPicker', () => {
  let mockGeolocation: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockGeolocation = {
      getCurrentPosition: vi.fn()
    };
    (globalThis as any).navigator.geolocation = mockGeolocation;
    globalThis.fetch = vi.fn() as any;
  });

  it('Debe renderizar correctamente', () => {
    render(<MapLocationPicker onLocationSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Buscar dirección/i)).toBeInTheDocument();
  });

  it('Debe buscar direcciones y mostrar dropdown', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      json: async () => [
        { place_id: 1, display_name: 'Santiago, Chile', lat: '-33.4', lon: '-70.6', address: { city: 'Santiago' } }
      ]
    } as any);

    render(<MapLocationPicker onLocationSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText(/Buscar dirección/i);
    
    fireEvent.change(input, { target: { value: 'Santiago' } });

    await waitFor(() => {
      expect(screen.getByText('Santiago, Chile')).toBeInTheDocument();
    });

    const suggestion = screen.getByText('Santiago, Chile');
    fireEvent.click(suggestion);

    await waitFor(() => {
      expect(input).toHaveValue('Santiago, Chile');
    });
  });

  it('Debe usar ubicación actual si el usuario permite', async () => {
    const onLocationSelect = vi.fn();
    mockGeolocation.getCurrentPosition.mockImplementation((success: any) => {
      success({ coords: { latitude: -33.4, longitude: -70.6 } });
    });
    
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      json: async () => ({ address: { city: 'Santiago' }, display_name: 'Mi Ubicacion' })
    } as any);

    render(<MapLocationPicker onLocationSelect={onLocationSelect} />);
    const btnLocate = screen.getByText(/Usar mi ubicación actual/i);
    fireEvent.click(btnLocate);

    await waitFor(() => {
      expect(onLocationSelect).toHaveBeenCalled();
    });
  });

  it('Debe manejar error en geolocalizacion', async () => {
    const originalAlert = globalThis.alert;
    globalThis.alert = vi.fn();
    mockGeolocation.getCurrentPosition.mockImplementation((_success: any, error: any) => {
      error(new Error('Denied'));
    });

    render(<MapLocationPicker onLocationSelect={vi.fn()} />);
    const btnLocate = screen.getByText(/Usar mi ubicación actual/i);
    fireEvent.click(btnLocate);

    await waitFor(() => {
      expect(globalThis.alert).toHaveBeenCalledWith(expect.stringContaining('No se pudo obtener'));
    });
    
    globalThis.alert = originalAlert;
  });
  
  it('Debe manejar cuando no existe navigator.geolocation', async () => {
    const originalAlert = globalThis.alert;
    globalThis.alert = vi.fn();
    delete (globalThis as any).navigator.geolocation;

    render(<MapLocationPicker onLocationSelect={vi.fn()} />);
    const btnLocate = screen.getByText(/Usar mi ubicación actual/i);
    fireEvent.click(btnLocate);

    expect(globalThis.alert).toHaveBeenCalledWith(expect.stringContaining('soportada por tu navegador'));
    
    globalThis.alert = originalAlert;
  });

  it('Debe renderizar con prop error mostrando mensaje', () => {
    render(<MapLocationPicker onLocationSelect={vi.fn()} error="Campo requerido" />);
    expect(screen.getByText('Campo requerido')).toBeInTheDocument();
  });

  it('Debe renderizar con prop disabled deshabilitando controles', () => {
    render(<MapLocationPicker onLocationSelect={vi.fn()} disabled={true} />);
    const input = screen.getByPlaceholderText(/Buscar dirección/i);
    expect(input).toBeDisabled();
    const btnLocate = screen.getByText(/Usar mi ubicación actual/i);
    expect(btnLocate).toBeDisabled();
  });

  it('Debe renderizar con initialLocation', () => {
    render(<MapLocationPicker onLocationSelect={vi.fn()} initialLocation={{ lat: -33.4489, lng: -70.6693 }} />);
    expect(screen.getByPlaceholderText(/Buscar dirección/i)).toBeInTheDocument();
  });

  it('No debe llamar fetch si el query tiene menos de 3 caracteres', async () => {
    render(<MapLocationPicker onLocationSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText(/Buscar dirección/i);
    fireEvent.change(input, { target: { value: 'Ab' } });
    await new Promise(r => setTimeout(r, 600));
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('Debe manejar error de fetch silenciosamente al buscar', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValueOnce(new Error('Network error'));
    render(<MapLocationPicker onLocationSelect={vi.fn()} />);
    const input = screen.getByPlaceholderText(/Buscar dirección/i);
    fireEvent.change(input, { target: { value: 'Santiago' } });
    await waitFor(() => {
      expect(input).toBeInTheDocument();
    });
  });
});

