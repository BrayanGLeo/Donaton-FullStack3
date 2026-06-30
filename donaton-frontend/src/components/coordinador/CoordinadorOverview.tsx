import React, { useEffect, useState, useMemo } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, RadialBarChart, RadialBar
} from 'recharts';
import { Target, AlertCircle, Truck, MapPin } from 'lucide-react';
import { obtenerNecesidades, type Necesidad } from '../../services/bffService';
import { listarDonaciones, type DonacionResponse } from '../../services/donacionService';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const CoordinadorOverview: React.FC = () => {
  const { usuario } = useAuth();
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [necData, donData] = await Promise.all([
          obtenerNecesidades(),
          listarDonaciones()
        ]);
        
        // Filtrar por región del coordinador
        const userRegion = usuario?.region || '';
        setNecesidades(necData.filter(n => n.region === userRegion));
        setDonaciones(donData.filter(d => d.regionRetiro === userRegion || d.estado === 'EN TRÁNSITO' || d.estado === 'DESPACHADO'));
      } catch (error) {
        console.error('Error fetching data for CoordinadorOverview:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuario]);

  // KPIs
  const totalNecesidades = necesidades.length;
  const emergenciasActivas = necesidades.filter(n => ['Activa', 'Pendiente'].includes(n.estado || '')).length;
  const enviosEnTransito = 
    donaciones.filter(d => ['EN TRÁNSITO', 'EN TRANSITO', 'DESPACHADO', 'EN_TRANSITO', 'ASIGNADO'].includes(d.estado?.toUpperCase() || '')).length +
    necesidades.filter(n => ['EN TRÁNSITO', 'EN TRANSITO', 'EN_TRANSITO', 'ASIGNADO', 'DESPACHADO', 'EN_PROCESO'].includes(n.estado?.toUpperCase() || '')).length;
  const tasaCobertura = totalNecesidades === 0 ? 0 : Math.round((necesidades.filter(n => ['Cubierta', 'Entregado'].includes(n.estado || '')).length / totalNecesidades) * 100);

  // Chart Data: Solicitado vs Cubierto (simulado con el estado de las necesidades por categoría)
  const necesidadesPorCategoria = useMemo(() => {
    const counts: Record<string, { Solicitado: number, Cubierto: number }> = {};
    necesidades.forEach(n => {
      try {
        const recs = JSON.parse(n.recursos || '[]');
        const arr = Array.isArray(recs) ? recs : JSON.parse(recs);
        arr.forEach((r: any) => {
          const cat = r.categoria || 'Otros';
          if (!counts[cat]) counts[cat] = { Solicitado: 0, Cubierto: 0 };
          counts[cat].Solicitado += (Number(r.cantidad) || 1);
          if (['Cubierta', 'Entregado'].includes(n.estado || '')) {
            counts[cat].Cubierto += (Number(r.cantidad) || 1);
          }
        });
      } catch(e) {
        console.error('Error parseando recursos de necesidad:', e);
      }
    });
    return Object.keys(counts).map(cat => ({
      name: cat,
      Solicitado: counts[cat].Solicitado,
      Cubierto: counts[cat].Cubierto
    }));
  }, [necesidades]);

  // Chart Data: Estado de los Envíos
  const estadoEnvios = useMemo(() => {
    const counts: Record<string, number> = {
      'En Tránsito': enviosEnTransito,
      'Recibidos (Cubiertas)': necesidades.filter(n => ['Cubierta', 'Entregado'].includes(n.estado || '')).length,
      'Pendientes': emergenciasActivas
    };
    return Object.keys(counts).map((k, index) => ({ 
      name: k, 
      value: counts[k],
      fill: COLORS[index % COLORS.length]
    }));
  }, [enviosEnTransito, necesidades, emergenciasActivas]);

  // Chart Data: Progreso de Meta de la Emergencia
  const progresoData = [
    { name: 'Cobertura', uv: tasaCobertura, fill: '#00C49F' }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeIn bg-white p-4 shadow-sm" style={{ borderRadius: '16px' }}>
      <h4 className="fw-bold mb-4" style={{ color: '#2c3e50' }}>Visión de Terreno</h4>
      
      {/* KPIs */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex align-items-center">
              <div className="p-3 bg-success bg-opacity-10 rounded-circle me-3">
                <Target className="text-success" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0">Tasa de Cobertura</h6>
                <h3 className="fw-bold mb-0">{tasaCobertura}%</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex align-items-center">
              <div className="p-3 bg-danger bg-opacity-10 rounded-circle me-3">
                <AlertCircle className="text-danger" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0">Emergencias Activas</h6>
                <h3 className="fw-bold mb-0">{emergenciasActivas}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex align-items-center">
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle me-3">
                <Truck className="text-primary" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0">Envíos en Tránsito</h6>
                <h3 className="fw-bold mb-0">{enviosEnTransito}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body className="d-flex align-items-center">
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle me-3">
                <MapPin className="text-warning" size={24} />
              </div>
              <div>
                <h6 className="text-muted mb-0">Necesidades Totales</h6>
                <h3 className="fw-bold mb-0">{totalNecesidades}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Solicitado vs Cubierto por Categoría</Card.Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={necesidadesPorCategoria}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: '#f5f6fa' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Bar dataKey="Solicitado" fill="#FF8042" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Cubierto" fill="#00C49F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Progreso de la Emergencia</Card.Title>
              <div style={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="80%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="70%" 
                    outerRadius="100%" 
                    barSize={20} 
                    data={progresoData}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      background
                      dataKey="uv"
                      cornerRadius={10}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="text-center mt-n4">
                  <h2 className="fw-bold mb-0" style={{ color: '#00C49F' }}>{tasaCobertura}%</h2>
                  <span className="text-muted">Meta Completada</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <Card.Body>
              <Card.Title className="fw-bold mb-4">Estado de los Envíos y Requerimientos</Card.Title>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadoEnvios}
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
      </Row>
    </div>
  );
};
