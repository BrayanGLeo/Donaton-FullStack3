import { describe, it, expect } from 'vitest';
import { flattenResourceUnit, getUnidadesDisponibles, getEnvasesPallet } from './unidadesLogic';

describe('unidadesLogic', () => {
  describe('flattenResourceUnit', () => {
    it('debe mantener la unidad y cantidad si no es compleja', () => {
      const result = flattenResourceUnit({ unidad: 'Litros', subCategoria: 'Agua' }, 10);
      expect(result).toEqual({ finalCantidad: 10, finalUnidad: 'Litros' });
    });

    describe('Sacos', () => {
      it('debe multiplicar por el peso si es un saco con pesoPorSaco', () => {
        const result = flattenResourceUnit({ unidad: 'Sacos', subCategoria: 'Arroz', pesoPorSaco: 25 }, 2);
        expect(result).toEqual({ finalCantidad: 50, finalUnidad: 'Kilogramos' });
      });

      it('debe mantener como unidades si es un saco sin pesoPorSaco', () => {
        const result = flattenResourceUnit({ unidad: 'Sacos', subCategoria: 'Ropa' }, 5);
        expect(result).toEqual({ finalCantidad: 5, finalUnidad: 'Unidades' });
      });
    });

    describe('Huevos Especial', () => {
      it('debe calcular las unidades de huevos si se provee capacidadBandeja', () => {
        const result = flattenResourceUnit({ unidad: 'Bandejas', subCategoria: 'Huevos', capacidadBandeja: 30 }, 2);
        expect(result).toEqual({ finalCantidad: 60, finalUnidad: 'Unidades' });
      });
    });

    describe('Cajas y Paquetes', () => {
      it('debe multiplicar kilos si el envase caja es Kilogramos', () => {
        const result = flattenResourceUnit({ unidad: 'Cajas', subCategoria: 'Poleras', tipoEnvaseCaja: 'Kilogramos', pesoPorCaja: 5 }, 10);
        expect(result).toEqual({ finalCantidad: 50, finalUnidad: 'Kilogramos' });
      });

      it('debe multiplicar kilos si es Frutas/Verduras/Panadería con pesoPorCaja', () => {
        const result = flattenResourceUnit({ unidad: 'Cajas', subCategoria: 'Frutas', pesoPorCaja: 10 }, 3);
        expect(result).toEqual({ finalCantidad: 30, finalUnidad: 'Kilogramos' });
      });

      it('debe calcular unidades simples si tipoEnvaseCaja es Unidades', () => {
        const result = flattenResourceUnit({ unidad: 'Cajas', subCategoria: 'Poleras', tipoEnvaseCaja: 'Unidades', unidadesPorEnvase: 10 }, 5);
        expect(result).toEqual({ finalCantidad: 50, finalUnidad: 'Unidades' });
      });

      it('debe calcular paquetes si tipoEnvaseCaja es Paquetes', () => {
        const result = flattenResourceUnit({ unidad: 'Cajas', subCategoria: 'Arroz', tipoEnvaseCaja: 'Paquetes', unidadesPorEnvase: 5 }, 4);
        expect(result).toEqual({ finalCantidad: 20, finalUnidad: 'Paquetes' });
      });

      it('debe anidar Paquetes dentro de Cajas', () => {
        const result = flattenResourceUnit({ unidad: 'Cajas', subCategoria: 'Arroz', tipoEnvaseCaja: 'Paquetes', unidadesPorEnvase: 5, unidadesPorPaquete: 10 }, 2);
        expect(result).toEqual({ finalCantidad: 100, finalUnidad: 'Unidades' }); // 2 cajas * 5 paq * 10 und
      });

      it('debe usar Bandejas si la subcategoria es Huevos dentro de paquetes anidados', () => {
        const result = flattenResourceUnit({ unidad: 'Cajas', subCategoria: 'Huevos', tipoEnvaseCaja: 'Paquetes', unidadesPorEnvase: 5, unidadesPorPaquete: 2 }, 2);
        expect(result).toEqual({ finalCantidad: 20, finalUnidad: 'Bandejas' }); // 2 cajas * 5 paq * 2 und/bandejas = 20 Bandejas
      });

      it('fallback a Unidades', () => {
        const result = flattenResourceUnit({ unidad: 'Cajas', subCategoria: 'Otro' }, 5);
        expect(result).toEqual({ finalCantidad: 5, finalUnidad: 'Unidades' });
      });
    });

    describe('Pallets', () => {
      it('debe calcular envases sueltos Cajas -> Kilogramos', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Otro', cantidadEnvasePallet: 10, tipoEnvasePallet: 'Cajas', tipoEnvaseCajaPallet: 'Kilogramos', pesoPorEnvasePallet: 5 }, 2);
        expect(result).toEqual({ finalCantidad: 100, finalUnidad: 'Kilogramos' }); // 2 pallets * 10 cajas * 5 kg
      });

      it('debe calcular envases sueltos Cajas (Frutas/Verduras)', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Frutas', cantidadEnvasePallet: 10, tipoEnvasePallet: 'Cajas', pesoPorEnvasePallet: 10 }, 2);
        expect(result).toEqual({ finalCantidad: 200, finalUnidad: 'Kilogramos' });
      });

      it('debe calcular envases sueltos Cajas -> Unidades', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Otro', cantidadEnvasePallet: 10, tipoEnvasePallet: 'Cajas', tipoEnvaseCajaPallet: 'Unidades', unidadesPorEnvasePallet: 12 }, 2);
        expect(result).toEqual({ finalCantidad: 240, finalUnidad: 'Unidades' });
      });

      it('debe calcular anidado Pallet -> Cajas -> Paquetes -> Huevos', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Huevos', cantidadEnvasePallet: 10, tipoEnvasePallet: 'Cajas', tipoEnvaseCajaPallet: 'Paquetes', unidadesPorEnvasePallet: 5, unidadesPorPaquetePallet: 2 }, 1);
        expect(result).toEqual({ finalCantidad: 100, finalUnidad: 'Bandejas' });
      });

      it('fallback Cajas a Unidades', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Otro', cantidadEnvasePallet: 10, tipoEnvasePallet: 'Cajas' }, 3);
        expect(result).toEqual({ finalCantidad: 30, finalUnidad: 'Unidades' });
      });

      it('debe calcular Pallet -> Sacos', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Cemento', cantidadEnvasePallet: 50, tipoEnvasePallet: 'Sacos', pesoPorEnvasePallet: 25 }, 2);
        expect(result).toEqual({ finalCantidad: 2500, finalUnidad: 'Kilogramos' });
      });

      it('debe calcular Pallet -> Paquetes (Frutas)', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Frutas', cantidadEnvasePallet: 20, tipoEnvasePallet: 'Paquetes', pesoPorEnvasePallet: 5 }, 1);
        expect(result).toEqual({ finalCantidad: 100, finalUnidad: 'Kilogramos' });
      });

      it('debe calcular Pallet -> Paquetes (Normal)', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Pañales (Bebé)', cantidadEnvasePallet: 20, tipoEnvasePallet: 'Paquetes', unidadesPorEnvasePallet: 40 }, 2);
        expect(result).toEqual({ finalCantidad: 1600, finalUnidad: 'Unidades' });
      });

      it('debe calcular Pallet -> Paquetes (Huevos)', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Huevos', cantidadEnvasePallet: 20, tipoEnvasePallet: 'Paquetes', unidadesPorEnvasePallet: 10 }, 1);
        expect(result).toEqual({ finalCantidad: 200, finalUnidad: 'Bandejas' });
      });

      it('debe calcular Pallet -> Bandejas', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Huevos', cantidadEnvasePallet: 50, tipoEnvasePallet: 'Bandejas', unidadesPorEnvasePallet: 1 }, 1);
        expect(result).toEqual({ finalCantidad: 50, finalUnidad: 'Bandejas' });
      });

      it('fallback Pallet -> Bandejas', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Otro', cantidadEnvasePallet: 10, tipoEnvasePallet: 'Bandejas' }, 1);
        expect(result).toEqual({ finalCantidad: 10, finalUnidad: 'Bandejas' });
      });
      
      it('fallback Pallet general', () => {
        const result = flattenResourceUnit({ unidad: 'Pallets', subCategoria: 'Ladrillos', cantidadEnvasePallet: 100, tipoEnvasePallet: 'Unidades' }, 2);
        expect(result).toEqual({ finalCantidad: 200, finalUnidad: 'Unidades' });
      });
    });
  });

  describe('getUnidadesDisponibles & getEnvasesPallet', () => {
    it('debe calcular bien las unidades de construcción', () => {
      expect(getUnidadesDisponibles('Materiales de Construcción', 'Ladrillos')).toContain('Pallets');
      expect(getUnidadesDisponibles('Materiales de Construcción', 'Arena')).toContain('Sacos');
    });

    it('debe calcular envases pallet para agua e hidratación bidón', () => {
      const result = getEnvasesPallet('Agua e Hidratación', 'Agua Embotellada (Bidón)');
      expect(result).toContain('Unidades');
    });

    it('getUnidadesDisponibles para Alimentos imperecederos/Arroz', () => {
      const result = getUnidadesDisponibles('Alimentos imperecederos', 'Arroz');
      expect(result).toContain('Sacos');
      expect(result.length).toBeGreaterThan(0);
    });

    it('getUnidadesDisponibles para Ropa y Calzado/Poleras', () => {
      const result = getUnidadesDisponibles('Ropa y Calzado', 'Poleras');
      expect(result).toContain('Unidades');
    });

    it('getUnidadesDisponibles para Lácteos/Leche', () => {
      const result = getUnidadesDisponibles('Lácteos', 'Leche');
      expect(result).toContain('Litros');
    });

    it('getUnidadesDisponibles para Alimentos/Huevos', () => {
      const result = getUnidadesDisponibles('Alimentos', 'Huevos');
      expect(result).toContain('Bandejas');
    });

    it('getUnidadesDisponibles para Agua e Hidratación/Agua Embotellada', () => {
      const result = getUnidadesDisponibles('Agua e Hidratación', 'Agua Embotellada (Botella)');
      expect(result).toContain('Unidades');
    });

    it('getUnidadesDisponibles para Insumos Médicos/Paracetamol', () => {
      const result = getUnidadesDisponibles('Insumos Médicos', 'Paracetamol');
      expect(result).toContain('Unidades');
    });

    it('getEnvasesPallet para Alimentos imperecederos/Arroz', () => {
      const result = getEnvasesPallet('Alimentos imperecederos', 'Arroz');
      expect(result.length).toBeGreaterThan(0);
    });

    it('getEnvasesPallet para Ropa y Calzado/Poleras', () => {
      const result = getEnvasesPallet('Ropa y Calzado', 'Poleras');
      expect(result.length).toBeGreaterThan(0);
    });

    it('getEnvasesPallet para Materiales de Construcción/Cemento', () => {
      const result = getEnvasesPallet('Materiales de Construcción', 'Cemento');
      expect(result).toContain('Sacos');
    });

    it('flattenResourceUnit Paquetes -> Frutas/Verduras con pesoPorCaja', () => {
      const result = flattenResourceUnit({ unidad: 'Paquetes', subCategoria: 'Verduras', pesoPorCaja: 5 }, 4);
      expect(result).toEqual({ finalCantidad: 20, finalUnidad: 'Kilogramos' });
    });

    it('flattenResourceUnit Paquetes -> subcategoría normal con unidadesPorEnvase', () => {
      const result = flattenResourceUnit({ unidad: 'Paquetes', subCategoria: 'Poleras', tipoEnvaseCaja: 'Unidades', unidadesPorEnvase: 5 }, 3);
      expect(result).toEqual({ finalCantidad: 15, finalUnidad: 'Unidades' });
    });

    it('flattenResourceUnit Paquetes fallback sin info de envase', () => {
      const result = flattenResourceUnit({ unidad: 'Paquetes', subCategoria: 'Poleras' }, 10);
      expect(result).toEqual({ finalCantidad: 10, finalUnidad: 'Unidades' });
    });
  });
});

