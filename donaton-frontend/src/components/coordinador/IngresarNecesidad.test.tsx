import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import IngresarNecesidad from './IngresarNecesidad';
import { AuthProvider } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../services/bffService', () => ({
  ingresarNecesidad: vi.fn().mockResolvedValue({})
}));


const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

vi.mock('../registro/MapLocationPicker', () => ({
  MapLocationPicker: ({ onLocationSelect }: any) => (
    <button 
      data-testid="mock-map" 
      onClick={() => onLocationSelect({ lat: -33.4, lng: -70.6, addressDetails: { state: 'Metropolitana', city: 'Santiago' } })}
    >
      Mock Map
    </button>
  )
}));

describe('Epic 3: Coordinación de Emergencias', () => {
  it('Debe desplegar subcategorías correctas y campo Otro', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);

    const selects = container.querySelectorAll('select');
    const categoriaSelect = selects[0];
    
    fireEvent.change(categoriaSelect, { target: { value: 'Alimentos imperecederos' } });

    await waitFor(() => {
      expect(container.querySelectorAll('select').length).toBeGreaterThan(1);
    });
    
    const subcategoriaSelect = container.querySelectorAll('select')[1];

    expect(screen.getByText('Arroz')).toBeInTheDocument();
    expect(screen.getByText('Fideos')).toBeInTheDocument();
    expect(screen.getByText('Otro (Especificar)')).toBeInTheDocument();

    fireEvent.change(subcategoriaSelect, { target: { value: 'Otro' } });

    expect(await screen.findByPlaceholderText(/Ej. Pañales talla G, Colchones, etc./i)).toBeInTheDocument();
  });

  it('Debe permitir añadir recursos a la lista, seleccionar ubicación y registrar la alerta exitosamente', async () => {
    const { container } = renderWithProviders(<IngresarNecesidad />);

    // Añadir recurso
    const selects = container.querySelectorAll('select');
    const categoriaSelect = selects[0];
    fireEvent.change(categoriaSelect, { target: { value: 'Agua e Hidratación' } });

    await waitFor(() => expect(container.querySelectorAll('select').length).toBeGreaterThan(1));
    const subcategoriaSelect = container.querySelectorAll('select')[1];
    fireEvent.change(subcategoriaSelect, { target: { value: 'Agua Embotellada (Bidón)' } });

    const cantidadInput = container.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(cantidadInput, { target: { value: '10' } });

    const btnAdd = screen.getByRole('button', { name: /\+ Añadir a la lista/i });
    fireEvent.click(btnAdd);

    expect(await screen.findByText('Agua Embotellada (Bidón)')).toBeInTheDocument();

    // Llenar tipo de emergencia
    const tipoEmergenciaSelect = container.querySelector('#tipoEmergencia') as HTMLSelectElement;
    fireEvent.change(tipoEmergenciaSelect, { target: { value: 'Incendio' } });

    // Seleccionar ubicación en el mapa mockeado
    const mockMapBtn = screen.getByTestId('mock-map');
    fireEvent.click(mockMapBtn);

    // Enviar formulario
    const submitBtn = screen.getByRole('button', { name: /Registrar Alerta Estructurada/i });
    fireEvent.click(submitBtn);

    // Verificar que se llame al servicio mockeado
    await waitFor(() => {
      expect(screen.getByText(/¡Alerta registrada exitosamente!/i)).toBeInTheDocument();
    });
  });
});
