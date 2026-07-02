import React, { useMemo } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Package, AlertTriangle, Home, Users } from 'lucide-react';
import type { DonacionResponse } from '../../services/donacionService';
import type { Necesidad } from '../../services/bffService';
import { flattenResourceUnit, fixEncoding } from '../../utils/unidadesLogic';



interface AdminOverviewProps {
  donaciones: DonacionResponse[];
  necesidades: Necesidad[];
  centros: any[];
  usuarios: any[];
  stats?: { total: number; activos: number; donantes: number; logistica: number } | null;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ donaciones, necesidades, centros, usuarios, stats }) => {
  // KPIs
  const totalDonaciones = donaciones.length;
  const emergenciasActivas = necesidades.filter(n => {
    const st = n.estado?.toUpperCase() || '';
    return !['CUBIERTA', 'ENTREGADO', 'RECHAZADO', 'CANCELADO'].includes(st);
  }).length;
  const totalCentros = centros.length;
  const totalUsuarios = stats?.total ?? usuarios.length;

  // Chart Data: Flujo de Donaciones y Necesidades (Últimos 7 días)
  const flujoData = useMemo(() => {
    const counts: Record<string, { name: string, Entradas: number, Salidas: number }> = {};
    const hoy = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      counts[dateStr] = { name: dateStr.split('-').slice(1).join('/'), Entradas: 0, Salidas: 0 };
    }

    donaciones.forEach(don => {
      if (['RECIBIDO', 'CUBIERTA', 'ENTREGADO'].includes(don.estado?.toUpperCase() || '')) {
        const fecha = don.fechaActualizacion || don.fechaRegistro;
        if (fecha) {
          const dateStr = fecha.split('T')[0];
          if (counts[dateStr]) counts[dateStr].Entradas++;
        }
      }
    });

    necesidades.forEach(nec => {
      if (['ENTREGADO', 'CUBIERTA'].includes(nec.estado?.toUpperCase() || '')) {
        const fecha = nec.fechaActualizacion || nec.fechaReporte;
        if (fecha) {
          const dateStr = fecha.split('T')[0];
          if (counts[dateStr]) counts[dateStr].Salidas++;
        }
      }
    });

    return Object.values(counts);
  }, [donaciones, necesidades]);

  // Chart Data: Inventario Global por Categoría
  const inventarioPorCategoria = useMemo(() => {
    const counts: Record<string, { Unidades: number; Kilogramos: number }> = {};
    donaciones.forEach(don => {
      if (don.estado?.toUpperCase() === 'RECIBIDO' && don.recursos) {
        try {
          const recs = typeof don.recursos === 'string' ? JSON.parse(don.recursos) : don.recursos;
          const recursosArray = Array.isArray(recs) ? recs : JSON.parse(recs);
          recursosArray.forEach((r: any) => {
            let cat = r.categoria || 'Otros';
            cat = fixEncoding(cat);
            if (!counts[cat]) {
              counts[cat] = { Unidades: 0, Kilogramos: 0 };
            }
            const { finalCantidad, finalUnidad } = flattenResourceUnit(r, Number(r.cantidad) || 1);
            if (finalUnidad === 'Kilogramos' || finalUnidad === 'kg') {
              counts[cat].Kilogramos += finalCantidad;
            } else {
              counts[cat].Unidades += finalCantidad;
            }
          });
        } catch (e) {
          console.error('Error parseando recursos:', e);
        }
      }
    });

    return Object.keys(counts).map((cat) => ({ 
      name: cat, 
      Unidades: counts[cat].Unidades > 0 ? Math.round(counts[cat].Unidades * 10) / 10 : undefined,
      Kilogramos: counts[cat].Kilogramos > 0 ? Math.round(counts[cat].Kilogramos * 10) / 10 : undefined
    }));
  }, [donaciones]);



  // Chart Data: Top 5 Centros (por donaciones asignadas)
  const topCentros = useMemo(() => {
    const counts: Record<string, number> = {};
    donaciones.forEach(don => {
      if (don.regionRetiro) {
        counts[don.regionRetiro] = (counts[don.regionRetiro] || 0) + 1;
      }
    });
    
    return Object.keys(counts)
      .map(centro => ({ name: fixEncoding(centro), Donaciones: counts[centro] }))
      .sort((a, b) => b.Donaciones - a.Donaciones);
  }, [donaciones]);

  // Nuevos KPIs
  const enviosEnTransito = donaciones.filter(d => {
    const st = d.estado?.toUpperCase() || '';
    return ['ASIGNADO', 'EN_TRANSITO', 'EN TRÁNSITO', 'EN TRANSITO', 'DESPACHADO'].includes(st);
  }).length + necesidades.filter(n => {
    const st = n.estado?.toUpperCase() || '';
    return ['ASIGNADO', 'EN_TRANSITO', 'EN TRÁNSITO', 'EN TRANSITO', 'DESPACHADO', 'EN_PROCESO'].includes(st);
  }).length;

  const hoyStr = new Date().toISOString().split('T')[0];
  const donacionesHoy = donaciones.filter(d => {
    const isReceived = ['RECIBIDO', 'CUBIERTA', 'ENTREGADO'].includes(d.estado?.toUpperCase() || '');
    const fecha = d.fechaActualizacion || d.fechaRegistro;
    return isReceived && fecha?.split('T')[0] === hoyStr;
  }).length;

  return (
    <div className="animate__animated animate__fadeIn">
      <h3 className="fw-bold mb-4" style={{ color: '#2c3e50' }}>Visión Global (Super Admin)</h3>
      
      {/* KPIs */}
      <Row className="mb-4 g-3">
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle mb-2">
                <Package className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Total Donaciones</h6>
                <h3 className="fw-bold mb-0">{totalDonaciones}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-success bg-opacity-10 rounded-circle mb-2">
                <Package className="text-success" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Recibidas Hoy</h6>
                <h3 className="fw-bold mb-0">{donacionesHoy}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-info bg-opacity-10 rounded-circle mb-2">
                <Package className="text-info" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Envíos en Tránsito</h6>
                <h3 className="fw-bold mb-0">{enviosEnTransito}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle mb-2">
                <AlertTriangle className="text-danger" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Emergencias Activas</h6>
                <h3 className="fw-bold mb-0">{emergenciasActivas}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-success bg-opacity-10 rounded-circle mb-2">
                <Home className="text-success" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Centros Acopio</h6>
                <h3 className="fw-bold mb-0">{totalCentros}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle mb-2">
                <Users className="text-warning" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Usuarios Totales</h6>
                <h3 className="fw-bold mb-0">{totalUsuarios}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row>
        <Col md={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Entradas vs Salidas (Global)</Card.Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={flujoData}>
                    <defs>
                      <linearGradient id="colorEntradasAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSalidasAdmin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="Entradas" name="Donaciones Recibidas" stroke="#10b981" fillOpacity={1} fill="url(#colorEntradasAdmin)" strokeWidth={3} />
                    <Area type="monotone" dataKey="Salidas" name="Necesidades Cubiertas" stroke="#6366f1" fillOpacity={1} fill="url(#colorSalidasAdmin)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Inventario (Categorías)</Card.Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventarioPorCategoria} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: '#f5f6fa' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Bar dataKey="Unidades" name="Unidades Totales" fill="#0088FE" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Kilogramos" name="Kilogramos Totales" fill="#00C49F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9} className="mb-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Donaciones por Región</Card.Title>
              <div style={{ height: Math.max(300, topCentros.length * 40) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCentros} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={150} />
                    <RechartsTooltip cursor={{ fill: '#f5f6fa' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="Donaciones" fill="#00C49F" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
