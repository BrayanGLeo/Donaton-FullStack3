import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Registro from './Registro';
import { AuthProvider } from '../../context/AuthContext';
import * as usuarioService from '../../services/usuarioService';

// Mock services to prevent actual API calls
vi.mock('../../services/usuarioService', () => ({
  registrarDonante: vi.fn(),
  verificarEmailDisponible: vi.fn().mockResolvedValue(true),
  verificarRutDisponible: vi.fn().mockResolvedValue(true),
}));

// Provide router and context wrapper
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Epic 1: Registro de Usuarios (Persona Juridica vs Natural)', () => {
  it('Debe exigir Razón Social al registrar una Persona Jurídica', async () => {
    renderWithProviders(<Registro />);

    // Seleccionar Persona Jurídica
    const btnJuridica = screen.getByText('Persona Jurídica');
    fireEvent.click(btnJuridica);

    // Buscar el botón de enviar
    const btnSubmit = await screen.findByRole('button', { name: /Completar Registro/i });
    
    // Dejar todos los campos vacíos (incluyendo razón social) y enviar
    fireEvent.click(btnSubmit);

    // Verificar que aparece el error de Razón Social obligatoria
    expect(await screen.findByText('La razón social debe tener al menos 3 caracteres')).toBeInTheDocument();
  });

  it('No debe exigir Razón Social al registrar una Persona Natural', async () => {
    renderWithProviders(<Registro />);

    // Seleccionar Persona Natural
    const btnNatural = screen.getByText('Persona Natural');
    fireEvent.click(btnNatural);

    // Buscar el botón de enviar
    const btnSubmit = await screen.findByRole('button', { name: /Completar Registro/i });
    
    // Intentar enviar
    fireEvent.click(btnSubmit);

    // Para persona natural, deben fallar Nombres y Apellidos, pero NO razón social
    expect(await screen.findByText(/El nombre/i)).toBeInTheDocument(); 
    expect(screen.queryByText('La razón social debe tener al menos 3 caracteres')).not.toBeInTheDocument();
  });
});
