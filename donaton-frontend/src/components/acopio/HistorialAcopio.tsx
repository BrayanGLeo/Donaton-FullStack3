import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Form, Table, Button, Modal } from 'react-bootstrap';
import { listarDonaciones, type DonacionResponse } from '../../services/donacionService';
import { Eye, EyeOff, Search, Users, PackageCheck, Award, Share2, Heart, MapPin } from 'lucide-react';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import { obtenerCentrosAcopioPorRegion, obtenerUsuarios, type CentroAcopio } from '../../services/usuarioService';
import { REGIONES_CHILE } from '../../utils/chileData';
import { useAuth, type Usuario } from '../../context/AuthContext';
import { RecursosDetalleTable } from '../common/RecursosDetalleTable';
import { flattenResourceUnit, SUBCATEGORIAS } from '../../utils/unidadesLogic';

const matchesCentroAcopio = (d: DonacionResponse, centroSeleccionado: string, regionSeleccionada: string, centrosAcopio: CentroAcopio[]): boolean => {
  if (centroSeleccionado && d.centroAcopioDestinoId?.toString() !== centroSeleccionado) return false;
  if (regionSeleccionada && !centroSeleccionado) {
    const centrosIds = centrosAcopio.map(c => c.id);
    if (!centrosIds.includes(d.centroAcopioDestinoId!)) return false;
  }
  return true;
};

const matchesSearchTerm = (d: DonacionResponse, searchTerm: string): boolean => {
  if (!searchTerm) return true;
  if (d.visibilidad === 'Privada') return false;
  return d.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
};

const matchesCategoria = (d: DonacionResponse, categoriaFiltro: string, subcategoriaFiltro: string): boolean => {
  if (!categoriaFiltro && !subcategoriaFiltro) return true;
  try {
    const recs = JSON.parse(d.recursos || '[]');
    if (!Array.isArray(recs)) return false;
    return recs.some((r: any) => {
      const catMatch = categoriaFiltro ? r.categoria === categoriaFiltro : true;
      const subMatch = subcategoriaFiltro ? (r.subCategoria || r.subcategoria) === subcategoriaFiltro : true;
      return catMatch && subMatch;
    });
  } catch {
    return false;
  }
};

