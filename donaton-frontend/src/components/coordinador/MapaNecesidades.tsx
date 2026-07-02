import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Table, Container, Alert, Row, Col, Card, Badge, Button, Nav, Form, Modal } from 'react-bootstrap';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { obtenerNecesidades } from '../../services/bffService';
import type { Necesidad } from '../../services/bffService';
import { useAuth } from '../../context/AuthContext';
import { RecursosDetalleTable } from '../common/RecursosDetalleTable';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon.Default();

// Helper para recentrar el mapa
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

// Función Haversine para calcular distancia
const getDistance = (
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
) => {
  const R = 6371e3; // metros
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const parseRecursos = (recursosData: any) => {
  if (!recursosData) return [];
  
  let parsed = recursosData;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch(e) { console.debug(e); }
  }
  // En caso de doble serialización
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch(e) { console.debug(e); }
  }
  
  if (Array.isArray(parsed)) {
    return parsed.map(item => {
      if (typeof item === 'string') {
        try { return JSON.parse(item); } catch(e) { console.debug(e); return item; }
      }
      return item;
    });
  }
  
  return [];
};

const renderRecursos = (recursosData: any) => {
  const items = parseRecursos(recursosData);
  if (Array.isArray(items) && items.length > 0) {
    const validItems = items.filter(it => it && typeof it === 'object' && it.categoria);
    if (validItems.length > 0) {
      return (
        <ul className="list-unstyled mb-0 mt-1 small text-dark" style={{ lineHeight: '1.4' }}>
          {validItems.map((it: any, idx: number) => (
            <li key={`${it.id || it.categoria}-${idx}`}>
              • {it.cantidad || 1} {it.unidad || it.unidadMedida || ''} de <strong>{it.categoria}</strong>
            </li>
          ))}
        </ul>
      );
    }
  }
  return <span>{typeof recursosData === 'string' ? recursosData : JSON.stringify(recursosData)}</span>;
};

