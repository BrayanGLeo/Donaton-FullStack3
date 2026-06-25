import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Nav, Modal, Table, Pagination, Form } from 'react-bootstrap';
import { MapPin, CheckCircle, XCircle, Truck, Navigation, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { type DonacionResponse, listarDonaciones, actualizarEstadoDonacion } from '../../services/donacionService';
import { obtenerNecesidades, actualizarEstadoNecesidad } from '../../services/bffService';
import { obtenerCentrosAcopio, type CentroAcopio } from '../../services/logisticaService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const getBadgeColor = (estado: string) => {
  const e = estado.toUpperCase();
  if (e === 'PENDIENTE' || e === 'ASIGNADO') return 'warning';
  if (e === 'EN TRÁNSITO' || e === 'EN_TRANSITO' || e === 'EN CAMINO') return 'info';
  if (e === 'RECIBIDO' || e === 'ENTREGADO' || e === 'COMPLETADO') return 'success';
  if (e === 'CANCELADO' || e === 'RECHAZADA_CONDUCTOR') return 'danger';
  return 'secondary';
};

type SubTab = 'nuevo' | 'en_curso' | 'completado';

const getBarColor = (t: SubTab) => {
  if (t === 'nuevo') return '#ffc107';
  if (t === 'en_curso') return '#17a2b8';
  return '#28a745';
};

const abrirGoogleMaps = (lat: number, lng: number) =>
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');

// ─── Tarjeta de viaje ────────────────────────────────────────────────────────

interface CardProps {
  d: DonacionResponse;
  subtab: SubTab;
  actionLoading: number | null;
  centrosAcopio: CentroAcopio[];
  esNecesidad?: boolean;
  onAceptar: (id: number) => void;
  onRechazar: (id: number) => void;
}

