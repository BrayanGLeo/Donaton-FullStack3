import { describe, it, expect } from 'vitest';
import { donacionStep1Schema, donacionStep2Schema, getMaxYearsForSubcategory } from './DonacionSchemas';

// ─── getMaxYearsForSubcategory ────────────────────────────────────────────────
describe('getMaxYearsForSubcategory', () => {
  it('retorna 5 cuando subCategoria es undefined', () => {
    expect(getMaxYearsForSubcategory()).toBe(5);
  });

  it('retorna 5 cuando subCategoria es cadena vacía', () => {
    expect(getMaxYearsForSubcategory('')).toBe(5);
  });

  it('retorna 3 para Fideos', () => {
    expect(getMaxYearsForSubcategory('Fideos')).toBe(3);
  });

  it('retorna 2 para Aceite', () => {
    expect(getMaxYearsForSubcategory('Aceite')).toBe(2);
  });

  it('retorna 5 para Atún en Conserva', () => {
    expect(getMaxYearsForSubcategory('Atún en Conserva')).toBe(5);
  });

  it('retorna 1 para Harina', () => {
    expect(getMaxYearsForSubcategory('Harina')).toBe(1);
  });

  it('retorna 3 para Alcohol Gel', () => {
    expect(getMaxYearsForSubcategory('Alcohol Gel')).toBe(3);
  });

  it('retorna 5 por defecto para subcategoria desconocida', () => {
    expect(getMaxYearsForSubcategory('Subcategoria Inexistente')).toBe(5);
  });
});

