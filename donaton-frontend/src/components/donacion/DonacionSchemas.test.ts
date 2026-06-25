import { describe, it, expect } from 'vitest';
import { donacionStep1Schema, donacionStep2Schema } from './DonacionSchemas';

describe('DonacionSchemas', () => {
  it('donacionStep1Schema requiere campos basicos', () => {
    const result = donacionStep1Schema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('donacionStep1Schema valida requiere subcategoria', () => {
    const result = donacionStep1Schema.safeParse({
      nombreArticulo: 'Pantalón',
      categoria: 'Ropa',
      descripcion: 'Ropa de abrigo',
      cantidad: 1,
      unidadMedida: 'Unidad',
      estadoArticulo: 'NUEVO',
      visibilidad: 'PUBLICA'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('subCategoria'))).toBe(true);
    }
  });

  it('donacionStep1Schema valida comida requiere caducidad', () => {
    const result = donacionStep1Schema.safeParse({
      nombreArticulo: 'Fideos',
      categoria: 'Alimentos',
      subCategoria: 'Fideos/Pastas',
      descripcion: 'Comida no perecible',
      cantidad: 1,
      unidadMedida: 'Unidad',
      estadoArticulo: 'NUEVO',
      visibilidad: 'PUBLICA'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('fechaVencimiento'))).toBe(true);
    }
  });

  it('donacionStep2Schema requiere retiro direccion', () => {
    const result = donacionStep2Schema.safeParse({
      modalidadEntrega: 'Retiro'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('direccionRetiroCalle'))).toBe(true);
      expect(result.error.issues.some(i => i.path.includes('regionRetiro'))).toBe(true);
      expect(result.error.issues.some(i => i.path.includes('comunaRetiro'))).toBe(true);
    }
  });

  it('donacionStep2Schema requiere centro de acopio', () => {
    const result = donacionStep2Schema.safeParse({
      modalidadEntrega: 'Acopio'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('centroAcopioDestinoId'))).toBe(true);
    }
  });
});
