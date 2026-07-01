import { renderHook, act } from '@testing-library/react';
import { useBlockNavigation } from './useBlockNavigation';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useLocation, useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}));

describe('useBlockNavigation', () => {
  const mockNavigate = vi.fn();
  const mockOnCancelForm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useLocation as any).mockReturnValue({ hash: '' });

    // Mock history and location for globalThis
    Object.defineProperty(globalThis, 'location', {
      value: { pathname: '/test-path', hash: '' },
      writable: true,
    });

    Object.defineProperty(globalThis, 'history', {
      value: { pushState: vi.fn(), go: vi.fn() },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('debería inicializar con showExitModal en false', () => {
    const { result } = renderHook(() => useBlockNavigation(false, false, mockOnCancelForm));
    expect(result.current.showExitModal).toBe(false);
  });

  it('debería añadir #form al hash de la URL si el formulario está sucio y no enviado', () => {
    renderHook(() => useBlockNavigation(true, false, mockOnCancelForm));
    expect(globalThis.history.pushState).toHaveBeenCalledWith(null, '', '/test-path#form');
  });

  it('debería llamar a onCancelForm al confirmar salida si pendingAction es cancel', () => {
    const { result } = renderHook(() => useBlockNavigation(true, false, mockOnCancelForm));
    
    // Simulate a click on a "Volver" button
    const mockButton = document.createElement('button');
    mockButton.textContent = 'Volver';
    document.body.appendChild(mockButton);
    
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    act(() => {
      mockButton.dispatchEvent(clickEvent);
    });

    act(() => {
      result.current.handleConfirmExit();
    });

    expect(mockOnCancelForm).toHaveBeenCalled();
    mockButton.remove();
  });

  it('debería cerrar el modal si se cancela la salida', () => {
    const { result } = renderHook(() => useBlockNavigation(true, false, mockOnCancelForm));
    
    act(() => {
      // Simulate showing modal (we mock state change by clicking a button)
      const mockButton = document.createElement('button');
      mockButton.textContent = 'Volver';
      document.body.appendChild(mockButton);
      mockButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    
    expect(result.current.showExitModal).toBe(true);

    act(() => {
      result.current.handleCancelExit();
    });

    expect(result.current.showExitModal).toBe(false);
  });
  
  it('debería navegar a la URL al confirmar salida si es un enlace', () => {
    const { result } = renderHook(() => useBlockNavigation(true, false, mockOnCancelForm));
    
    const mockLink = document.createElement('a');
    mockLink.href = '/some-other-path';
    document.body.appendChild(mockLink);
    
    act(() => {
      mockLink.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    
    act(() => {
      result.current.handleConfirmExit();
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/some-other-path');
    mockLink.remove();
  });

  it('debería manejar beforeunload correctamente', () => {
    renderHook(() => useBlockNavigation(true, false, mockOnCancelForm));
    const event = new Event('beforeunload', { cancelable: true });
    globalThis.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('debería manejar popstate correctamente y luego back', () => {
    const { result } = renderHook(() => useBlockNavigation(true, false, mockOnCancelForm));
    const event = new Event('popstate');
    
    act(() => {
      globalThis.dispatchEvent(event);
    });
    
    expect(result.current.showExitModal).toBe(true);

    act(() => {
      result.current.handleConfirmExit();
    });

    expect(globalThis.history.go).toHaveBeenCalledWith(-2);
  });

  it('no debería añadir #form si el formulario no está sucio', () => {
    renderHook(() => useBlockNavigation(false, false, mockOnCancelForm));
    expect(globalThis.history.pushState).not.toHaveBeenCalled();
  });

  it('no debería añadir #form si el formulario ya fue enviado', () => {
    renderHook(() => useBlockNavigation(true, true, mockOnCancelForm));
    expect(globalThis.history.pushState).not.toHaveBeenCalled();
  });

  it('no debería bloquear beforeunload si el formulario fue enviado', () => {
    renderHook(() => useBlockNavigation(true, true, mockOnCancelForm));
    const event = new Event('beforeunload', { cancelable: true });
    globalThis.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('no debería mostrar modal al hacer clic en botón normal cuando no está sucio', () => {
    const { result } = renderHook(() => useBlockNavigation(false, false, mockOnCancelForm));

    const mockButton = document.createElement('button');
    mockButton.textContent = 'Guardar';
    document.body.appendChild(mockButton);

    act(() => {
      mockButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    expect(result.current.showExitModal).toBe(false);
    mockButton.remove();
  });

  it('no debería mostrar modal al hacer clic en botón no relacionado con navegación', () => {
    const { result } = renderHook(() => useBlockNavigation(true, false, mockOnCancelForm));

    const mockButton = document.createElement('button');
    mockButton.textContent = 'Guardar';
    document.body.appendChild(mockButton);

    act(() => {
      mockButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    expect(result.current.showExitModal).toBe(false);
    mockButton.remove();
  });

  it('handleConfirmExit no hace nada si pendingAction es null', () => {
    const { result } = renderHook(() => useBlockNavigation(true, false, mockOnCancelForm));
    
    act(() => {
      result.current.handleConfirmExit();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockOnCancelForm).not.toHaveBeenCalled();
    expect(globalThis.history.go).not.toHaveBeenCalled();
  });

  it('no debería hacer popstate si el formulario no está sucio', () => {
    const { result } = renderHook(() => useBlockNavigation(false, false, mockOnCancelForm));
    const event = new Event('popstate');

    act(() => {
      globalThis.dispatchEvent(event);
    });

    expect(result.current.showExitModal).toBe(false);
  });

  it('no debería hacer popstate si el formulario fue enviado', () => {
    const { result } = renderHook(() => useBlockNavigation(true, true, mockOnCancelForm));
    const event = new Event('popstate');

    act(() => {
      globalThis.dispatchEvent(event);
    });

    expect(result.current.showExitModal).toBe(false);
  });
});
