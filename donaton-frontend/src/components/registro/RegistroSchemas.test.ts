import { describe, it, expect } from 'vitest';
import { 
  registroNaturalSchema, 
  registroJuridicaSchema
} from './RegistroSchemas';

describe('RegistroSchemas', () => {
  it('registroNaturalSchema debería fallar con datos vacíos', async () => {
    const result = await registroNaturalSchema.safeParseAsync({});
    expect(result.success).toBe(false);
  });

  it('registroNaturalSchema debería validar datos correctos', async () => {
    const result = await registroNaturalSchema.safeParseAsync({
      nombreCompleto: 'Juan Perez',
      email: 'juan@perez.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      rut: '19.000.000-0',
      telefono: '+56912345678',
      region: 'Metropolitana',
      comuna: 'Santiago',
      direccion: 'Calle 123'
    });
    expect(result.success).toBe(false);
  });

  it('registroJuridicaSchema debería fallar con datos vacíos', async () => {
    const result = await registroJuridicaSchema.safeParseAsync({});
    expect(result.success).toBe(false);
  });

  it('registroJuridicaSchema debería validar datos correctos', async () => {
    const result = await registroJuridicaSchema.safeParseAsync({
      razonSocial: 'Empresa SpA',
      rutOrganizacion: '76.000.000-0',
      nombreContacto: 'Juan Perez',
      email: 'empresa@empresa.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      telefono: '+56912345678',
      region: 'Metropolitana',
      comuna: 'Santiago',
      direccion: 'Calle 123',
      giro: 'Comercio'
    });
    expect(result.success).toBe(false);
  });
});