// ─── donacionStep1Schema ──────────────────────────────────────────────────────
describe('DonacionSchemas', () => {
  it('donacionStep1Schema requiere campos basicos', () => {
    const result = donacionStep1Schema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('donacionStep1Schema valida requiere subcategoria', () => {
    const result = donacionStep1Schema.safeParse({
      nombreArticulo: 'Pantalón',
      descripcion: 'Ropa de abrigo',
      visibilidad: 'PUBLICA',
      recursos: [{
        categoria: 'Ropa',
        cantidad: 1,
        unidadMedida: 'Unidad',
        estadoArticulo: 'NUEVO'
      }]
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('subCategoria'))).toBe(true);
    }
  });

  it('donacionStep1Schema valida comida requiere caducidad', () => {
    const result = donacionStep1Schema.safeParse({
      nombreArticulo: 'Fideos',
      descripcion: 'Comida no perecible',
      visibilidad: 'PUBLICA',
      recursos: [{
        categoria: 'Alimentos',
        subCategoria: 'Fideos',
        cantidad: 1,
        unidadMedida: 'Unidad',
        estadoArticulo: 'NUEVO'
      }]
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path.includes('fechaVencimiento'))).toBe(true);
    }
  });

  it('donacionStep1Schema rechaza fecha de vencimiento en el pasado', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const result = donacionStep1Schema.safeParse({
      nombreArticulo: 'Agua',
      descripcion: 'Agua potable',
      visibilidad: 'PUBLICA',
      recursos: [{
        categoria: 'Agua e Hidratación',
        subCategoria: 'Agua Embotellada (Bidón)',
        cantidad: 5,
        unidadMedida: 'Unidades',
        estadoArticulo: 'NUEVO',
        fechaVencimiento: yesterdayStr,
      }]
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map(i => i.message);
      expect(msgs.some(m => m.includes('posterior') || m.includes('pasado'))).toBe(true);
    }
  });

  it('donacionStep1Schema rechaza fecha que excede el máximo de años', () => {
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 10);
    const farFutureStr = farFuture.toISOString().split('T')[0];

    const result = donacionStep1Schema.safeParse({
      nombreArticulo: 'Agua',
      descripcion: 'Agua potable',
      visibilidad: 'PUBLICA',
      recursos: [{
        categoria: 'Agua e Hidratación',
        subCategoria: 'Agua Embotellada (Bidón)',
        cantidad: 5,
        unidadMedida: 'Unidades',
        estadoArticulo: 'NUEVO',
        fechaVencimiento: farFutureStr,
      }]
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map(i => i.message);
      expect(msgs.some(m => m.includes('exceder'))).toBe(true);
    }
  });

  it('donacionStep1Schema rechaza campos que empiezan con espacio', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const result = donacionStep1Schema.safeParse({
      nombreArticulo: ' Fideos',
      descripcion: 'Comida no perecible',
      visibilidad: 'PUBLICA',
      recursos: [{
        categoria: 'Alimentos',
        subCategoria: 'Fideos',
        cantidad: 1,
        unidadMedida: 'Unidad',
        estadoArticulo: 'NUEVO',
        fechaVencimiento: tomorrowStr,
      }]
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map(i => i.message);
      expect(msgs.some(m => m.includes('espacio'))).toBe(true);
    }
  });

  it('donacionStep1Schema acepta recurso de Insumos Médicos con fecha válida', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const futureStr = future.toISOString().split('T')[0];

    const result = donacionStep1Schema.safeParse({
      nombreArticulo: 'Paracetamol',
      descripcion: 'Medicamento básico',
      visibilidad: 'PUBLICA',
      recursos: [{
        categoria: 'Insumos Médicos',
        subCategoria: 'Paracetamol',
        cantidad: 10,
        unidadMedida: 'Unidades',
        estadoArticulo: 'NUEVO',
        fechaVencimiento: futureStr,
      }]
    });
    expect(result.success).toBe(true);
  });

  it('donacionStep1Schema rechaza campo de recurso que empieza con espacio', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    const futureStr = future.toISOString().split('T')[0];

    const result = donacionStep1Schema.safeParse({
      nombreArticulo: 'Comida',
      descripcion: 'Descripción',
      visibilidad: 'PUBLICA',
      recursos: [{
        categoria: 'Insumos Médicos',
        subCategoria: ' Paracetamol',
        cantidad: 10,
        unidadMedida: 'Unidades',
        estadoArticulo: 'NUEVO',
        fechaVencimiento: futureStr,
      }]
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map(i => i.message);
      expect(msgs.some(m => m.includes('espacio'))).toBe(true);
    }
  });

  // ─── donacionStep2Schema ────────────────────────────────────────────────────
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

  it('donacionStep2Schema Retiro válido con todos los campos', () => {
    const result = donacionStep2Schema.safeParse({
      modalidadEntrega: 'Retiro',
      regionRetiro: 'Metropolitana de Santiago',
      comunaRetiro: 'Santiago',
      direccionRetiroCalle: 'Alameda',
      direccionRetiroNumero: '1234',
      disponibilidadHoraria: '9:00-18:00',
      latitudRetiro: -33.4489,
      longitudRetiro: -70.6693,
    });
    expect(result.success).toBe(true);
  });

  it('donacionStep2Schema Retiro rechaza si falta ubicación en mapa', () => {
    const result = donacionStep2Schema.safeParse({
      modalidadEntrega: 'Retiro',
      regionRetiro: 'Metropolitana de Santiago',
      comunaRetiro: 'Santiago',
      direccionRetiroCalle: 'Alameda',
      direccionRetiroNumero: '1234',
      disponibilidadHoraria: '9:00-18:00',
      // sin latitud/longitud
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map(i => i.message);
      expect(msgs.some(m => m.includes('mapa'))).toBe(true);
    }
  });

  it('donacionStep2Schema rechaza campo que empieza con espacio', () => {
    const result = donacionStep2Schema.safeParse({
      modalidadEntrega: ' Acopio'
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msgs = result.error.issues.map(i => i.message);
      expect(msgs.some(m => m.includes('espacio'))).toBe(true);
    }
  });

  it('donacionStep2Schema Acopio válido con centroAcopioDestinoId positivo', () => {
    const result = donacionStep2Schema.safeParse({
      modalidadEntrega: 'Acopio',
      centroAcopioDestinoId: 5,
    });
    expect(result.success).toBe(true);
  });
});
