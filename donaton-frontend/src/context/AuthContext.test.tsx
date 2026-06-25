import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const TestComponent = () => {
  const { login, logout, usuario, token, isAuthenticated } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Autenticado' : 'No Autenticado'}</div>
      <div data-testid="user-name">{usuario?.nombre || 'Nadie'}</div>
      <div data-testid="user-token">{token || 'Sin Token'}</div>
      
      <button onClick={() => login('token123', { id: 1, nombre: 'Test', rol: 'DONANTE' }, false)}>
        Login Session
      </button>
      <button onClick={() => login('token-remember', { id: 2, nombre: 'RememberMe', rol: 'ADMIN' }, true)}>
        Login Remember
      </button>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const NoProviderComponent = () => {
  useAuth();
  return <div>Hola</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('debería inicializar sin usuario', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('No Autenticado');
    expect(screen.getByTestId('user-name').textContent).toBe('Nadie');
  });

  it('debería hacer login y guardar en sessionStorage (rememberMe false)', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Session'));

    expect(screen.getByTestId('auth-status').textContent).toBe('Autenticado');
    expect(screen.getByTestId('user-name').textContent).toBe('Test');
  });

  it('debería hacer login y guardar en localStorage (rememberMe true)', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Remember'));

    expect(screen.getByTestId('auth-status').textContent).toBe('Autenticado');
    expect(screen.getByTestId('user-name').textContent).toBe('RememberMe');
  });

  it('debería hacer logout y limpiar storage', () => {
    localStorage.setItem('donaton_token', 'old');
    sessionStorage.setItem('donaton_token', 'old');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login Session'));
    expect(screen.getByTestId('auth-status').textContent).toBe('Autenticado');

    fireEvent.click(screen.getByText('Logout'));
    
    expect(screen.getByTestId('auth-status').textContent).toBe('No Autenticado');
    expect(localStorage.getItem('donaton_token')).toBeNull();
    expect(sessionStorage.getItem('donaton_token')).toBeNull();
  });

  it('debería inicializar con usuario de storage', () => {
    sessionStorage.setItem('donaton_token', 'token123');
    sessionStorage.setItem('donaton_user', JSON.stringify({ id: 10, nombre: 'Stored', rol: 'LOGISTICA' }));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('Autenticado');
    expect(screen.getByTestId('user-name').textContent).toBe('Stored');
  });

  it('debería manejar error al parsear el usuario almacenado', () => {
    sessionStorage.setItem('donaton_token', 'token123');
    sessionStorage.setItem('donaton_user', 'invalid json');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-name').textContent).toBe('Nadie');
  });

  it('debería lanzar error si useAuth se usa fuera del provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<NoProviderComponent />)).toThrow('useAuth debe ser usado dentro de un AuthProvider');
    spy.mockRestore();
  });
});
