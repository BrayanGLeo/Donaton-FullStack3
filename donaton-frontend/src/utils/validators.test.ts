import { describe, it, expect, vi } from 'vitest';
import {
  validarNombres,
  validarPassword,
  validarEmailDominio,
  validarTelefono,
  validarRutChileno,
  validarNumeroCasa,
  getPasswordStrength,
  formatRutInput,
  formatPhoneInput,
  formatNameInput,
  formatNoSpaceInput,
  preventSpaceKeyDown,
  preventRutKeyDown,
  preventPhoneKeyDown
} from './validators';

describe('Utilidades de Validación (validators.ts)', () => {
  const createMockEvent = (value: string, selectionStart: number = value.length) => ({
    currentTarget: {
      value,
      selectionStart,
      selectionEnd: selectionStart,
      setSelectionRange: vi.fn(),
    }
  } as unknown as any);

  describe('validarNombres', () => {
    it('debería retornar true para nombres válidos', () => {
      expect(validarNombres('Juan Pérez')).toBe(true);
      expect(validarNombres('María-José O\'Connor')).toBe(true);
      expect(validarNombres('Ana')).toBe(true);
    });

    it('debería retornar false para nombres inválidos', () => {
      expect(validarNombres('')).toBe(false);
      expect(validarNombres('   ')).toBe(false);
      expect(validarNombres('Juan123')).toBe(false);
      expect(validarNombres('Pedro_Perez')).toBe(false);
    });
  });

  describe('validarPassword', () => {
    it('debería retornar true para contraseñas válidas', () => {
      expect(validarPassword('Pass123!')).toBe(true); // 4 letters, 3 numbers
      expect(validarPassword('abc12345')).toBe(true);
    });

    it('debería retornar false para contraseñas inválidas', () => {
      expect(validarPassword('ab12')).toBe(false); // < 3 letters, < 3 numbers
      expect(validarPassword('123456')).toBe(false); // no letters
      expect(validarPassword('abcdef')).toBe(false); // no numbers
      expect(validarPassword('Pass123!ñ')).toBe(false); // invalid char
    });
  });

  describe('validarEmailDominio', () => {
    it('debería retornar true para dominios permitidos', () => {
      expect(validarEmailDominio('test@gmail.com')).toBe(true);
      expect(validarEmailDominio('test@duocuc.cl')).toBe(true);
      expect(validarEmailDominio('test@alumnos.duoc.cl')).toBe(true);
      expect(validarEmailDominio('test@bancoestado.cl')).toBe(true);
    });

    it('debería retornar false para dominios no permitidos o inválidos', () => {
      expect(validarEmailDominio('test@randomdomain.xyz')).toBe(false);
      expect(validarEmailDominio('test@duoc.com')).toBe(false);
      expect(validarEmailDominio('invalid-email')).toBe(false);
    });
  });

  describe('validarTelefono', () => {
    it('debería retornar true para teléfonos con longitud correcta', () => {
      expect(validarTelefono('912345678')).toBe(true);
      expect(validarTelefono('+56912345678')).toBe(true);
      expect(validarTelefono('12345678')).toBe(true);
    });

    it('debería retornar false para teléfonos inválidos', () => {
      expect(validarTelefono('1234567')).toBe(false); // < 8
      expect(validarTelefono('123456789012345')).toBe(false); // > 14
    });
  });

  describe('validarRutChileno', () => {
    it('debería retornar true para RUTs válidos', () => {
      expect(validarRutChileno('19054326-9')).toBe(true); // Valid RUT
      expect(validarRutChileno('19.054.326-9')).toBe(true); // Valid RUT
      expect(validarRutChileno('1-9')).toBe(true); // Valid RUT
    });

    it('debería retornar false para RUTs inválidos', () => {
      expect(validarRutChileno('19054326-8')).toBe(false); // Invalid digit
      expect(validarRutChileno('123456')).toBe(false); // Invalid format
      expect(validarRutChileno('')).toBe(false); // Empty
    });
  });

  describe('validarNumeroCasa', () => {
    it('debería retornar true para números de casa válidos', () => {
      expect(validarNumeroCasa('123')).toBe(true);
      expect(validarNumeroCasa('1')).toBe(true);
      expect(validarNumeroCasa('123456')).toBe(true);
    });

    it('debería retornar false para números de casa inválidos', () => {
      expect(validarNumeroCasa('')).toBe(false);
      expect(validarNumeroCasa(' ')).toBe(false);
      expect(validarNumeroCasa('1234567')).toBe(false);
    });
  });

  describe('getPasswordStrength', () => {
    it('debería calcular correctamente la fuerza de la contraseña', () => {
      const weak = getPasswordStrength('a1');
      expect(weak.strengthLabel).toBe('Débil');

      const medium = getPasswordStrength('abcdef');
      expect(medium.strengthLabel).toBe('Media');

      const good = getPasswordStrength('abcdef123');
      expect(good.strengthLabel).toBe('Buena');

      const strong = getPasswordStrength('abcdef123!');
      expect(strong.strengthLabel).toBe('Fuerte');
    });
    
    it('debería manejar contraseña vacía', () => {
      const empty = getPasswordStrength('');
      expect(empty.strengthLabel).toBe('');
    });
  });

  describe('Funciones formatInput', () => {
    it('formatRutInput debería formatear correctamente un RUT', () => {
      let event = createMockEvent('190543269');
      formatRutInput(event);
      expect(event.currentTarget.value).toBe('19.054.326-9');
      
      event = createMockEvent('1');
      formatRutInput(event);
      expect(event.currentTarget.value).toBe('1');
    });

    it('formatPhoneInput debería dar formato a números de teléfono', () => {
      let event = createMockEvent('56912345678');
      formatPhoneInput(event);
      expect(event.currentTarget.value).toBe('5 6912 3456'); // The phone logic limits to 9 digits and splits it
      
      event = createMockEvent('1234');
      formatPhoneInput(event);
      expect(event.currentTarget.value).toBe('1 234');

      event = createMockEvent('1');
      formatPhoneInput(event);
      expect(event.currentTarget.value).toBe('1');
    });

    it('formatNameInput debería limpiar y formatear nombres', () => {
      let event = createMockEvent('juan perez');
      formatNameInput(event);
      expect(event.currentTarget.value).toBe('Juan Perez');

      event = createMockEvent('juan123');
      formatNameInput(event);
      expect(event.currentTarget.value).toBe('Juan');
    });

    it('formatNoSpaceInput debería remover espacios', () => {
      let event = createMockEvent('hola mundo');
      formatNoSpaceInput(event);
      expect(event.currentTarget.value).toBe('holamundo');
    });
  });

  describe('Funciones preventKeyDown', () => {
    const createMockKeyboardEvent = (key: string, ctrlKey = false) => ({
      key,
      ctrlKey,
      metaKey: false,
      altKey: false,
      preventDefault: vi.fn(),
    } as unknown as any);

    it('preventSpaceKeyDown debería bloquear barra espaciadora', () => {
      const event = createMockKeyboardEvent(' ');
      preventSpaceKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('preventSpaceKeyDown no bloquea otras teclas', () => {
      const event = createMockKeyboardEvent('a');
      preventSpaceKeyDown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('preventRutKeyDown debería bloquear letras distintas a K y números', () => {
      const event = createMockKeyboardEvent('a');
      preventRutKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalled();
      
      const eventValid = createMockKeyboardEvent('k');
      preventRutKeyDown(eventValid);
      expect(eventValid.preventDefault).not.toHaveBeenCalled();
    });

    it('preventRutKeyDown no bloquea teclas de control (Ctrl+C)', () => {
      const event = createMockKeyboardEvent('c', true);
      preventRutKeyDown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('preventRutKeyDown no bloquea teclas especiales (Enter, Backspace)', () => {
      const event = createMockKeyboardEvent('Enter');
      preventRutKeyDown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('preventPhoneKeyDown debería bloquear no-números', () => {
      const event = createMockKeyboardEvent('a');
      preventPhoneKeyDown(event);
      expect(event.preventDefault).toHaveBeenCalled();
      
      const eventValid = createMockKeyboardEvent('5');
      preventPhoneKeyDown(eventValid);
      expect(eventValid.preventDefault).not.toHaveBeenCalled();

      const eventCtrl = createMockKeyboardEvent('v', true);
      preventPhoneKeyDown(eventCtrl);
      expect(eventCtrl.preventDefault).not.toHaveBeenCalled();
    });

    it('preventPhoneKeyDown no bloquea teclas especiales (ArrowLeft)', () => {
      const event = createMockKeyboardEvent('ArrowLeft');
      preventPhoneKeyDown(event);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('formatRutInput casos borde', () => {
    it('no cambia el valor si ya está formateado correctamente', () => {
      const event = createMockEvent('19.054.326-9');

      formatRutInput(event);
      // Si el valor ya estaba bien formateado, no debería llamar setSelectionRange de forma especial
      expect(event.currentTarget.value).toBe('19.054.326-9');
    });

    it('maneja RUT vacío sin errores', () => {
      const event = createMockEvent('');
      formatRutInput(event);
      expect(event.currentTarget.value).toBe('');
    });

    it('maneja selectionStart null correctamente en formatNameInput', () => {
      const event = {
        currentTarget: {
          value: 'juan123',
          selectionStart: null,
          selectionEnd: null,
          setSelectionRange: vi.fn(),
        }
      } as unknown as any;
      formatNameInput(event);
      expect(event.currentTarget.value).toBe('Juan');
    });
  });

  describe('formatPhoneInput casos borde', () => {
    it('maneja cadena vacía sin errores', () => {
      const event = createMockEvent('');
      formatPhoneInput(event);
      expect(event.currentTarget.value).toBe('');
    });

    it('no cambia valor si ya está formateado', () => {
      const event = createMockEvent('9 1234 5678');
      formatPhoneInput(event);
      expect(event.currentTarget.value).toBe('9 1234 5678');
    });
  });

  describe('formatNoSpaceInput casos borde', () => {
    it('no cambia el valor si no tiene espacios', () => {
      const event = createMockEvent('holamundo');
      const setSelectionRangeSpy = event.currentTarget.setSelectionRange;
      formatNoSpaceInput(event);
      expect(event.currentTarget.value).toBe('holamundo');
      // Como el valor no cambió, no debería llamar setSelectionRange
      expect(setSelectionRangeSpy).not.toHaveBeenCalled();
    });
  });
});

