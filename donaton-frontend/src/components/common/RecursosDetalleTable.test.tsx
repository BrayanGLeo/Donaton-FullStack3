import { render, screen } from '@testing-library/react';
import { RecursosDetalleTable } from './RecursosDetalleTable';
import { describe, it, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('../../utils/unidadesLogic', () => ({
  flattenResourceUnit: vi.fn().mockImplementation((r, cant) => ({
    finalCantidad: cant,
    finalUnidad: r.unidadMedida || 'Unidades',
  })),
}));

describe('RecursosDetalleTable', () => {
  it('Debe renderizar mensaje cuando no hay recursos', () => {
    render(<RecursosDetalleTable recursos={[]} />);
    expect(screen.getByText('No hay recursos especificados')).toBeInTheDocument();
  });

  it('Debe renderizar mensaje cuando el prop de recursos es null o inválido', () => {
    render(<RecursosDetalleTable recursos={null as any} />);
    expect(screen.getByText('No hay recursos especificados')).toBeInTheDocument();
  });

  it('Debe renderizar error cuando el JSON es inválido', () => {
    render(<RecursosDetalleTable recursos="[invalid-json" />);
    expect(screen.getByText('Error al cargar recursos.')).toBeInTheDocument();
  });

  it('Debe renderizar correctamente un recurso normal (array de objetos)', () => {
    const recursos = [
      { categoria: 'Alimentos', subCategoria: 'Arroz', cantidad: 5, unidadMedida: 'Kilogramos' }
    ];
    render(<RecursosDetalleTable recursos={recursos} />);
    expect(screen.getByText('Arroz')).toBeInTheDocument();
    expect(screen.getByText('Alimentos')).toBeInTheDocument();
    expect(screen.getByText('5 Kilogramos')).toBeInTheDocument();
  });

  it('Debe renderizar correctamente desde un JSON string', () => {
    const recursos = JSON.stringify([
      { recurso: 'Fideos', cantidad: 10, unidad: 'Paquetes' }
    ]);
    render(<RecursosDetalleTable recursos={recursos} />);
    expect(screen.getByText('Fideos')).toBeInTheDocument();
    expect(screen.getByText('10 Paquetes')).toBeInTheDocument();
  });

  it('Debe renderizar estado y fecha de vencimiento', () => {
    const recursos = [
      { subcategoria: 'Leche', cantidad: 1, unidadMedida: 'Litros', estadoArticulo: 'Nuevo', fechaVencimiento: '2027-01-01T00:00:00' }
    ];
    render(<RecursosDetalleTable recursos={recursos} />);
    expect(screen.getByText('Nuevo')).toBeInTheDocument();
    expect(screen.getByText(/Vence:/)).toBeInTheDocument();
  });

  it('Debe renderizar atributos especiales', () => {
    const recursos = [
      { 
        subcategoria: 'Polera', 
        cantidad: 2, 
        unidadMedida: 'Unidades',
        talla: 'L',
        genero: 'Hombre',
        tipoLeche: 'Sin Lactosa' 
      }
    ];
    render(<RecursosDetalleTable recursos={recursos} />);
    expect(screen.getByText('Talla: L')).toBeInTheDocument();
    expect(screen.getByText('Género: Hombre')).toBeInTheDocument();
    expect(screen.getByText('Leche: Sin Lactosa')).toBeInTheDocument();
  });

  it('Debe renderizar ramas de cajas', () => {
    const recursos = [
      { 
        subcategoria: 'Agua', 
        cantidad: 2, 
        unidadMedida: 'Cajas',
        tipoEnvaseCaja: 'Unidades',
        unidadesPorEnvase: 6
      }
    ];
    render(<RecursosDetalleTable recursos={recursos} />);
    // Deberia mostrar el breakdown: 2 Cajas, luego 12 Unidades
    expect(screen.getByText('2 Cajas')).toBeInTheDocument();
    expect(screen.getByText('12 Unidades')).toBeInTheDocument();
  });

  it('Debe renderizar ramas de cajas anidadas con paquetes', () => {
    const recursos = [
      { 
        subcategoria: 'Galletas', 
        cantidad: 2, 
        unidadMedida: 'Cajas',
        tipoEnvaseCaja: 'Paquetes',
        unidadesPorEnvase: 6,
        unidadesPorPaquete: 5
      }
    ];
    render(<RecursosDetalleTable recursos={recursos} />);
    expect(screen.getByText('2 Cajas')).toBeInTheDocument();
    expect(screen.getByText('12 Paquetes')).toBeInTheDocument();
    expect(screen.getByText('60 Unidades')).toBeInTheDocument();
  });

  it('Debe renderizar ramas de Pallets simples', () => {
    const recursos = [
      { 
        subcategoria: 'Madera', 
        cantidad: 1, 
        unidadMedida: 'Pallets',
        tipoEnvasePallet: 'Unidades',
        cantidadEnvasePallet: 100
      }
    ];
    render(<RecursosDetalleTable recursos={recursos} />);
    expect(screen.getByText('1 Pallets')).toBeInTheDocument();
    expect(screen.getByText('100 Unidades')).toBeInTheDocument();
  });

  it('Debe renderizar ramas de Pallets complejas anidadas', () => {
    const recursos = [
      { 
        subcategoria: 'Atun', 
        cantidad: 1, 
        unidadMedida: 'Pallets',
        tipoEnvasePallet: 'Cajas',
        cantidadEnvasePallet: 10,
        unidadesPorEnvasePallet: 20,
        tipoEnvaseCajaPallet: 'Paquetes',
        unidadesPorPaquetePallet: 5
      }
    ];
    render(<RecursosDetalleTable recursos={recursos} />);
    expect(screen.getByText('1 Pallets')).toBeInTheDocument();
    expect(screen.getByText('10 Cajas')).toBeInTheDocument();
    expect(screen.getByText('200 Paquetes')).toBeInTheDocument();
    expect(screen.getByText('1000 Unidades')).toBeInTheDocument();
  });
  
  it('Debe renderizar paquetes con cantidad multiplicada', () => {
    const recursos = [
      { 
        subcategoria: 'Fideos', 
        cantidad: 2, 
        unidadMedida: 'Paquetes',
        unidadesPorEnvase: 3
      }
    ];
    render(<RecursosDetalleTable recursos={recursos} />);
    expect(screen.getByText('2 Paquetes')).toBeInTheDocument();
    expect(screen.getByText('6 Unidades')).toBeInTheDocument();
  });
});
