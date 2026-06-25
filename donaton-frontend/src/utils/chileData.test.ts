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

  it('debe parsear dirección de mapa vacía', () => {
    const result = parseMapAddress({});
    expect(result.region).toBeUndefined();
    expect(result.comuna).toBeUndefined();
    expect(result.road).toBeUndefined();
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
});