const MapaNecesidades: React.FC = () => {
  const { usuario } = useAuth();
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [mostrarAlternativaTabular, setMostrarAlternativaTabular] = useState<boolean>(false);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorGral, setErrorGral] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [tab, setTab] = useState<'activas' | 'cubiertas'>('activas');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);
  const [filtroComuna, setFiltroComuna] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');
  const [showDetallesModal, setShowDetallesModal] = useState<boolean>(false);
  const [necesidadSeleccionada, setNecesidadSeleccionada] = useState<Necesidad | null>(null);

  useEffect(() => { setPage(1); }, [tab, filtroComuna, filtroCategoria]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await obtenerNecesidades();
        setNecesidades(data);
      } catch (err) {
        console.error("Error cargando necesidades:", err);
        setMostrarAlternativaTabular(true);
        setErrorGral("Error al obtener las necesidades del servidor.");
      }
    };

    fetchData();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setCargando(false);
        },
        () => {
          setMostrarAlternativaTabular(true);
          setCargando(false);
        }
      );
    } else {
      setMostrarAlternativaTabular(true);
      setCargando(false);
    }
  }, []);

  if (cargando) {
    return <Container className="mt-4"><p>Cargando mapa de necesidades...</p></Container>;
  }

  // Filtrado Geográfico (100km)
  let necesidadesMostrar = necesidades;
  if (usuario?.latitud && usuario?.longitud) {
    necesidadesMostrar = necesidades.filter(n => {
      if (!n.latitud || !n.longitud) return false;
      const distanceMeters = getDistance(
        { latitude: Number(usuario.latitud), longitude: Number(usuario.longitud) },
        { latitude: Number(n.latitud), longitude: Number(n.longitud) }
      );
      return distanceMeters <= 100 * 1000; // 100 km
    });
  }

  const necesidadesActivas = necesidadesMostrar.filter(n => n.estado !== 'Cubierta');
  const necesidadesCubiertas = necesidadesMostrar.filter(n => n.estado === 'Cubierta');
  let necesidadesFiltradas = tab === 'activas' ? necesidadesActivas : necesidadesCubiertas;

  if (filtroComuna) {
    necesidadesFiltradas = necesidadesFiltradas.filter(n => n.comuna === filtroComuna);
  }
  
  if (filtroCategoria) {
    necesidadesFiltradas = necesidadesFiltradas.filter(n => n.tipoEmergencia === filtroCategoria);
  }

  const comunasUnicas = Array.from(new Set(necesidadesMostrar.map(n => n.comuna).filter(Boolean)));
  const categoriasUnicas = Array.from(new Set(necesidadesMostrar.map(n => n.tipoEmergencia).filter(Boolean)));

  if (mostrarAlternativaTabular) {
    return (
      <Container className="mt-4">
        <h2 className="mb-4">Lista de Necesidades (Vista Tabular)</h2>
        {errorGral && <Alert variant="warning">{errorGral}</Alert>}
        <Alert variant="info">
          La vista de mapa ha sido deshabilitada debido a permisos de ubicación o un error de red.
        </Alert>
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Recursos Solicitados</th>
              <th>Ubicación (Lat/Lon)</th>
              <th>Fecha de Reporte</th>
              <th>Tipo Emergencia</th>
            </tr>
          </thead>
          <tbody>
            {necesidadesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">No hay necesidades en esta categoría.</td>
              </tr>
            ) : (
              necesidadesFiltradas.map(n => (
                <tr key={n.id}>
                  <td>{n.id}</td>
                  <td>{renderRecursos(n.recursos)}</td>
                  <td>{n.latitud}, {n.longitud} {n.comuna ? `(${n.comuna})` : ''}</td>
                  <td>{new Date(n.fechaReporte).toLocaleString()}</td>
                  <td>{n.tipoEmergencia || 'General'}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Container>
    );
  }

  const defaultCenter: [number, number] = usuario?.latitud && usuario?.longitud 
    ? [usuario.latitud, usuario.longitud] 
    : [-33.4489, -70.6693];

  const renderListaNecesidades = () => {
    const totalItems = necesidadesFiltradas.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const displayedItems = necesidadesFiltradas.slice(startIndex, startIndex + pageSize);

    return (
      <div className="d-flex flex-column h-100" style={{ minHeight: 0, flex: 1 }}>
        <div className="d-flex flex-column gap-3" style={{ overflowY: 'auto', paddingRight: '5px', flex: 1, minHeight: 0 }}>
          {displayedItems.map(n => {
            const esGrave = n.tipoEmergencia?.toLowerCase().includes('incendio') || 
                            n.tipoEmergencia?.toLowerCase().includes('inundacion') || 
                            n.tipoEmergencia?.toLowerCase().includes('terremoto');
    
    let distanciaStr = '';
    if (usuario?.latitud && usuario?.longitud && n.latitud && n.longitud) {
      const distM = getDistance(
        { latitude: Number(usuario.latitud), longitude: Number(usuario.longitud) },
        { latitude: Number(n.latitud), longitude: Number(n.longitud) }
      );
      distanciaStr = (distM / 1000).toFixed(1) + ' km';
    }

    const isCubierta = n.estado === 'Cubierta';
    let borderColor = esGrave ? '#dc3545' : '#0d6efd';
    if (isCubierta) borderColor = '#198754';
    
    let badgeBg = "primary";
    if (isCubierta) badgeBg = "success";
    else if (esGrave) badgeBg = "danger";

    return (
      <Card key={n.id} className="mb-3 shadow-sm border-0 flex-shrink-0" style={{ borderRadius: '12px', borderLeft: `4px solid ${borderColor}` }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start mb-2">
            <Badge bg={badgeBg} className="rounded-pill px-3 py-2">
              {n.tipoEmergencia || 'General'}
            </Badge>
            {distanciaStr && <small className="text-muted fw-semibold">📍 a {distanciaStr}</small>}
          </div>
          <div className="mb-2 d-flex align-items-center gap-2">
            <span className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>Recursos solicitados:</span>
            <Badge bg="primary" pill>
              {parseRecursos(n.recursos).length} Tipos
            </Badge>
          </div>
          <Card.Text className="mb-2 text-muted small">
            📍 {n.direccion || n.comuna || 'Ubicación no especificada'}
          </Card.Text>
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-muted">
              ⏱️ {new Date(n.fechaReporte).toLocaleDateString()}
            </small>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-info" 
                size="sm" 
                style={{ borderRadius: '8px' }}
                onClick={() => {
                  setNecesidadSeleccionada(n);
                  setShowDetallesModal(true);
                }}
              >
                Detalles
              </Button>
              <Button 
                variant="outline-secondary" 
                size="sm" 
                style={{ borderRadius: '8px' }}
                onClick={() => setMapCenter([n.latitud, n.longitud])}
              >
                Ver en mapa
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
      );
    })}
    </div>
    
    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top flex-wrap gap-2">
      <small className="text-muted">
        Mostrando {displayedItems.length} de {totalItems} registros
      </small>
      <div className="d-flex gap-2 align-items-center">
        <Form.Select 
          size="sm" 
          style={{ width: '80px', borderRadius: '10px' }} 
          value={pageSize} 
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
        >
          <option value="4">4</option>
          <option value="8">8</option>
          <option value="12">12</option>
          <option value="20">20</option>
        </Form.Select>
        <div className="d-flex gap-1 align-items-center">
          <Button 
            size="sm" 
            variant="outline-secondary" 
            disabled={page === 1} 
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="text-muted mx-2" style={{ fontSize: '0.85rem' }}>
            Página <strong>{page}</strong> de <strong>{totalPages}</strong>
          </span>
          <Button 
            size="sm" 
            variant="outline-primary" 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  </div>
  );
  };

  const renderListContent = () => {
    if (necesidadesFiltradas.length === 0) {
      return (
        <Alert variant="light" className="text-center p-4 border rounded-4 text-muted shadow-sm">
          No hay alertas en esta categoría en tu zona.
        </Alert>
      );
    }
    if (tab === 'cubiertas') {
      return renderListaNecesidades();
    }
    return renderListaNecesidades();
  };

  return (
    <Container fluid className="mt-0">
      <Row>
        <Col lg={7} className="mb-4 mb-lg-0 d-flex flex-column" style={{ height: 'calc(100vh - 180px)' }}>
          <h4 className="fw-bold mb-3 text-primary">Panel de Alertas</h4>
          
          <Nav variant="pills" className="mb-3 w-100" style={{ gap: '10px' }}>
            <Nav.Item className="flex-fill">
              <Nav.Link 
                active={tab === 'activas'} 
                onClick={() => setTab('activas')}
                className="text-center fw-semibold shadow-sm"
                style={{ borderRadius: '12px' }}
              >
                Activas
              </Nav.Link>
            </Nav.Item>
            <Nav.Item className="flex-fill">
              <Nav.Link 
                active={tab === 'cubiertas'} 
                onClick={() => setTab('cubiertas')}
                className="text-center fw-semibold shadow-sm"
                style={{ borderRadius: '12px', backgroundColor: tab === 'cubiertas' ? '#198754' : '' }}
              >
                Historial (Cubiertas)
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Row className="mb-3 g-2">
            <Col md={6}>
              <Form.Select size="sm" value={filtroComuna} onChange={(e) => setFiltroComuna(e.target.value)} style={{ borderRadius: '8px' }}>
                <option value="">Todas las comunas</option>
                {comunasUnicas.map(c => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Select size="sm" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={{ borderRadius: '8px' }}>
                <option value="">Todas las emergencias</option>
                {categoriasUnicas.map(c => <option key={c} value={c}>{c}</option>)}
              </Form.Select>
            </Col>
          </Row>

          <p className="text-muted small mb-4">
            {usuario?.latitud ? 'Mostrando alertas a menos de 100km de tu ubicación registrada.' : 'Mostrando todas las alertas a nivel nacional.'}
          </p>
          
          {renderListContent()}

        </Col>

        <Col lg={5}>
          <Card className="shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden', height: 'calc(100vh - 180px)' }}>
            <div style={{ height: '100%', width: '100%' }}>
              <MapContainer center={defaultCenter} zoom={10} style={{ height: '100%', width: '100%' }}>
                {mapCenter && <ChangeView center={mapCenter} zoom={14} />}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Marcador del Coordinador si tiene coordenadas */}
                {usuario?.latitud && usuario?.longitud && (
                  <Marker position={[usuario.latitud, usuario.longitud]}>
                    <Popup>
                      <strong>Mi Ubicación (Coordinador)</strong>
                    </Popup>
                  </Marker>
                )}

                {necesidadesMostrar.map(n => {
                  const esGrave = n.tipoEmergencia?.toLowerCase().includes('incendio') || 
                                  n.tipoEmergencia?.toLowerCase().includes('inundacion') || 
                                  n.tipoEmergencia?.toLowerCase().includes('terremoto');
                  const iconToUse = esGrave ? redIcon : defaultIcon;

                  return (
                    <Marker key={n.id} position={[n.latitud, n.longitud]} icon={iconToUse}>
                      <Popup>
                        <strong>Recursos Solicitados:</strong> <br />
                        {renderRecursos(n.recursos)} <br />
                        <br />
                        <strong>Fecha:</strong> <br />
                        {new Date(n.fechaReporte).toLocaleString()} <br />
                        {n.tipoEmergencia && (
                          <>
                            <strong>Tipo:</strong> {n.tipoEmergencia}
                          </>
                        )}
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Modal Detalles */}
      <Modal show={showDetallesModal} onHide={() => setShowDetallesModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">
            Detalles de la Necesidad #{necesidadSeleccionada?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {necesidadSeleccionada && (
            <div className="p-3">
              <Row className="mb-4">
                <Col md={6}>
                  <h6 className="fw-bold text-muted mb-3">Información General</h6>
                  <p className="mb-2"><strong>Tipo de Emergencia:</strong> {necesidadSeleccionada.tipoEmergencia || 'General'}</p>
                  <p className="mb-2"><strong>Estado:</strong> <Badge bg="primary">{necesidadSeleccionada.estado?.replace('_', ' ') || 'PENDIENTE'}</Badge></p>
                  <p className="mb-2"><strong>Fecha de Reporte:</strong> {new Date(necesidadSeleccionada.fechaReporte).toLocaleString()}</p>
                </Col>
                <Col md={6}>
                  <h6 className="fw-bold text-muted mb-3">Ubicación</h6>
                  <p className="mb-2"><strong>Dirección:</strong> {necesidadSeleccionada.direccion || 'No especificada'}</p>
                  <p className="mb-2"><strong>Comuna:</strong> {necesidadSeleccionada.comuna || 'No especificada'}</p>
                  <p className="mb-2"><strong>Coordenadas:</strong> {necesidadSeleccionada.latitud}, {necesidadSeleccionada.longitud}</p>
                </Col>
              </Row>
              <h6 className="fw-bold text-muted mb-3 mt-4">Recursos Solicitados</h6>
              <div className="bg-light p-3 rounded border">
                <RecursosDetalleTable recursos={necesidadSeleccionada.recursos || '[]'} />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetallesModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MapaNecesidades;


