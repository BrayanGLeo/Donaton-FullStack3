import React, { useMemo } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Legend
} from 'recharts';
import { Archive, ArrowDownCircle, ArrowUpCircle, Users } from 'lucide-react';
import { flattenResourceUnit } from '../../utils/unidadesLogic';
interface AcopioOverviewProps {
  donaciones: any[]; // donaciones de la región
  necesidades: any[]; // necesidades de la región
  capacidadMax: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AcopioOverview: React.FC<AcopioOverviewProps> = ({ donaciones, necesidades, capacidadMax = 10000 }) => {
  const hoyStr = new Date().toISOString().split('T')[0];

  const donacionesHoy = useMemo(() => {
    return donaciones.filter(d => {
      const isReceived = ['RECIBIDO', 'CUBIERTA', 'ENTREGADO'].includes(d.estado?.toUpperCase() || '');
      const fecha = d.fechaActualizacion || d.fechaRegistro;
      return isReceived && fecha?.split('T')[0] === hoyStr;
    }).length;
  }, [donaciones, hoyStr]);

  const necesidadesActivas = useMemo(() => {
    return necesidades.filter(n => {
      const st = n.estado?.toUpperCase() || '';
      return !['CUBIERTA', 'ENTREGADO', 'RECHAZADO', 'CANCELADO'].includes(st);
    }).length;
  }, [necesidades]);

  const retiroDonacionPendiente = useMemo(() => {
    return donaciones.filter(d => {
      const st = d.estado?.toUpperCase() || '';
      return ['PENDIENTE'].includes(st);
    }).length;
  }, [donaciones]);

  const retiroDonacionEnTransito = useMemo(() => {
    return donaciones.filter(d => {
      const st = d.estado?.toUpperCase() || '';
      return ['ASIGNADO', 'EN_TRANSITO', 'EN TRÁNSITO', 'EN TRANSITO', 'DESPACHADO'].includes(st);
    }).length;
  }, [donaciones]);

  const despachosPendientesNecesidades = useMemo(() => {
    return necesidades.filter(n => {
      const st = n.estado?.toUpperCase() || '';
      return ['ASIGNADO', 'EN_TRANSITO', 'EN TRÁNSITO', 'EN TRANSITO', 'DESPACHADO', 'EN_PROCESO'].includes(st);
    }).length;
  }, [necesidades]); 

  // Stock vs Capacidad
  const inventario = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalItems = 0;
    donaciones.filter(d => ['RECIBIDO', 'ENTREGADO'].includes(d.estado?.toUpperCase())).forEach(don => {
      try {
        const recs = typeof don.recursos === 'string' ? JSON.parse(don.recursos) : don.recursos;
        const arr = Array.isArray(recs) ? recs : JSON.parse(recs);
        arr.forEach((r: any) => {
          const { finalCantidad } = flattenResourceUnit(r, r.cantidad || 1);
          const cat = r.categoria || 'Otros';
          const cant = finalCantidad;
          counts[cat] = (counts[cat] || 0) + cant;
          totalItems += cant;
        });
      } catch (e) {
        console.error('Error parseando recursos:', e);
      }
    });
    const capUsada = (totalItems / capacidadMax) * 100;
    
    return {
      totalItems,
      capUsada: Math.min(capUsada, 100).toFixed(1),
      categorias: Object.keys(counts).map(cat => ({ name: cat, Stock: counts[cat] }))
    };
  }, [donaciones, capacidadMax]);

  // Chart Data: Entradas vs Salidas (simulado de los últimos 7 días con donaciones creadas vs necesidades creadas)
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

  // Chart Data: Estado de Donaciones
  const estadoDonaciones = useMemo(() => {
    const counts: Record<string, number> = {};
    donaciones.forEach(don => {
      const st = don.estado?.toUpperCase() || 'DESCONOCIDO';
      counts[st] = (counts[st] || 0) + 1;
    });
    return Object.keys(counts).map((k, index) => ({ 
      name: k, 
      value: counts[k],
      fill: COLORS[index % COLORS.length]
    }));
  }, [donaciones]);

  return (
    <div className="animate__animated animate__fadeIn">
      <h4 className="fw-bold mb-4" style={{ color: '#2c3e50' }}>Dashboard del Centro de Acopio</h4>
      
      {/* KPIs */}
      <Row className="mb-4 g-3">
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-info bg-opacity-10 rounded-circle mb-2">
                <Archive className="text-info" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Capacidad Usada</h6>
                <h3 className="fw-bold mb-0">{inventario.capUsada}%</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-success bg-opacity-10 rounded-circle mb-2">
                <ArrowDownCircle className="text-success" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Recibidas <Badge bg="success" className="bg-opacity-10 text-success ms-1">Hoy</Badge></h6>
                <h3 className="fw-bold mb-0">{donacionesHoy}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle mb-2">
                <Users className="text-danger" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Necesidades Activas</h6>
                <h3 className="fw-bold mb-0">{necesidadesActivas}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle mb-2">
                <ArrowUpCircle className="text-warning" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Retiro Don. Pdte.</h6>
                <h3 className="fw-bold mb-0">{retiroDonacionPendiente}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle mb-2">
                <ArrowUpCircle className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Retiro Don. En Tránsito</h6>
                <h3 className="fw-bold mb-0">{retiroDonacionEnTransito}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} md={4} xl={2}>
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center">
              <div className="p-3 bg-secondary bg-opacity-10 rounded-circle mb-2">
                <ArrowUpCircle className="text-secondary" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>Despachos Pdte. (Necesidades)</h6>
                <h3 className="fw-bold mb-0">{despachosPendientesNecesidades}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={7} className="mb-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Entradas vs Salidas (Últimos 7 días)</Card.Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={flujoData}>
                    <defs>
                      <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FF8042" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="Entradas" stroke="#00C49F" fillOpacity={1} fill="url(#colorEntradas)" />
                    <Area type="monotone" dataKey="Salidas" stroke="#FF8042" fillOpacity={1} fill="url(#colorSalidas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5} className="mb-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Estado de las Donaciones</Card.Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadoDonaciones}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} className="mb-4">
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Stock por Categoría</Card.Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={inventario.categorias}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: '#f5f6fa' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="Stock" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={40} />
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