const isDonacionValid = (
  d: DonacionResponse,
  centroSeleccionado: string,
  regionSeleccionada: string,
  centrosAcopio: CentroAcopio[],
  searchTerm: string,
  categoriaFiltro: string,
  subcategoriaFiltro: string
): boolean => {
  if (!matchesCentroAcopio(d, centroSeleccionado, regionSeleccionada, centrosAcopio)) return false;
  if (!matchesSearchTerm(d, searchTerm)) return false;
  if (!matchesCategoria(d, categoriaFiltro, subcategoriaFiltro)) return false;
  return true;
};

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
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [subcategoriaFiltro, setSubcategoriaFiltro] = useState('');
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
        const data = await listarDonaciones();

        // Solo mostramos donaciones con estado RECIBIDO (ya entregadas en el centro de acopio)
        const donacionesRecibidas = data.filter(d => 
          d.estado === 'RECIBIDO' || d.estado === 'Recibido' || d.estado?.toLowerCase() === 'recibido'
        );
        setDonaciones(donacionesRecibidas);

        try {
          const usersResponse = await obtenerUsuarios({ size: 1000 });
          const map: Record<number, Usuario> = {};
          usersResponse.content.forEach(u => map[Number(u.id)] = u);
          setUsuariosMap(map);
        } catch (e) {
          console.warn('No se pudieron cargar los usuarios para historial público', e);
        }

      } catch (err) {
        console.error('Error al obtener historial:', err);
        setError('No se pudo cargar el historial de acopio. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usuario]);

  const getDonanteName = (donanteId?: number) => {
    if (!donanteId || !usuariosMap[donanteId]) return 'Solidario/a';
    const u = usuariosMap[donanteId];
    if (u.tipoPersona === 'Jurídica' && u.razonSocial) return u.razonSocial;
    if (u.nombreCompleto) return u.nombreCompleto;
    return u.nombre || 'Solidario/a';
  };

  useEffect(() => { setCurrentPage(1); }, [regionSeleccionada, centroSeleccionado, searchTerm, categoriaFiltro, subcategoriaFiltro]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando el historial solidario...</p>
      </Container>
    );
  }

  // Filtrado general
  const filteredDonaciones = donaciones.filter(d => 
    isDonacionValid(d, centroSeleccionado, regionSeleccionada, centrosAcopio, searchTerm, categoriaFiltro, subcategoriaFiltro)
  );

  // KPIs
  const totalArticulos = filteredDonaciones.reduce((acc, curr) => {
    let cant = 0;
    try {
      const recs = JSON.parse(curr.recursos || '[]');
      if (Array.isArray(recs)) {
        cant = recs.reduce((sum: number, r: any) => sum + (r.cantidad || 0), 0);
      }
    } catch {}
    return acc + cant;
  }, 0);
  const donantesUnicos = new Set(filteredDonaciones.map(d => d.donanteId).filter(Boolean)).size;

  // Chart Data
  const subcategoriaMap: Record<string, number> = {};
  filteredDonaciones.forEach(d => {
    try {
      const recs = JSON.parse(d.recursos || '[]');
      if (Array.isArray(recs)) {
        // Usamos un Set para no contar la misma subcategoría dos veces en una sola donación
        const subsInDonacion = new Set<string>();
        recs.forEach((r: any) => {
          const s = r.subCategoria || r.subcategoria || 'Otros';
          subsInDonacion.add(s);
        });
        subsInDonacion.forEach(s => {
          subcategoriaMap[s] = (subcategoriaMap[s] || 0) + 1;
        });
      }
    } catch {}
  });
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const chartData = Object.entries(subcategoriaMap).map(([name, value], index) => ({
    name,
    value,
    fill: COLORS[index % COLORS.length]
  }));

  // Top Donantes
  const donantesMap: Record<number, number> = {};
  filteredDonaciones.forEach(d => {
    if (d.donanteId && d.visibilidad === 'Publica') {
      let cant = 0;
      try {
        const recs = JSON.parse(d.recursos || '[]');
        if (Array.isArray(recs)) cant = recs.reduce((sum: number, r: any) => sum + (r.cantidad || 0), 0);
      } catch {}
      donantesMap[d.donanteId] = (donantesMap[d.donanteId] || 0) + cant;
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
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1 fw-semibold"><Search size={14} className="me-1 text-primary" /> Región</Form.Label>
                    <Form.Select size="sm" value={regionSeleccionada} onChange={(e) => setRegionSeleccionada(e.target.value)}>
                      <option value="">Todas...</option>
                      {REGIONES_CHILE.map(r => <option key={r} value={r}>{r}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1 fw-semibold">Centro Acopio</Form.Label>
                    <Form.Select size="sm" value={centroSeleccionado} onChange={(e) => setCentroSeleccionado(e.target.value)} disabled={!regionSeleccionada || centrosAcopio.length === 0}>
                      <option value="">{regionSeleccionada ? 'Todos...' : 'Selecciona región...'}</option>
                      {centrosAcopio.map(c => <option key={c.id} value={c.id.toString()}>{c.nombre}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1 fw-semibold">Categoría</Form.Label>
                    <Form.Select size="sm" value={categoriaFiltro} onChange={(e) => { setCategoriaFiltro(e.target.value); setSubcategoriaFiltro(''); }}>
                      <option value="">Todas...</option>
                      {Object.keys(SUBCATEGORIAS).map(c => <option key={c} value={c}>{c}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1 fw-semibold">Subcategoría</Form.Label>
                    <Form.Select size="sm" value={subcategoriaFiltro} onChange={(e) => setSubcategoriaFiltro(e.target.value)} disabled={!categoriaFiltro || !SUBCATEGORIAS[categoriaFiltro]}>
                      <option value="">Todas...</option>
                      {(SUBCATEGORIAS[categoriaFiltro] || []).map(s => <option key={s} value={s}>{s}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="small text-muted mb-1 fw-semibold">ID / Buscar</Form.Label>
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
                        <th>Título</th>
                        <th>Recurso</th>
                        <th>Cantidad</th>
                        <th>Fecha</th>
                        <th>Detalles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.map((donacion) => {
                        const esPrivada = donacion.visibilidad === 'Privada';
                        let totalItems = 0;
                        let unidadLabel = 'unidades';
                        let recursosList: { cat: string, subs: string[] }[] = [];
                        try {
                          const recs = JSON.parse(donacion.recursos || '[]');
                          if (Array.isArray(recs) && recs.length > 0) {
                            totalItems = recs.reduce((s: number, r: any) => s + flattenResourceUnit(r, r.cantidad || 0).finalCantidad, 0);
                            unidadLabel = flattenResourceUnit(recs[0], recs[0].cantidad || 0).finalUnidad.toLowerCase();
                            
                            const categoriasMap = new Map<string, Set<string>>();
                            recs.forEach((r: any) => {
                                const c = r.categoria || 'Otros';
                                const s = r.subCategoria || r.subcategoria || '';
                                if (!categoriasMap.has(c)) {
                                    categoriasMap.set(c, new Set());
                                }
                                if (s) {
                                    categoriasMap.get(c)!.add(s);
                                }
                            });
                            
                            categoriasMap.forEach((subs, cat) => {
                                recursosList.push({ cat, subs: Array.from(subs) });
                            });
                          }
                        } catch {}
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
                            <td className="small">{donacion.nombreArticulo || 'Donación'}</td>
                            <td className="small">
                              {recursosList.length > 0 ? recursosList.map((recItem, idx) => (
                                <div key={recItem.cat} className={idx < recursosList.length - 1 ? "mb-2" : ""}>
                                  <span className="fw-semibold text-dark d-block" style={{ lineHeight: '1.2' }}>{recItem.cat}</span>
                                  {recItem.subs.length > 0 && (
                                    <span className="text-muted d-block" style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                                      {recItem.subs.join(', ')}
                                    </span>
                                  )}
                                </div>
                              )) : (
                                <span className="text-muted">Sin detalles</span>
                              )}
                            </td>
                            <td>
                              <Badge bg="primary" pill>
                                {totalItems} {unidadLabel}
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
              <h6 className="fw-bold text-secondary mb-4 text-center" style={{ fontSize: '0.85rem' }}><PackageCheck size={16} className="me-1 text-primary" />Subcategorías</h6>
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
        <Modal.Body className="py-4">
          {selectedDonacion && (
            <Row className="g-4">
              <Col md={6}>
                <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Información General</h6>
                <div className="mb-2">
                  <strong>Privacidad: </strong> 
                  <Badge bg={selectedDonacion.visibilidad === 'Privada' ? 'secondary' : 'success'}>
                    {selectedDonacion.visibilidad === 'Privada' ? 'Anónima' : 'Pública'}
                  </Badge>
                </div>
                {selectedDonacion.visibilidad !== 'Privada' && (
                  <>
                    <p className="mb-2"><strong>ID Tracking:</strong> {selectedDonacion.trackingId || '-'}</p>
                    <p className="mb-2"><strong>Donante:</strong> {getDonanteName(selectedDonacion.donanteId)}</p>
                    <p className="mb-2"><strong>Fecha Registro:</strong> {selectedDonacion.fechaRegistro ? new Date(selectedDonacion.fechaRegistro).toLocaleString('es-CL') : ''}</p>
                  </>
                )}
                <p className="mb-2"><strong>Título:</strong> {selectedDonacion.nombreArticulo || 'Sin título'}</p>
                <p className="mb-2"><strong>Estado Actual:</strong> <Badge bg={selectedDonacion.estado === 'PENDIENTE' ? 'warning' : 'success'}>{selectedDonacion.estado}</Badge></p>
              </Col>
              
              <Col md={6}>
                <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Logística</h6>
                <p className="mb-2"><strong>Vehículo Especial:</strong> {selectedDonacion.transporteEspecial ? <Badge bg="warning">Sí</Badge> : 'No'}</p>
                <p className="mb-2"><strong>Horario Disponible:</strong> {selectedDonacion.disponibilidadHoraria || 'Cualquier horario'}</p>
                {selectedDonacion.visibilidad !== 'Privada' && (
                  <p className="mb-2"><strong>Conductor ID:</strong> {selectedDonacion.conductorId || 'No asignado'}</p>
                )}
              </Col>
              
              <Col md={12}>
                <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Recursos Donados</h6>
                <RecursosDetalleTable recursos={selectedDonacion.recursos || '[]'} />
              </Col>
              
              {selectedDonacion.descripcion && (
                <Col md={12}>
                  <h6 className="fw-bold text-muted mb-2">Descripción Adicional</h6>
                  <p className="bg-light p-3 rounded">{selectedDonacion.descripcion}</p>
                </Col>
              )}

              {selectedDonacion.fotoBase64 && selectedDonacion.visibilidad !== 'Privada' && (
                <Col md={12} className="text-center">
                  <h6 className="fw-bold text-muted mb-3 text-start">Fotografía Adjunta</h6>
                  <img src={selectedDonacion.fotoBase64} alt="Donación" className="img-fluid rounded shadow-sm" style={{ maxHeight: '300px', objectFit: 'cover' }} />
                </Col>
              )}

              {selectedDonacion.visibilidad !== 'Privada' && (
                <Col md={12}>
                  <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Ubicación de Retiro</h6>
                  <div className="bg-light p-3 rounded d-flex flex-column gap-2">
                    <p className="mb-0"><strong>Dirección:</strong> {selectedDonacion.direccionRetiro || `${selectedDonacion.direccionRetiroCalle || ''} ${selectedDonacion.direccionRetiroNumero || ''}`.trim() || 'No especificada'}</p>
                    <p className="mb-0"><strong>Comuna:</strong> {selectedDonacion.comunaRetiro || selectedDonacion.origen}</p>
                    <p className="mb-0"><strong>Región:</strong> {selectedDonacion.regionRetiro}</p>
                    
                    {selectedDonacion.latitudRetiro != null && selectedDonacion.longitudRetiro != null && (
                      <Button 
                        variant="primary" 
                        className="mt-2 align-self-start d-flex align-items-center gap-2 rounded-pill shadow-sm"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedDonacion.latitudRetiro},${selectedDonacion.longitudRetiro}`, '_blank')}
                      >
                        <MapPin size={16} /> Ver en Google Maps
                      </Button>
                    )}
                  </div>
                </Col>
              )}
            </Row>
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