const ViajeCard: React.FC<CardProps> = ({ d, subtab, actionLoading, centrosAcopio, esNecesidad, onAceptar, onRechazar }) => {
  const destino = centrosAcopio.find(c => c.id === d.centroAcopioDestinoId) 
    || centrosAcopio.find(c => c.region === d.regionRetiro || c.region === d.origen);

  let cantItems = 0;
  try {
    const recs = JSON.parse(d.recursos || '[]');
    if (Array.isArray(recs)) cantItems = recs.reduce((s: number, r: any) => s + (r.cantidad || 0), 0);
  } catch {}

  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ height: '4px', backgroundColor: getBarColor(subtab) }} />
      <Card.Body className="p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <Badge bg={getBadgeColor(d.estado || '')} className="mb-2 px-3 py-2" style={{ borderRadius: '8px' }}>
              {d.estado?.replace('_', ' ')}
            </Badge>
            <h5 className="fw-bold mb-1">
              {d.nombreArticulo || 'Varias Donaciones'}
              <span className="text-muted fw-normal fs-6"> ({cantItems} items)</span>
            </h5>
            <p className="text-muted small mb-0">
              <Clock size={14} className="me-1" />
              Asignado: {new Date(d.fechaRegistro).toLocaleDateString()}
            </p>
          </div>
          {esNecesidad && (
            <Badge bg="danger" className="px-3 py-2" style={{ borderRadius: '8px' }}>
              🚨 Necesidad
            </Badge>
          )}
        </div>

        {/* Dirección */}
        <div className="bg-light p-3 rounded-3 mb-4">
          <p className="mb-2 text-dark fw-semibold">
            <MapPin size={16} className="me-2 text-primary" />
            {esNecesidad ? 'Punto de Entrega (Zona de Necesidad):' : 'Punto de Retiro:'}
          </p>
          <p className="mb-1 text-muted small ms-4">
            {d.direccionRetiro || `${d.direccionRetiroCalle || ''} ${d.direccionRetiroNumero || ''}`.trim() || 'No especificada'}
          </p>
          <p className="mb-0 text-muted small ms-4">{d.comunaRetiro || d.origen}, {d.regionRetiro}</p>

          {!esNecesidad && destino && (
            <>
              <p className="mb-2 text-dark fw-semibold border-top pt-3 mt-2">
                <MapPin size={16} className="me-2 text-success" />
                Punto de Destino (Centro de Acopio):
              </p>
              <p className="mb-1 fw-bold text-dark small ms-4">{destino.nombre}</p>
              <p className="mb-0 text-muted small ms-4">{destino.direccion}, {destino.comuna}</p>
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="d-flex flex-wrap gap-2">
          {d.latitudRetiro != null && d.longitudRetiro != null && (
            <Button
              variant="outline-primary"
              className="fw-semibold"
              style={{ borderRadius: '8px', padding: '8px 16px' }}
              onClick={() => d.latitudRetiro && d.longitudRetiro && abrirGoogleMaps(d.latitudRetiro, d.longitudRetiro)}
            >
              <Navigation size={16} className="me-2" />
              Ver Ruta
            </Button>
          )}

          {subtab === 'nuevo' && (
            <>
              <Button
                variant="outline-danger"
                className="fw-semibold"
                style={{ borderRadius: '8px', padding: '8px 16px' }}
                onClick={() => onRechazar(d.id)}
                disabled={actionLoading === d.id}
              >
                <XCircle size={16} className="me-2" />
                Rechazar
              </Button>
              <Button
                variant="success"
                className="fw-semibold"
                style={{ borderRadius: '8px', padding: '8px 16px' }}
                onClick={() => onAceptar(d.id)}
                disabled={actionLoading === d.id}
              >
                {actionLoading === d.id
                  ? <Spinner size="sm" animation="border" />
                  : <><CheckCircle size={16} className="me-2" />Aceptar</>}
              </Button>
            </>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

// ─── Sub-panel con 3 pestañas ─────────────────────────────────────────────

interface SubPanelProps {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  items: DonacionResponse[];
  esNecesidad?: boolean;
  actionLoading: number | null;
  centrosAcopio: CentroAcopio[];
  onAceptar: (id: number) => void;
  onRechazar: (id: number) => void;
}

const SubPanel: React.FC<SubPanelProps> = ({
  title, icon, accentColor, items, esNecesidad,
  actionLoading, centrosAcopio, onAceptar, onRechazar
}) => {
  const [tab, setTab] = useState<SubTab>('nuevo');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset pagination when tab changes
  useEffect(() => {
    setPage(1);
  }, [tab]);

  const pendiente = items.filter(d => ['PENDIENTE', 'ASIGNADO'].includes(d.estado?.toUpperCase() || ''));
  const enCurso = items.filter(d =>
    ['EN TRÁNSITO', 'EN_TRANSITO', 'EN CAMINO'].includes(d.estado?.toUpperCase() || '')
  );
  const completado = items.filter(d =>
    !['PENDIENTE', 'ASIGNADO', 'EN TRÁNSITO', 'EN_TRANSITO', 'EN CAMINO', 'RECHAZADA_CONDUCTOR'].includes(d.estado?.toUpperCase() || '')
  );

  const tabData: Record<SubTab, DonacionResponse[]> = {
    nuevo: pendiente,
    en_curso: enCurso,
    completado,
  };

  const current = tabData[tab];

  const emptyMessages: Record<SubTab, { icon: React.ReactNode; title: string; desc: string }> = {
    nuevo: {
      icon: <CheckCircle size={48} />,
      title: 'Sin nuevas asignaciones',
      desc: 'Cuando te asignen un viaje, aparecerá aquí.',
    },
    en_curso: {
      icon: <Truck size={48} />,
      title: 'Sin viajes en curso',
      desc: 'Acepta una asignación para comenzar.',
    },
    completado: {
      icon: <Clock size={48} />,
      title: 'Sin completados aún',
      desc: esNecesidad
        ? 'Aparecerán aquí cuando el coordinador marque la entrega como completada.'
        : 'Aparecerán aquí cuando el admin de acopio confirme la recepción.',
    },
  };

  const paginatedItems = current.slice((page - 1) * itemsPerPage, page * itemsPerPage);


  const renderContenido = () => {
    if (current.length === 0) {
      return (
        <div className="text-center py-5 bg-light rounded-4">
          <div className="text-muted mb-3 opacity-50 d-flex justify-content-center">
            {emptyMessages[tab].icon}
          </div>
          <h5 className="text-muted">{emptyMessages[tab].title}</h5>
          <p className="text-muted small">{emptyMessages[tab].desc}</p>
        </div>
      );
    }

    if (tab === 'completado') {
      return (
          <div className="table-responsive border rounded-3 mb-3">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-3">Recurso</th>
                  <th className="py-3">Cantidad</th>
                  <th className="py-3">Origen</th>
                  <th className="py-3">Destino</th>
                  <th className="py-3">Estado</th>
                  <th className="py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(d => {
                  const destino = centrosAcopio.find(c => c.id === d.centroAcopioDestinoId) || centrosAcopio.find(c => c.region === d.regionRetiro || c.region === d.origen);
                  let cantItems = 0;
                  try {
                    const recs = JSON.parse(d.recursos || '[]');
                    if (Array.isArray(recs)) cantItems = recs.reduce((s: number, r: any) => s + (r.cantidad || 0), 0);
                  } catch {}
                  return (
                    <tr key={d.id}>
                      <td className="px-3 fw-semibold">{d.nombreArticulo || 'Varias Donaciones'}</td>
                      <td>{cantItems} items</td>
                      <td>{d.comunaRetiro || d.origen}</td>
                      <td>{esNecesidad ? 'Zona Necesidad' : destino?.nombre || 'Acopio'}</td>
                      <td><Badge bg={getBadgeColor(d.estado || '')}>{d.estado?.replace('_', ' ')}</Badge></td>
                      <td className="text-muted small">{new Date(d.fechaRegistro).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
      );
    }

    return (
      <div className="d-flex flex-column gap-3">
        {paginatedItems.map(d => (
          <ViajeCard
            key={d.id}
            d={d}
            subtab={tab}
            actionLoading={actionLoading}
            centrosAcopio={centrosAcopio}
            esNecesidad={esNecesidad}
            onAceptar={onAceptar}
            onRechazar={onRechazar}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="shadow-sm border-0 mb-5" style={{ borderRadius: '20px', overflow: 'hidden' }}>
      {/* Header del panel */}
      <div style={{ backgroundColor: accentColor, padding: '20px 24px' }} className="d-flex align-items-center gap-3">
        <div className="bg-white bg-opacity-25 p-2 rounded-circle">
          {icon}
        </div>
        <div>
          <h5 className="fw-bold mb-0 text-white">{title}</h5>
          <small className="text-white opacity-75">
            {pendiente.length} nuevo{pendiente.length === 1 ? '' : 's'} · {enCurso.length} en curso · {completado.length} completado{completado.length === 1 ? '' : 's'}
          </small>
        </div>
      </div>

      <Card.Body className="p-0">
        {/* Tabs */}
        <Nav variant="pills" className="p-3 bg-light d-flex gap-2" style={{ borderBottom: '1px solid #e9ecef' }}>
          {([
            { key: 'nuevo' as SubTab, label: `Nuevos (${pendiente.length})`, color: '#ffc107' },
            { key: 'en_curso' as SubTab, label: `En Curso (${enCurso.length})`, color: '#17a2b8' },
            { key: 'completado' as SubTab, label: `Completado (${completado.length})`, color: '#28a745' },
          ] as const).map(t => (
            <Nav.Item key={t.key}>
              <Nav.Link
                active={tab === t.key}
                onClick={() => setTab(t.key)}
                style={{
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: tab === t.key ? '#fff' : '#6c757d',
                  backgroundColor: tab === t.key ? t.color : 'transparent',
                  border: `2px solid ${tab === t.key ? t.color : 'transparent'}`,
                }}
              >
                {t.label}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        {/* Contenido */}
        <div className="p-4">
          {renderContenido()}
          
          {current.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              <span className="text-muted small">
                Mostrando {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, current.length)} de {current.length} registros
              </span>
              <div className="d-flex align-items-center gap-2">
                <Form.Select 
                  size="sm" 
                  value={itemsPerPage} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    setItemsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  style={{ width: '80px', borderRadius: '8px' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </Form.Select>
                <Pagination className="mb-0" size="sm">
                  <Pagination.Prev disabled={page === 1} onClick={() => setPage(p => p - 1)} />
                  <Pagination.Next disabled={page === Math.ceil(current.length / itemsPerPage) || current.length === 0} onClick={() => setPage(p => p + 1)} />
                </Pagination>
              </div>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

// ─── Componente Principal ─────────────────────────────────────────────────────

const PanelConductor: React.FC = () => {
  const { usuario } = useAuth();
  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [necesidadesAsignadas, setNecesidadesAsignadas] = useState<DonacionResponse[]>([]);
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<'donaciones' | 'necesidades'>('donaciones');
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    id: number | null;
    action: 'rechazar' | null;
    message: string;
  }>({ show: false, id: null, action: null, message: '' });

  const fetchData = async () => {
    if (!usuario) return;
    try {
      setLoading(true);
      const [data, centros, necs] = await Promise.all([
        listarDonaciones(), 
        obtenerCentrosAcopio(),
        obtenerNecesidades()
      ]);
      const misViajes = data.filter(d => d.conductorId === Number(usuario.id));
      setDonaciones(misViajes);
      
      const misNecesidades = necs.filter(n => n.conductorId === Number(usuario.id));
      const mappedNecesidades: DonacionResponse[] = misNecesidades.map(n => {
        let rec = 'Alerta General';
        let cant = 0;
        let uni = '';
        try {
          if (n.recursos) {
            const parsed = JSON.parse(n.recursos);
            if (Array.isArray(parsed) && parsed.length > 0) {
              rec = parsed[0].categoria || rec;
              cant = parsed[0].cantidad || cant;
              uni = parsed[0].unidad || uni;
            }
          }
        } catch(e) {
          console.error("Error parseando recursos", e);
        }
        
        return {
          id: n.id,
          tracking: `NEC-${n.id}`,
          recurso: rec,
          cantidad: cant,
          unidadMedida: uni,
          estado: n.estado,
          origen: 'Centro de Acopio',
          destino: n.comuna || 'Zona Afectada',
          fechaRegistro: n.fechaReporte,
          conductorId: n.conductorId,
          regionRetiro: n.region,
          comunaRetiro: n.comuna,
          latitudRetiro: n.latitud,
          longitudRetiro: n.longitud,
          esNecesidadFlag: true
        } as unknown as DonacionResponse;
      });
      
      setNecesidadesAsignadas(mappedNecesidades);
      setCentrosAcopio(centros);
      setError(null);
    } catch {
      setError('Error al cargar la información de tus viajes. Por favor intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [usuario]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAceptarViaje = async (id: number, isNecesidad: boolean = false) => {
    try {
      setActionLoading(id);
      if (isNecesidad) {
        await actualizarEstadoNecesidad(id, 'EN_TRANSITO');
      } else {
        await actualizarEstadoDonacion(id, 'EN_TRANSITO');
      }
      await fetchData();
    } catch (e) {
      console.error(e);
      alert('Hubo un error al aceptar el viaje.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRechazarViaje = (id: number) => {
    setConfirmModal({
      show: true,
      id,
      action: 'rechazar',
      message: '¿Estás seguro de que deseas rechazar este viaje? Se notificará al centro de acopio para reasignarlo.',
    });
  };

  const executeConfirmAction = async () => {
    if (!confirmModal.id || !confirmModal.action) return;
    const id = confirmModal.id;
    setConfirmModal(prev => ({ ...prev, show: false }));
    setActionLoading(id);
    try {
      const isNecesidad = necesidadesAsignadas.some(n => n.id === id);
      if (isNecesidad) {
        await actualizarEstadoNecesidad(id, 'Pendiente', undefined, -1);
      } else {
        await actualizarEstadoDonacion(id, 'RECHAZADA_CONDUCTOR');
      }

      await fetchData();
    } catch (e) {
      console.error(e);
      alert('Hubo un error al rechazar el viaje.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '960px' }}>
      {/* Encabezado */}
      <div className="d-flex align-items-center mb-5">
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
          <Truck size={32} className="text-primary" />
        </div>
        <div>
          <h2 className="fw-bold mb-0" style={{ color: '#1a1a2e' }}>Panel del Conductor</h2>
          <p className="text-muted mb-0">Gestiona tus viajes y entregas asignadas</p>
        </div>
      </div>

      {error && <Alert variant="danger" className="border-0 shadow-sm rounded-4">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Cargando tus asignaciones...</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Row className="g-3">
              <Col md={6}>
                <Card 
                  className={`border-0 shadow-sm cursor-pointer transition-all ${activeMainTab === 'donaciones' ? 'ring-2 ring-primary' : ''}`}
                  style={{ 
                    cursor: 'pointer', 
                    borderRadius: '16px',
                    border: activeMainTab === 'donaciones' ? '2px solid #0d6efd' : '2px solid transparent',
                    backgroundColor: activeMainTab === 'donaciones' ? '#f8fbff' : 'white'
                  }}
                  onClick={() => setActiveMainTab('donaciones')}
                >
                  <Card.Body className="d-flex align-items-center p-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <Truck size={24} className="text-primary" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">Donaciones</h5>
                      <small className="text-muted">{donaciones.filter(d => ['PENDIENTE', 'ASIGNADO'].includes(d.estado?.toUpperCase() || '')).length} nuevas</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card 
                  className={`border-0 shadow-sm cursor-pointer transition-all ${activeMainTab === 'necesidades' ? 'ring-2 ring-danger' : ''}`}
                  style={{ 
                    cursor: 'pointer', 
                    borderRadius: '16px',
                    border: activeMainTab === 'necesidades' ? '2px solid #dc3545' : '2px solid transparent',
                    backgroundColor: activeMainTab === 'necesidades' ? '#fff8f8' : 'white'
                  }}
                  onClick={() => setActiveMainTab('necesidades')}
                >
                  <Card.Body className="d-flex align-items-center p-3">
                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                      <AlertTriangle size={24} className="text-danger" />
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">Necesidades</h5>
                      <small className="text-muted">{necesidadesAsignadas.filter(d => ['PENDIENTE', 'ASIGNADO'].includes(d.estado?.toUpperCase() || '')).length} nuevas</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>

          {activeMainTab === 'donaciones' && (
            <SubPanel
              title="Donaciones"
              icon={<Truck size={24} className="text-white" />}
              accentColor="#0d6efd"
              items={donaciones}
              actionLoading={actionLoading}
              centrosAcopio={centrosAcopio}
              onAceptar={(id) => handleAceptarViaje(id, false)}
              onRechazar={handleRechazarViaje}
            />
          )}

          {activeMainTab === 'necesidades' && (
            <SubPanel
              title="Entregas de Necesidades"
              icon={<AlertTriangle size={24} className="text-white" />}
              accentColor="#dc3545"
              items={necesidadesAsignadas}
              esNecesidad
              actionLoading={actionLoading}
              centrosAcopio={centrosAcopio}
              onAceptar={(id) => handleAceptarViaje(id, true)}
              onRechazar={handleRechazarViaje}
            />
          )}
        </>
      )}

      {/* Modal de Confirmación de Rechazo */}
      <Modal show={confirmModal.show} onHide={() => setConfirmModal(prev => ({ ...prev, show: false }))} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-dark">Rechazar Viaje</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4 text-center">
          <XCircle size={60} className="text-danger mb-3" />
          <p className="fs-5 mb-0 text-muted">{confirmModal.message}</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 d-flex justify-content-center">
          <Button
            variant="secondary"
            className="px-4 fw-semibold"
            style={{ borderRadius: '8px' }}
            onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="px-4 fw-semibold"
            style={{ borderRadius: '8px' }}
            onClick={executeConfirmAction}
            disabled={actionLoading !== null}
          >
            {actionLoading === null ? 'Confirmar Rechazo' : <Spinner size="sm" animation="border" />}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PanelConductor;

