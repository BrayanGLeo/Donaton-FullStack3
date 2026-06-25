import { describe, it, expect, vi } from 'vitest';
import { 
  registroNaturalSchema, 
  registroJuridicaSchema,
  adminUserSchema
} from './RegistroSchemas';


vi.mock('../../services/usuarioService', () => ({
  verificarEmailDisponible: vi.fn().mockResolvedValue(true),
  verificarRutDisponible: vi.fn().mockResolvedValue(true),
}));

describe('RegistroSchemas', () => {
  it('registroNaturalSchema debería fallar con datos vacíos', async () => {
    const result = await registroNaturalSchema.safeParseAsync({});
    expect(result.success).toBe(false);
  });

  it('registroNaturalSchema debería validar datos correctos', async () => {
    const result = await registroNaturalSchema.safeParseAsync({
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan@gmail.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      rut: '12.345.678-5',
      telefono: '912345678',
      codigoPais: '+56',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
      direccion: 'Calle 123',
      direccionNumero: '123'
    });
    if (!result.success) {
      console.log("ERRORES REGISTRO NATURAL:", result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it('registroJuridicaSchema debería validar datos correctos', async () => {
    const result = await registroJuridicaSchema.safeParseAsync({
      razonSocial: 'Empresa SpA',
      rut: '12.345.678-5',
      nombreContacto: 'Juan Perez',
      email: 'empresa@gmail.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      telefono: '912345678',
      codigoPais: '+56',
      region: 'Metropolitana de Santiago',
      comuna: 'Santiago',
      direccion: 'Calle 123',
      direccionNumero: '123',
      giro: 'Comercio'
    });
    expect(result.success).toBe(true);
  });

  it('adminUserSchema logística conductor requiere vehiculo y matricula', async () => {
    const result = await adminUserSchema.safeParseAsync({
      rol: 'LOGISTICA',
      subRol: 'CONDUCTOR',
      email: 'admin@gmail.com',
      rut: '19.000.000-0',
      nombre: 'Juan',
      apellido: 'Perez',
      password: 'Pass',
      region: 'Metro',
      comuna: 'Stgo',
      direccion: 'Dir',
      codigoPais: '+56',
      telefono: '12345'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('tipoVehiculo'))).toBe(true);
      expect(result.error.issues.some(i => i.path.includes('matricula'))).toBe(true);
    }
  });

  it('adminUserSchema recepcionista requiere acopio', async () => {
    const result = await adminUserSchema.safeParseAsync({
      rol: 'LOGISTICA',
      subRol: 'RECEPCIONISTA',
      email: 'admin@gmail.com',
      rut: '19.000.000-0',
      nombre: 'Juan',
      apellido: 'Perez',
      password: 'Pass',
      region: 'Metro',
      comuna: 'Stgo',
      direccion: 'Dir',
      codigoPais: '+56',
      telefono: '12345'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('regionAcopio'))).toBe(true);
      expect(result.error.issues.some(i => i.path.includes('centroAcopioId'))).toBe(true);
    }
  });

  it('adminUserSchema logistica sin subrol falla', async () => {
    const result = await adminUserSchema.safeParseAsync({
      rol: 'LOGISTICA'
    });
    expect(result.success).toBe(false);
  });
});
