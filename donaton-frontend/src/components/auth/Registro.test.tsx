import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Registro from './Registro';
import { AuthProvider } from '../../context/AuthContext';
import * as usuarioService from '../../services/usuarioService';

vi.mock('../../services/usuarioService', () => ({
  registrarDonante: vi.fn(),
  verificarEmailDisponible: vi.fn().mockResolvedValue(true),
  verificarRutDisponible: vi.fn().mockResolvedValue(true),
}));

import axios from 'axios';
vi.mock('axios');

vi.mock('../registro/RegistroNatural', () => ({
  RegistroNatural: ({ onSubmit }: any) => (
    <button onClick={() => onSubmit({
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan@test.com',
      password: 'Pass123!',
      codigoPais: '+56',
      telefono: '123456789',
      rut: '12.345.678-5',
      region: 'Metropolitana',
      comuna: 'Santiago',
      direccion: 'Calle 123',
      direccionNumero: '123'
    })}>Simulate Natural Submit</button>
  )
}));

vi.mock('../registro/RegistroJuridica', () => ({
  RegistroJuridica: ({ onSubmit }: any) => (
    <button onClick={() => onSubmit({
      razonSocial: 'Empresa',
      email: 'empresa@test.com',
      password: 'Pass123!',
      codigoPais: '+56',
      telefono: '123456789',
      rut: '76.123.456-7',
      region: 'Metropolitana',
      comuna: 'Santiago',
      direccion: 'Calle 123',
      direccionNumero: '123',
      giro: 'Comercio'
    })}>Simulate Juridica Submit</button>
  )
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
  it('Debe manejar el registro de Persona Jurídica exitosamente (coverage)', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { token: '123', id: 1, email: 'empresa@test.com' } });
    renderWithProviders(<Registro />);

    // Seleccionar Persona Jurídica
    const btnJuridica = screen.getByText('Persona Jurídica');
    fireEvent.click(btnJuridica);

    // Hacer submit del mock
    const btnSubmit = await screen.findByText('Simulate Juridica Submit');
    fireEvent.click(btnSubmit);

    // Verificar que se haya llamado registrarDonante
    await waitFor(() => {
      expect(usuarioService.registrarDonante).toHaveBeenCalled();
    });
  });

  it('Debe manejar el registro de Persona Natural exitosamente (coverage)', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { token: '123', id: 1, email: 'juan@test.com' } });
    renderWithProviders(<Registro />);

    // Seleccionar Persona Natural
    const btnNatural = screen.getByText('Persona Natural');
    fireEvent.click(btnNatural);

    // Hacer submit del mock
    const btnSubmit = await screen.findByText('Simulate Natural Submit');
    fireEvent.click(btnSubmit);

    // Verificar que se haya llamado registrarDonante
    await waitFor(() => {
      expect(usuarioService.registrarDonante).toHaveBeenCalled();
    });
  });

  it('Debe manejar error en el registro', async () => {
    vi.mocked(usuarioService.registrarDonante).mockRejectedValueOnce({ response: { data: { message: 'Error de servidor' } } });
    renderWithProviders(<Registro />);
    
    fireEvent.click(screen.getByText('Persona Natural'));
    const btnSubmit = await screen.findByText('Simulate Natural Submit');
    fireEvent.click(btnSubmit);
    
    // Debería mostrar mensaje de error (Alert)
    expect(await screen.findByText('Error de servidor')).toBeInTheDocument();
  });

  it('Debe ejecutar funciones inline de hover y dismiss error (coverage)', async () => {
    renderWithProviders(<Registro />);

    // Hover cards
    const cardNatural = screen.getByText('Para individuos que desean donar a título personal').closest('.card');
    if (cardNatural) {
      fireEvent.mouseEnter(cardNatural);
      fireEvent.mouseLeave(cardNatural);
    }
    const cardJuridica = screen.getByText('Para empresas e instituciones que desean colaborar').closest('.card');
    if (cardJuridica) {
      fireEvent.mouseEnter(cardJuridica);
      fireEvent.mouseLeave(cardJuridica);
    }

    // Cancelar tipo
    fireEvent.click(screen.getByText('Persona Natural'));
    const btnVolver = await screen.findByText('← Volver');
    fireEvent.click(btnVolver);

    // Alert close (we mock an error state first by failing a submit, then close it)
    vi.mocked(usuarioService.registrarDonante).mockRejectedValueOnce({ response: { data: { message: 'MiError' } } });
    fireEvent.click(await screen.findByText('Persona Natural'));
    fireEvent.click(await screen.findByText('Simulate Natural Submit'));
    
    const alertMsg = await screen.findByText('MiError');
    expect(alertMsg).toBeInTheDocument();
    
    const closeAlertBtn = alertMsg.parentElement?.querySelector('button.btn-close');
    if (closeAlertBtn) fireEvent.click(closeAlertBtn);
  });
});
