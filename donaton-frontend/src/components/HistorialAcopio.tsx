import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Form, Table, Button, Modal } from 'react-bootstrap';
import { listarDonaciones, type DonacionResponse } from '../services/donacionService';
import { Eye, EyeOff, Search, Users, PackageCheck, Award, Share2, Heart } from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import { obtenerCentrosAcopioPorRegion, obtenerUsuarios, type CentroAcopio } from '../services/usuarioService';
import { REGIONES_CHILE } from '../utils/chileData';
import { useAuth, type Usuario } from '../context/AuthContext';

const HistorialAcopio: React.FC = () => {
  const { usuario } = useAuth();
  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [regionSeleccionada, setRegionSeleccionada] = useState('');
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>([]);
  const [centroSeleccionado, setCentroSeleccionado] = useState('');
  const [selectedDonacion, setSelectedDonacion] = useState<DonacionResponse | null>(null);
  const [usuariosMap, setUsuariosMap] = useState<Record<number, Usuario>>({});

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (regionSeleccionada) {
      obtenerCentrosAcopioPorRegion(regionSeleccionada)
        .then(setCentrosAcopio)
        .catch(err => console.error('Error al cargar centros:', err));
    } else {
      setCentrosAcopio([]);
    }
    setCentroSeleccionado('');
  }, [regionSeleccionada]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, users] = await Promise.all([
          listarDonaciones(),
          obtenerUsuarios()
        ]);

        const map: Record<number, Usuario> = {};
        users.forEach(u => map[Number(u.id)] = u);
        setUsuariosMap(map);

        // Solo mostramos donaciones con estado RECIBIDO en el historial público
        const donacionesRecibidas = data.filter(d => d.estado === 'RECIBIDO');
        setDonaciones(donacionesRecibidas);
      } catch (err) {
        console.error('Error al obtener historial o usuarios:', err);
        setError('No se pudo cargar el historial de acopio. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDonanteName = (donanteId?: number) => {
    if (!donanteId || !usuariosMap[donanteId]) return 'Solidario/a';
    const u = usuariosMap[donanteId];
    if (u.tipoPersona === 'Jurídica' && u.razonSocial) return u.razonSocial;
    if (u.nombreCompleto) return u.nombreCompleto;
    return u.nombre || 'Solidario/a';
  };

  useEffect(() => { setCurrentPage(1); }, [regionSeleccionada, centroSeleccionado, searchTerm]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando el historial solidario...</p>
      </Container>
    );
  }

  // Filtrado general
  const filteredDonaciones = donaciones.filter(d => {
    if (centroSeleccionado && d.centroAcopioDestinoId?.toString() !== centroSeleccionado) return false;
    if (regionSeleccionada && !centroSeleccionado) {
      const centrosIds = centrosAcopio.map(c => c.id);
      if (!centrosIds.includes(d.centroAcopioDestinoId!)) return false;
    }
    if (searchTerm) {
      if (d.visibilidad === 'Privada') return false; // Privadas no tienen tracking ID visible publicamente
      if (!d.trackingId?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  // KPIs
  const totalArticulos = filteredDonaciones.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
  const donantesUnicos = new Set(filteredDonaciones.map(d => d.donanteId).filter(Boolean)).size;

  // Chart Data
  const categoryMap: Record<string, number> = {};
  filteredDonaciones.forEach(d => {
    const cat = d.categoria || 'Otros';
    categoryMap[cat] = (categoryMap[cat] || 0) + (d.cantidad || 0);
  });
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const chartData = Object.entries(categoryMap).map(([name, value], index) => ({
    name,
    value,
    fill: COLORS[index % COLORS.length]
  }));

  // Top Donantes
  const donantesMap: Record<number, number> = {};
  filteredDonaciones.forEach(d => {
    if (d.donanteId && d.visibilidad === 'Publica') {
      donantesMap[d.donanteId] = (donantesMap[d.donanteId] || 0) + (d.cantidad || 0);
    }
  });
  const topDonantes = Object.entries(donantesMap)
    .map(([id, cantidad]) => ({ donanteId: Number(id), cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 3);

  // Paginación
  const totalPages = Math.ceil(filteredDonaciones.length / itemsPerPage);
  const currentData = filteredDonaciones.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Container fluid className="py-5 px-4 px-lg-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary display-5">Muro Solidario</h2>
        <p className="text-muted lead">
          Estas son las donaciones que ya llegaron a sus destinos. Gracias a cada persona que aportó.
        </p>
      </div>

      <Row className="g-4">
        {/* COLUMNA IZQUIERDA: Top Donantes */}
        <Col lg={2} xl={2}>
          <Card className="border-0 shadow-sm bg-primary text-white">
            <Card.Body className="p-2 d-flex flex-column">
              <div className="d-flex align-items-center mb-3 border-bottom border-light pb-2 px-1">
                <Award size={18} className="text-warning me-2" />
                <span className="fw-bold mb-0" style={{ fontSize: '0.9rem' }}>Top Donantes</span>
              </div>
              {topDonantes.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {topDonantes.map((td, index) => (
                    <div key={td.donanteId} className="bg-white bg-opacity-10 p-2 rounded text-center">
                      <div className="fs-5 fw-bold text-warning lh-1 mb-1">#{index + 1}</div>
                      <div className="fw-bold text-truncate w-100 mb-1" style={{ fontSize: '0.8rem' }}>{getDonanteName(td.donanteId)}</div>
                      <Badge bg="light" text="primary" className="px-2 py-1" style={{ fontSize: '0.7rem' }}>
                        {td.cantidad} Art.
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-0 text-white-50 text-center mt-3" style={{ fontSize: '0.8rem' }}>Faltan datos.</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* COLUMNA CENTRAL: KPIs, Filtros y Tabla */}
        <Col lg={7} xl={8} className="d-flex flex-column gap-3">
          {/* KPIs */}
          <Row className="g-3 justify-content-center">
            <Col md={5} lg={5}>
              <Card className="border-0 shadow-sm bg-primary text-white h-100">
                <Card.Body className="p-3 d-flex align-items-center">
                  <PackageCheck size={40} className="opacity-50 me-3" />
                  <div>
                    <h3 className="fw-bold mb-0">{totalArticulos}</h3>
                    <div className="small text-white-50 lh-1">Artículos Recibidos</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={5} lg={5}>
              <Card className="border-0 shadow-sm bg-success text-white h-100">
                <Card.Body className="p-3 d-flex align-items-center">
                  <Users size={40} className="opacity-50 me-3" />
                  <div>
                    <h3 className="fw-bold mb-0">{donantesUnicos}</h3>
                    <div className="small text-white-50 lh-1">Donantes Solidarios</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Filtros Horizontales (Controlan la tabla) */}
          <Card className="border-0 shadow-sm bg-white">
            <Card.Body className="p-3">
              <Row className="g-3 align-items-end">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1 fw-semibold"><Search size={14} className="me-1 text-primary" /> Región Destino</Form.Label>
                    <Form.Select size="sm" value={regionSeleccionada} onChange={(e) => setRegionSeleccionada(e.target.value)}>
                      <option value="">Todas las regiones...</option>
                      {REGIONES_CHILE.map(r => <option key={r} value={r}>{r}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1 fw-semibold">Centro de Acopio</Form.Label>
                    <Form.Select size="sm" value={centroSeleccionado} onChange={(e) => setCentroSeleccionado(e.target.value)} disabled={!regionSeleccionada || centrosAcopio.length === 0}>
                      <option value="">{regionSeleccionada ? 'Todos los centros...' : 'Selecciona región...'}</option>
                      {centrosAcopio.map(c => <option key={c.id} value={c.id.toString()}>{c.nombre}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1 fw-semibold">Buscar por ID</Form.Label>
                    <Form.Control size="sm" placeholder="Ej. DON-1234" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {error && <Alert variant="danger" className="text-center">{error}</Alert>}

          {!error && filteredDonaciones.length === 0 ? (
            <Alert variant="info" className="text-center shadow-sm">
              Aún no hay donaciones recibidas en el historial con estos filtros.
            </Alert>
          ) : (
            <Card className="shadow-sm border-0 flex-grow-1">
              <Card.Body className="d-flex flex-column p-0">
                <div className="table-responsive flex-grow-1 p-3 pb-0">
                  <Table hover className="align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Donante</th>
                        <th>Subcategoría</th>
                        <th>Cantidad</th>
                        <th>Fecha</th>
                        <th>Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((donacion) => {
                        const esPrivada = donacion.visibilidad === 'Privada';
                        return (
                          <tr key={donacion.id}>
                            <td className="fw-bold font-monospace text-primary small">
                              {esPrivada ? <span className="text-muted fst-italic">Anónima</span> : (donacion.trackingId || '-')}
                            </td>
                            <td className="small">
                              {esPrivada ? (
                                <span className="text-muted fst-italic"><EyeOff size={14} className="me-1" /> Anónimo</span>
                              ) : (
                                <span className="fw-semibold">{getDonanteName(donacion.donanteId)}</span>
                              )}
                            </td>
                            <td className="small">{donacion.recurso}</td>
                            <td>
                              <Badge bg="primary" pill>
                                {donacion.cantidad} {donacion.unidadMedida || ''}
                              </Badge>
                            </td>
                            <td className="small">
                              {!esPrivada && donacion.fechaRegistro
                                ? new Date(donacion.fechaRegistro).toLocaleDateString('es-CL')
                                : <span className="text-muted fst-italic">No visible</span>}
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="rounded-pill px-2 py-0"
                                onClick={() => setSelectedDonacion(donacion)}
                              >
                                <Eye size={14} />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center p-3 border-top bg-light mt-auto">
                    <Button variant="outline-primary" size="sm" className="me-2" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                      Ant
                    </Button>
                    <span className="align-self-center mx-2 text-muted small">Página {currentPage} de {totalPages}</span>
                    <Button variant="outline-primary" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                      Sig
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* CTAs and Share */}
          {!error && (
            <div className="text-center mt-3 mb-2">
              <h5 className="fw-bold mb-2">¿Te inspiran estos números?</h5>
              <p className="text-muted mb-3 small">Únete a la Donatón y ayúdanos a llevar esperanza.</p>
              <Button href={usuario ? "/donar" : "/registro"} variant="primary" className="fw-bold px-4 py-2 rounded-pill shadow me-2 mb-2">
                <Heart className="me-2 d-inline" size={18} /> ¡Haz tu donación!
              </Button>
              <Button variant="outline-secondary" className="fw-bold px-3 py-2 rounded-pill mb-2" onClick={() => {
                const text = `¡Mira el increíble impacto solidario que estamos logrando en la Donatón! Súmate tú también 💙`;
                const url = globalThis.location.href;
                globalThis.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
              }}>
                <Share2 className="me-2 d-inline" size={18} /> Compartir
              </Button>
            </div>
          )}
        </Col>

        {/* COLUMNA DERECHA: Solo Gráfico */}
        <Col lg={3} xl={2}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-3 d-flex flex-column">
              <h6 className="fw-bold text-secondary mb-4 text-center"><PackageCheck size={16} className="me-1 text-primary" />Categorías</h6>
              <div style={{ flex: 1, minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de Detalles */}
      <Modal show={!!selectedDonacion} onHide={() => setSelectedDonacion(null)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary">Detalles de la Donación</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {selectedDonacion && (
            <div className="d-flex flex-column gap-3">
              {/* Solo mostrar foto si NO es privada y tiene foto */}
              {selectedDonacion.fotoBase64 && selectedDonacion.visibilidad !== 'Privada' && (
                <div className="text-center mb-2">
                  <img src={selectedDonacion.fotoBase64} alt="Donación" className="img-fluid rounded shadow-sm" style={{ maxHeight: '200px' }} />
                </div>
              )}

              <div className="bg-light p-3 rounded">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-semibold">Privacidad:</span>
                  <Badge bg={selectedDonacion.visibilidad === 'Privada' ? 'secondary' : 'success'}>
                    {selectedDonacion.visibilidad === 'Privada' ? 'Anónima' : 'Pública'}
                  </Badge>
                </div>
                {selectedDonacion.visibilidad !== 'Privada' && (
                  <>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted fw-semibold">ID Tracking:</span>
                      <span className="fw-bold font-monospace">{selectedDonacion.trackingId || '-'}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted fw-semibold">Donante:</span>
                      <span className="fw-semibold">{getDonanteName(selectedDonacion.donanteId)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted fw-semibold">Fecha:</span>
                      <span>{selectedDonacion.fechaRegistro ? new Date(selectedDonacion.fechaRegistro).toLocaleString('es-CL') : ''}</span>
                    </div>
                  </>
                )}

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-semibold">Categoría:</span>
                  <span>{selectedDonacion.categoria}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-semibold">Subcategoría:</span>
                  <span>{selectedDonacion.recurso}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted fw-semibold">Cantidad:</span>
                  <span>{selectedDonacion.cantidad} {selectedDonacion.unidadMedida || ''}</span>
                </div>

                <div className="mt-3">
                  <span className="text-muted fw-semibold d-block mb-1">Descripción:</span>
                  <p className="mb-0 bg-white p-2 rounded border small">
                    {selectedDonacion.descripcion || 'Sin descripción.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setSelectedDonacion(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default HistorialAcopio;
