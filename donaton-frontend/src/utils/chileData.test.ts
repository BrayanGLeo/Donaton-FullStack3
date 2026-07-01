import { describe, it, expect } from 'vitest';
import { REGIONES_CHILE, COMUNAS_POR_REGION, parseMapAddress } from './chileData';

describe('chileData', () => {
  it('debe contener regiones de Chile', () => {
    expect(REGIONES_CHILE.length).toBeGreaterThan(0);
    expect(REGIONES_CHILE).toContain('Metropolitana de Santiago');
  });

  it('debe contener comunas por región', () => {
    expect(COMUNAS_POR_REGION['Metropolitana de Santiago'].length).toBeGreaterThan(0);
    expect(COMUNAS_POR_REGION['Metropolitana de Santiago']).toContain('Santiago');
  });

  it('COMUNAS_POR_REGION tiene todas las regiones de REGIONES_CHILE', () => {
    for (const region of REGIONES_CHILE) {
      expect(COMUNAS_POR_REGION[region]).toBeDefined();
      expect(COMUNAS_POR_REGION[region].length).toBeGreaterThan(0);
    }
  });

  it('debe parsear dirección de mapa vacía', () => {
    const result = parseMapAddress({});
    expect(result.region).toBeUndefined();
    expect(result.comuna).toBeUndefined();
    expect(result.road).toBeUndefined();
  });

  it('retorna objeto vacío cuando addressDetails es null', () => {
    const result = parseMapAddress(null);
    expect(result).toEqual({});
  });

  it('retorna objeto vacío cuando addressDetails es undefined', () => {
    const result = parseMapAddress(undefined);
    expect(result).toEqual({});
  });

  it('debe parsear dirección de mapa con datos', () => {
    const address = {
      state: 'Metropolitana',
      city: 'Santiago',
      road: 'Av. Libertador',
      house_number: '123'
    };
    const result = parseMapAddress(address);
    expect(result.region).toBe('Metropolitana de Santiago');
    expect(result.comuna).toBe('Santiago');
    expect(result.road).toBe('Av. Libertador');
    expect(result.houseNumber).toBe('123');
  });

  it('encuentra región por coincidencia parcial en state', () => {
    // 'Metropolitana' está contenido en 'Metropolitana de Santiago'
    const result = parseMapAddress({ state: 'Metropolitana' });
    expect(result.region).toBe('Metropolitana de Santiago');
  });

  it('encuentra comunas usando town', () => {
    const result = parseMapAddress({
      state: 'Biobío',
      town: 'Concepción',
    });
    expect(result.region).toBe('Biobío');
    expect(result.comuna).toBe('Concepción');
  });

  it('encuentra comunas usando village', () => {
    const result = parseMapAddress({
      state: 'Valparaíso',
      village: 'Zapallar',
    });
    expect(result.region).toBe('Valparaíso');
    expect(result.comuna).toBe('Zapallar');
  });

  it('encuentra comunas usando municipality', () => {
    const result = parseMapAddress({
      state: 'Metropolitana de Santiago',
      municipality: 'Maipú',
    });
    expect(result.region).toBe('Metropolitana de Santiago');
    expect(result.comuna).toBe('Maipú');
  });

  it('no asigna comuna si city no coincide con ninguna', () => {
    const result = parseMapAddress({
      state: 'Metropolitana de Santiago',
      city: 'CiudadInventadaXYZ',
    });
    expect(result.region).toBe('Metropolitana de Santiago');
    expect(result.comuna).toBeUndefined();
  });

  it('no asigna región si state no coincide', () => {
    const result = parseMapAddress({ state: 'Región Inventada XYZ' });
    expect(result.region).toBeUndefined();
  });

  it('procesa dirección completa con todas las propiedades', () => {
    const result = parseMapAddress({
      road: 'Av. Providencia',
      house_number: '500',
      state: 'Metropolitana',
      city: 'Providencia',
    });
    expect(result.road).toBe('Av. Providencia');
    expect(result.houseNumber).toBe('500');
    expect(result.region).toBe('Metropolitana de Santiago');
    expect(result.comuna).toBe('Providencia');
  });

  it('extrae solo road y house_number sin state', () => {
    const result = parseMapAddress({
      road: 'Calle Las Flores',
      house_number: '42',
    });
    expect(result.road).toBe('Calle Las Flores');
    expect(result.houseNumber).toBe('42');
    expect(result.region).toBeUndefined();
  });
});
