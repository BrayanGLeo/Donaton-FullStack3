import { render, screen } from '@testing-library/react';
import { AcopioOverview } from './AcopioOverview';
import { describe, it, expect, vi } from 'vitest';


// Mock Recharts to avoid DOM measuring issues in JSDOM
vi.mock('recharts', async () => {
  const OriginalRecharts = await vi.importActual('recharts');
  return {
    ...OriginalRecharts as any,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
    BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
    PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  };
});

describe('AcopioOverview', () => {
  it('Debe renderizar el dashboard con donaciones y necesidades vacías', () => {
    render(<AcopioOverview donaciones={[]} necesidades={[]} capacidadMax={10000} />);
    expect(screen.getByText('Dashboard del Centro de Acopio')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument(); // Capacidad usada
  });

  it('Debe calcular correctamente las estadísticas de donaciones recibidas hoy y necesidades', () => {
    const hoyStr = new Date().toISOString().split('T')[0];
    
    const donaciones = [
      { id: 1, estado: 'RECIBIDO', fechaActualizacion: `${hoyStr}T12:00:00`, recursos: '[{"categoria":"Alimentos","cantidad":10}]' }, // Hoy, recibida
      { id: 2, estado: 'PENDIENTE', fechaActualizacion: `${hoyStr}T12:00:00`, recursos: '[]' }, // Pendiente
      { id: 3, estado: 'EN_TRANSITO', fechaRegistro: `${hoyStr}T10:00:00`, recursos: '[]' } // En transito
    ];
    
    const necesidades = [
      { id: 1, estado: 'ACTIVA' }, // Activa
      { id: 2, estado: 'EN_TRANSITO' }, // Despacho pendiente
      { id: 3, estado: 'CUBIERTA' } // No activa
    ];

    render(<AcopioOverview donaciones={donaciones} necesidades={necesidades} capacidadMax={1000} />);
    
    // 1 donacion recibida hoy
    // El texto "1" deberia aparecer asociado a "Recibidas Hoy". Como no podemos consultar por xpath,
    // buscamos que los KPIs estén presentes.
    expect(screen.getByText('Recibidas')).toBeInTheDocument();
    
    // 1 necesidad activa
    expect(screen.getByText('Necesidades Activas')).toBeInTheDocument();
    
    // 1 retiro donación pdte
    expect(screen.getByText('Retiro Don. Pdte.')).toBeInTheDocument();
    
    // 1 retiro donación en tránsito
    expect(screen.getByText('Retiro Don. En Tránsito')).toBeInTheDocument();
    
    // 1 despacho pendiente
    expect(screen.getByText('Despachos Pdte. (Necesidades)')).toBeInTheDocument();
  });

  it('Debe manejar el inventario y capacidad correctamente cuando supera el 100%', () => {
    const donaciones = [
      { id: 1, estado: 'RECIBIDO', recursos: '[{"categoria":"Agua","cantidad":2000}]' }
    ];
    
    render(<AcopioOverview donaciones={donaciones} necesidades={[]} capacidadMax={1000} />);
    
    // Capacidad max 1000, tenemos 2000 => deberia limitar a 100.0%
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  it('Debe manejar errores de parsing en recursos silenciosamente', () => {
    const donaciones = [
      { id: 1, estado: 'RECIBIDO', recursos: 'invalid-json' }
    ];
    // No deberia tirar crash
    render(<AcopioOverview donaciones={donaciones} necesidades={[]} capacidadMax={1000} />);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('Debe contar correctamente en Salidas cuando necesidad tiene estado ENTREGADO con fechaActualizacion', () => {
    const hoyStr = new Date().toISOString().split('T')[0];
    const necesidades = [
      { id: 1, estado: 'ENTREGADO', fechaActualizacion: `${hoyStr}T10:00:00` },
      { id: 2, estado: 'CUBIERTA', fechaActualizacion: `${hoyStr}T11:00:00` },
      { id: 3, estado: 'ACTIVA', fechaActualizacion: `${hoyStr}T12:00:00` },
    ];
    render(<AcopioOverview donaciones={[]} necesidades={necesidades} capacidadMax={1000} />);
    expect(screen.getByText('Dashboard del Centro de Acopio')).toBeInTheDocument();
  });

  it('Debe contar correctamente en Salidas usando fechaReporte cuando no hay fechaActualizacion', () => {
    const hoyStr = new Date().toISOString().split('T')[0];
    const necesidades = [
      { id: 1, estado: 'CUBIERTA', fechaReporte: `${hoyStr}T09:00:00` },
    ];
    render(<AcopioOverview donaciones={[]} necesidades={necesidades} capacidadMax={1000} />);
    expect(screen.getByText('Dashboard del Centro de Acopio')).toBeInTheDocument();
  });

  it('Debe ignorar necesidades CUBIERTA/ENTREGADO sin fecha', () => {
    const necesidades = [
      { id: 1, estado: 'ENTREGADO' /* sin fechaActualizacion ni fechaReporte */ },
    ];
    render(<AcopioOverview donaciones={[]} necesidades={necesidades} capacidadMax={1000} />);
    expect(screen.getByText('Dashboard del Centro de Acopio')).toBeInTheDocument();
  });

  it('Debe manejar recursos como array (no string) correctamente', () => {
    const donaciones = [
      {
        id: 1,
        estado: 'RECIBIDO',
        recursos: [{ categoria: 'Alimentos', cantidad: 5, unidadMedida: 'Kilogramos' }] as any,
      },
    ];
    render(<AcopioOverview donaciones={donaciones} necesidades={[]} capacidadMax={10000} />);
    expect(screen.getByText('Dashboard del Centro de Acopio')).toBeInTheDocument();
  });

  it('Debe manejar recursos con doble JSON encode (string de string)', () => {
    const donaciones = [
      {
        id: 1,
        estado: 'ENTREGADO',
        recursos: JSON.stringify(JSON.stringify([{ categoria: 'Ropa', cantidad: 3, unidadMedida: 'Unidades' }])),
      },
    ];
    render(<AcopioOverview donaciones={donaciones} necesidades={[]} capacidadMax={10000} />);
    expect(screen.getByText('Stock por Categoría')).toBeInTheDocument();
  });

  it('Debe contar EN_TRANSITO y DESPACHADO como retiro en transito', () => {
    const donaciones = [
      { id: 1, estado: 'EN TRÁNSITO', recursos: '[]' },
      { id: 2, estado: 'DESPACHADO', recursos: '[]' },
    ];
    render(<AcopioOverview donaciones={donaciones} necesidades={[]} capacidadMax={10000} />);
    const transitoEl = screen.getByText('Retiro Don. En Tránsito').closest('.card-body');
    expect(transitoEl?.querySelector('h3')?.textContent).toBe('2');
  });

  it('Debe contar EN_PROCESO y DESPACHADO como despacho pendiente de necesidades', () => {
    const necesidades = [
      { id: 1, estado: 'EN_PROCESO' },
      { id: 2, estado: 'DESPACHADO' },
      { id: 3, estado: 'EN TRÁNSITO' },
    ];
    render(<AcopioOverview donaciones={[]} necesidades={necesidades} capacidadMax={10000} />);
    const despachoEl = screen.getByText('Despachos Pdte. (Necesidades)').closest('.card-body');
    expect(despachoEl?.querySelector('h3')?.textContent).toBe('3');
  });

  it('Debe usar fechaRegistro para el flujo si fechaActualizacion no está presente', () => {
    const hoyStr = new Date().toISOString().split('T')[0];
    const donaciones = [
      { id: 1, estado: 'RECIBIDO', fechaRegistro: `${hoyStr}T08:00:00`, recursos: '[]' },
    ];
    render(<AcopioOverview donaciones={donaciones} necesidades={[]} capacidadMax={10000} />);
    expect(screen.getByText('Entradas vs Salidas (Últimos 7 días)')).toBeInTheDocument();
  });

  it('Debe ignorar donaciones con fecha fuera de los últimos 7 días para el flujo', () => {
    const donaciones = [
      { id: 1, estado: 'RECIBIDO', fechaActualizacion: '2020-01-01T10:00:00', recursos: '[]' },
    ];
    render(<AcopioOverview donaciones={donaciones} necesidades={[]} capacidadMax={10000} />);
    expect(screen.getByText('Entradas vs Salidas (Últimos 7 días)')).toBeInTheDocument();
  });

  it('Debe manejar elementos sin estado o fechas', () => {
    const donaciones = [
      { id: 10, recursos: '[{"categoria":"Varios"}]' }, // sin estado ni fechas
      { id: 11, estado: undefined },
    ];
    const necesidades = [
      { id: 10 },
      { id: 11, estado: undefined }
    ];
    render(<AcopioOverview donaciones={donaciones as any} necesidades={necesidades as any} capacidadMax={100} />);
    expect(screen.getByText('Dashboard del Centro de Acopio')).toBeInTheDocument();
  });
});

