import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Nav, Modal, Form, Pagination } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Select from 'react-select';
import { Package, CheckCircle, Navigation, Archive, Info, MapPin, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { listarDonaciones, asignarConductor, actualizarEstadoDonacion, type DonacionResponse } from '../../services/donacionService';
import { obtenerNecesidades, actualizarEstadoNecesidad, type Necesidad } from '../../services/bffService';
import { obtenerUsuarios } from '../../services/usuarioService';
import { obtenerCentrosAcopio, type CentroAcopio } from '../../services/logisticaService';
import './PanelAdminAcopio.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const necesidadMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const donacionMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const getBadgeColor = (estado: string) => {
  const e = estado.toUpperCase();
  if (e === 'RECIBIDO' || e === 'CUBIERTA' || e === 'ENTREGADO') return 'success';
  if (e === 'PENDIENTE' || e === 'ACTIVA') return 'warning';
  if (e === 'RECHAZADA_CONDUCTOR') return 'danger';
  if (e === 'DESPACHADO' || e === 'EN TRÁNSITO' || e === 'EN_TRANSITO' || e === 'EN_PROCESO' || e === 'ASIGNADO') return 'info';
  return 'secondary';
};

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, 12);
  }, [center, map]);
  return null;
}

const parseRecursos = (recursosStr: string | undefined): any[] => {
  if (!recursosStr) return [];
  try {
    const p1 = JSON.parse(recursosStr);
    return typeof p1 === 'string' ? JSON.parse(p1) : p1;
  } catch {
    return [];
  }
};

const PanelAdminAcopio: React.FC = () => {
  const { usuario } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donaciones');
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.4489, -70.6693]);

  const [miCentro, setMiCentro] = useState<CentroAcopio | null>(null);
  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [conductores, setConductores] = useState<{ value: number; label: string }[]>([]);

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [showConfirmAsignar, setShowConfirmAsignar] = useState(false);
  const [donacionAConfirmar, setDonacionAConfirmar] = useState<DonacionResponse | null>(null);
  const [conductorAConfirmar, setConductorAConfirmar] = useState<number | null>(null);

  const [showNecesidadModal, setShowNecesidadModal] = useState(false);
  const [necesidadSeleccionada, setNecesidadSeleccionada] = useState<Necesidad | null>(null);
  const [conductorSeleccionadoNec, setConductorSeleccionadoNec] = useState<number | null>(null);

  const [showDetallesDonacion, setShowDetallesDonacion] = useState(false);
  const [donacionDetalle, setDonacionDetalle] = useState<DonacionResponse | null>(null);

  const fetchData = async () => {
    try {
      const [donData, necData, users, centros] = await Promise.all([
        listarDonaciones(),
        obtenerNecesidades(),
        obtenerUsuarios(),
        obtenerCentrosAcopio()
      ]);

      const centroUser = centros.find(c => c.id === usuario?.centroAcopioId);
      if (centroUser) {
        setMiCentro(centroUser);
        if (centroUser.latitud && centroUser.longitud) {
          setMapCenter([centroUser.latitud, centroUser.longitud]);
        }
      }

      setDonaciones(donData);
      setNecesidades(necData);
      
      const regionUserFilter = centroUser?.region || usuario?.region;

      const conds = (users.content || [])
        .filter((u: any) => u.subRol?.toUpperCase() === 'CONDUCTOR' && u.activo === true && u.region === regionUserFilter)
        .map((u: any) => ({ value: Number(u.id), label: u.nombreCompleto || u.nombre || `Conductor #${u.id}` }));
      setConductores(conds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const regionUser = miCentro?.region || usuario?.region;
  
  const misDonaciones = donaciones.filter(d => d.regionRetiro === regionUser);
  const donacionesPendientes = misDonaciones.filter(d => {
    const st = d.estado?.toUpperCase() || '';
    return ['PENDIENTE', 'RECHAZADA_CONDUCTOR', 'EN_TRANSITO', 'EN TRÁNSITO', 'DESPACHADO', 'ASIGNADO'].includes(st);
  });
  
  const donacionesRecibidas = misDonaciones.filter(d => ['RECIBIDO', 'CUBIERTA', 'ENTREGADO'].includes(d.estado?.toUpperCase() || ''));

  const misNecesidades = necesidades.filter(n => n.region === regionUser);
  const necesidadesActivas = misNecesidades.filter(n => {
    const e = n.estado?.toUpperCase() || '';
    return ['ACTIVA', 'PENDIENTE', 'EN_PROCESO', 'ASIGNADO', 'EN_TRANSITO', 'EN TRÁNSITO'].includes(e);
  });
  const necesidadesCubiertas = misNecesidades.filter(n => ['CUBIERTA', 'ENTREGADO'].includes(n.estado?.toUpperCase() || ''));

  const inventarioMap = new Map<string, number>();
  donacionesRecibidas.forEach(d => {
    try {
      const recs = JSON.parse(d.recursos || '[]');
      if (Array.isArray(recs)) {
        recs.forEach((r: any) => {
          const key = `${r.categoria || 'Otros'}|${r.subCategoria || 'General'}|${r.unidadMedida || r.unidad || 'Unidades'}`;
          inventarioMap.set(key, (inventarioMap.get(key) || 0) + (r.cantidad || 1));
        });
      }
    } catch {}
  });
  const inventarioLista = Array.from(inventarioMap.entries()).map(([key, cant]) => {
    const [cat, subcat, uni] = key.split('|');
    return { categoria: cat, subcategoria: subcat, unidadMedida: uni, cantidad: cant };
  });

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = page * itemsPerPage;

  const paginatedDonacionesPendientes = donacionesPendientes.slice(startIndex, endIndex);
  const paginatedDonacionesRecibidas = donacionesRecibidas.slice(startIndex, endIndex);
  const paginatedInventario = inventarioLista.slice(startIndex, endIndex);
  const paginatedNecesidadesActivas = necesidadesActivas.slice(startIndex, endIndex);
  const paginatedNecesidadesCubiertas = necesidadesCubiertas.slice(startIndex, endIndex);

  const renderPaginationUI = (totalItems: number) => {
    if (totalItems === 0) return null;
    return (
      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top px-1">
        <span className="text-muted small">
          Mostrando {startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems} registros
        </span>
        <div className="d-flex align-items-center gap-2">
          <Form.Select 
            size="sm" 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setPage(1);
            }}
            style={{ width: '80px', borderRadius: '8px' }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Form.Select>
          <Pagination className="mb-0" size="sm">
            <Pagination.Prev disabled={page === 1} onClick={() => setPage(p => p - 1)} />
            <Pagination.Next disabled={page === Math.ceil(totalItems / itemsPerPage) || totalItems === 0} onClick={() => setPage(p => p + 1)} />
          </Pagination>
        </div>
      </div>
    );
  };

  const centrarMapa = (lat?: number | null, lng?: number | null) => {
    if (lat && lng) setMapCenter([lat, lng]);
  };

  const handleConfirmarAsignacion = async () => {
    if (!donacionAConfirmar || !conductorAConfirmar) return;
    setActionLoading(donacionAConfirmar.id);
    try {
      await asignarConductor(donacionAConfirmar.id, conductorAConfirmar);
      setDonaciones(prev => prev.map(d => 
        d.id === donacionAConfirmar.id ? { ...d, conductorId: conductorAConfirmar, estado: 'ASIGNADO' } : d
      ));
      setShowConfirmAsignar(false);
      setDonacionAConfirmar(null);
      setConductorAConfirmar(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error al asignar conductor.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecibirDonacion = async (donacionId: number) => {
    try {
      await actualizarEstadoDonacion(donacionId, 'RECIBIDO');
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error al recibir donación.');
    }
  };

  const handleCubrirNecesidad = async () => {
    if (!necesidadSeleccionada || !conductorSeleccionadoNec || !miCentro) return;
    setActionLoading(necesidadSeleccionada.id);
    try {
      const estadoNuevo = 'ASIGNADO';
      await actualizarEstadoNecesidad(necesidadSeleccionada.id, estadoNuevo, miCentro.id, conductorSeleccionadoNec);
      setShowNecesidadModal(false);
      setConductorSeleccionadoNec(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert('Error al cubrir necesidad.');
    } finally {
      setActionLoading(null);
    }
  };



  if (loading) {
    return (
      <Container className="py-5 text-center d-flex flex-column align-items-center justify-content-center min-vh-100">
        <Spinner animation="grow" variant="primary" className="mb-3" />
        <h5 className="text-muted fw-light">Cargando Operaciones de Acopio...</h5>
      </Container>
    );
  }

  const chequearInventario = (necesidad: Necesidad) => {
    const recursos = parseRecursos(necesidad.recursos);
    let suficientes = true;
    const detalles = recursos.map(rec => {
      const inv = inventarioLista.find(i => i.categoria === rec.categoria && i.subcategoria === (rec.subcategoria || rec.subCategoria) && i.unidadMedida === rec.unidad);
      const cantInv = inv ? inv.cantidad : 0;
      if (cantInv < rec.cantidad) suficientes = false;
      return {
        ...rec,
        disponible: cantInv,
        alcanza: cantInv >= rec.cantidad
      };
    });
    return { suficientes, detalles };
  };

  return (
    <div className="acopio-panel-bg py-4">
      <Container fluid className="px-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-primary text-white p-3 rounded-circle me-3 shadow-sm">
            <Archive size={28} />
          </div>
          <div>
            <h2 className="mb-0 fw-bold text-dark">Operaciones de Acopio</h2>
            <p className="text-muted mb-0">
              {miCentro ? `${miCentro.nombre} - Región: ${miCentro.region}` : 'Administración Logística'}
            </p>
          </div>
        </div>

        <Card className="glass-card mb-4 border-0">
          <Card.Body className="p-4">
            {/* TABS */}
            <Nav variant="pills" className="pill-nav mb-4" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <Nav.Item>
                <Nav.Link active={activeTab === 'donaciones'} onClick={() => setActiveTab('donaciones')}>
                  Donaciones
                  {donacionesPendientes.length > 0 && <Badge bg="danger" className="ms-2 rounded-pill">{donacionesPendientes.length}</Badge>}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link active={activeTab === 'historial-donaciones'} onClick={() => setActiveTab('historial-donaciones')}>
                  Historial de Donación
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link active={activeTab === 'inventario'} onClick={() => setActiveTab('inventario')}>
                  Inventario
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link active={activeTab === 'alertas'} onClick={() => setActiveTab('alertas')}>
                  Alerta de Necesidades
                  {necesidadesActivas.length > 0 && <Badge bg="danger" className="ms-2 rounded-pill">{necesidadesActivas.length}</Badge>}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link active={activeTab === 'historial-necesidades'} onClick={() => setActiveTab('historial-necesidades')}>
                  Historial de Necesidades
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* PESTAÑA 1: DONACIONES (PENDIENTES Y EN TRÁNSITO) */}
            {activeTab === 'donaciones' && (
              <Row>
                <Col lg={7} className="mb-4 mb-lg-0">
                  <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                    <h5 className="mb-0 fw-bold">Gestión de Retiros y Recepciones</h5>
                  </div>
                  {donacionesPendientes.length === 0 ? (
                    <div className="text-center p-5 bg-light rounded-4 border">
                      <Package size={48} className="text-muted mb-3 opacity-50" />
                      <h6 className="text-muted">No hay donaciones pendientes o en tránsito en tu región.</h6>
                    </div>
                  ) : (
                    <Card className="border shadow-sm p-3 rounded-4 bg-white">
                      <div className="table-responsive">
                        <Table className="modern-table w-100 mb-0" hover borderless style={{ minWidth: '700px' }}>
                          <thead>
                            <tr>
                              <th>Tracking</th>
                              <th>Cantidad</th>
                              <th>Recurso</th>
                              <th>Categoría</th>
                              <th>Vehículo</th>
                              <th style={{ minWidth: '220px' }}>Asignación Conductor</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedDonacionesPendientes.map(don => {
                              const isRechazada = don.estado?.toUpperCase() === 'RECHAZADA_CONDUCTOR';
                              const isAssigned = !isRechazada && (don.conductorId || ['EN_TRANSITO', 'DESPACHADO', 'ASIGNADO', 'EN TRÁNSITO'].includes(don.estado?.toUpperCase() || ''));
                              const canReceive = ['EN_TRANSITO', 'DESPACHADO', 'EN TRÁNSITO'].includes(don.estado?.toUpperCase() || '');
                              
                              return (
                                <tr key={don.id}>
                                  <td><span className="fw-bold text-primary">#{don.id}</span></td>
                                  <td><span className="fw-bold">
                                    {(() => {
                                      let cant = 0;
                                      try {
                                        const recs = JSON.parse(don.recursos || '[]');
                                        if (Array.isArray(recs)) cant = recs.reduce((s: number, r: any) => s + (r.cantidad || 0), 0);
                                      } catch {}
                                      return cant;
                                    })()}
                                  </span> items</td>
                                  <td>{don.nombreArticulo || 'Varias Donaciones'}</td>
                                  <td>Varias</td>
                                  <td>
                                    {don.transporteEspecial ? (
                                      <Badge bg="warning" className="soft-badge bg-opacity-10 text-warning border border-warning">Especial</Badge>
                                    ) : (
                                      <Badge bg="secondary" className="soft-badge bg-opacity-10 text-secondary border border-secondary">Normal</Badge>
                                    )}
                                  </td>
                                  <td>
                                    <Select
                                      options={conductores}
                                      value={isRechazada ? null : (conductores.find(c => c.value === don.conductorId) || null)}
                                      isDisabled={!!isAssigned}
                                      onChange={(v) => {
                                        if (v) {
                                          setDonacionAConfirmar(don);
                                          setConductorAConfirmar(v.value);
                                          setShowConfirmAsignar(true);
                                        }
                                      }}
                                      placeholder={isAssigned ? "Asignado" : "Seleccionar..."}
                                      menuPortalTarget={document.body}
                                      styles={{
                                        control: (base) => ({ ...base, minHeight: '32px', fontSize: '13px', borderRadius: '8px' }),
                                        menuPortal: base => ({ ...base, zIndex: 9999 })
                                      }}
                                    />
                                    {isAssigned && !canReceive && (
                                      <small className="text-success d-block mt-1 fw-bold" style={{fontSize: '11px'}}>Solicitud de asignación enviada</small>
                                    )}
                                    {isRechazada && (
                                      <small className="text-danger d-block mt-1 fw-bold" style={{fontSize: '11px'}}>¡Rechazado! Reasignar</small>
                                    )}
                                    {canReceive && (
                                      <small className="text-info d-block mt-1" style={{fontSize: '11px'}}>En camino</small>
                                    )}
                                  </td>
                                  <td>
                                    <div className="d-flex gap-1">
                                      <Button 
                                        variant="outline-info" 
                                        size="sm" 
                                        onClick={() => { setDonacionDetalle(don); setShowDetallesDonacion(true); }} 
                                        title="Ver Detalles"
                                        className="d-flex align-items-center"
                                      >
                                        <Info size={14} />
                                      </Button>
                                      <Button variant="outline-secondary" size="sm" onClick={() => centrarMapa(don.latitudRetiro, don.longitudRetiro)} title="Ir al mapa">
                                        <MapIcon size={14} />
                                      </Button>
                                      <Button 
                                        variant="success" 
                                        size="sm" 
                                        disabled={!canReceive} 
                                        onClick={() => handleRecibirDonacion(don.id)} 
                                        title="Recibir en Bodega"
                                        className="d-flex align-items-center gap-1 fw-semibold"
                                      >
                                        <CheckCircle size={14} /> Recibir
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      
                      {renderPaginationUI(donacionesPendientes.length)}
                    </Card>
                  )}
                </Col>
                <Col lg={5}>
                  <div className="map-container-wrapper" style={{ height: '500px' }}>
                    <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <ChangeView center={mapCenter} />
                      
                      {donacionesPendientes.map(don => (
                        don.latitudRetiro && don.longitudRetiro && (
                          <Marker key={`donmap-${don.id}`} position={[don.latitudRetiro, don.longitudRetiro]} icon={donacionMarkerIcon}>
                            <Popup className="custom-popup">
                              <div className="text-center p-1">
                                <h6 className="mb-1 fw-bold">ID #{don.id} - {don.nombreArticulo || 'Varias Donaciones'}</h6>
                                <p className="text-muted small mb-0">{don.direccionRetiroCalle} {don.direccionRetiroNumero}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )
                      ))}
                    </MapContainer>
                  </div>
                </Col>
              </Row>
            )}

            {/* PESTAÑA 2: HISTORIAL DE DONACIONES */}
            {activeTab === 'historial-donaciones' && (
              <div className="table-responsive">
                <Table className="modern-table w-100" hover borderless>
                  <thead>
                    <tr>
                      <th>Identificador</th>
                      <th>Categoría</th>
                      <th>Volumen</th>
                      <th>Comuna de Origen</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDonacionesRecibidas.map(don => (
                      <tr key={don.id}>
                        <td><span className="fw-bold text-primary">#{don.id}</span></td>
                        <td className="fw-semibold text-dark">{don.nombreArticulo || 'Varias Donaciones'}</td>
                        <td className="text-muted">
                          {(() => {
                            let cant = 0;
                            try {
                              const recs = JSON.parse(don.recursos || '[]');
                              if (Array.isArray(recs)) cant = recs.reduce((s: number, r: any) => s + (r.cantidad || 0), 0);
                            } catch {}
                            return `${cant} items`;
                          })()}
                        </td>
                        <td className="text-muted">{don.comunaRetiro || 'N/A'}</td>
                        <td>
                          <Badge bg={getBadgeColor(don.estado || '')} className={`soft-badge bg-opacity-10 text-${getBadgeColor(don.estado || '')} border border-${getBadgeColor(don.estado || '')}`}>
                            {don.estado}
                          </Badge>
                        </td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            onClick={() => { setDonacionDetalle(don); setShowDetallesDonacion(true); }} 
                            title="Ver Detalles"
                            className="d-flex align-items-center"
                          >
                            <Info size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {donacionesRecibidas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          <div className="text-muted d-flex flex-column align-items-center">
                            <Archive size={48} className="mb-3 opacity-25" />
                            <h5>Sin Historial</h5>
                            <p>No se han recibido donaciones en este centro aún.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                {renderPaginationUI(donacionesRecibidas.length)}
              </div>
            )}

            {/* PESTAÑA 3: INVENTARIO */}
            {activeTab === 'inventario' && (
               <div className="table-responsive">
                <Table className="modern-table w-100" hover borderless>
                  <thead>
                    <tr>
                      <th>Recurso / Subcategoría</th>
                      <th>Volumen Disponible</th>
                      <th>Unidad de Medida</th>
                      <th>Disponibilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInventario.map((inv) => (
                      <tr key={`${inv.categoria}-${inv.subcategoria}-${inv.unidadMedida}`}>
                        <td className="fw-semibold text-dark">
                          <Package size={16} className="me-2 text-muted" />
                          <span className="d-block">{inv.subcategoria}</span>
                          <small className="text-muted fw-normal">{inv.categoria}</small>
                        </td>
                        <td className="text-muted fw-bold">{inv.cantidad}</td>
                        <td className="text-muted">{inv.unidadMedida}</td>
                        <td>
                          <Badge bg="success" className="soft-badge bg-opacity-10 text-success border border-success">
                            <CheckCircle size={12} className="me-1" /> En Stock
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {inventarioLista.length === 0 && (
                      <tr>
                         <td colSpan={4} className="text-center py-5">
                          <div className="text-muted d-flex flex-column align-items-center">
                            <Archive size={48} className="mb-3 opacity-25" />
                            <h5>Inventario Vacío</h5>
                            <p>No tienes donaciones procesadas en bodega.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                {renderPaginationUI(inventarioLista.length)}
              </div>
            )}

            {/* PESTAÑA 4: ALERTA DE NECESIDADES */}
            {activeTab === 'alertas' && (
              <Row>
                <Col lg={7} className="mb-4 mb-lg-0">
                  <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                    <h5 className="mb-0 fw-bold">Alertas Activas</h5>
                  </div>
                  {necesidadesActivas.length === 0 ? (
                    <div className="text-center p-5 bg-light rounded-4 border">
                      <CheckCircle size={48} className="text-success mb-3 opacity-50" />
                      <h6 className="text-muted">No hay necesidades urgentes en tu región.</h6>
                    </div>
                  ) : (
                    <Card className="border shadow-sm p-3 rounded-4 bg-white">
                      <div className="table-responsive">
                        <Table className="modern-table w-100 mb-0" hover borderless style={{ minWidth: '600px' }}>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Emergencia</th>
                              <th>Recurso Requerido</th>
                              <th>Cantidad</th>
                              <th>Comuna</th>
                              <th>Estado</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedNecesidadesActivas.map(nec => {
                              let recInfo: any = null;
                              try {
                                if (nec.recursos) {
                                  const parsed = JSON.parse(nec.recursos);
                                  if (Array.isArray(parsed) && parsed.length > 0) recInfo = parsed[0];
                                }
                              } catch (e) {
                                console.error('Error al parsear recursos:', e);
                              }
                              
                              return (
                              <tr key={nec.id}>
                                <td><span className="fw-bold text-danger">#{nec.id}</span></td>
                                <td><span className="fw-bold">{nec.tipoEmergencia || 'Alerta General'}</span></td>
                                <td><span className="text-muted">{recInfo?.categoria || 'No especificado'}</span></td>
                                <td><span className="fw-bold">{recInfo?.cantidad || '-'}</span> <small className="text-muted">{recInfo?.unidad || ''}</small></td>
                                <td><span className="text-muted">{nec.comuna}</span></td>
                                <td>
                                  <Badge bg={getBadgeColor(nec.estado || 'PENDIENTE')} className="soft-badge text-white">
                                    {nec.estado?.replace('_', ' ') || 'PENDIENTE'}
                                  </Badge>
                                </td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <Button variant="outline-secondary" size="sm" onClick={() => centrarMapa(nec.latitud, nec.longitud)} title="Ir al mapa">
                                      <MapIcon size={14} />
                                    </Button>
                                    {(nec.estado === 'ACTIVA' || nec.estado === 'PENDIENTE' || nec.estado === 'Pendiente') && (
                                      <Button 
                                        variant="primary" 
                                        size="sm" 
                                        onClick={() => { setNecesidadSeleccionada(nec); setShowNecesidadModal(true); }}
                                        title="Asignar Conductor"
                                        className="d-flex align-items-center gap-1 fw-semibold"
                                      >
                                        <Navigation size={14} /> Asignar
                                      </Button>
                                    )}
                                    {(nec.estado === 'ASIGNADO') && (
                                      <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        disabled
                                        className="d-flex align-items-center gap-1 fw-semibold"
                                      >
                                        Esperando Conductor
                                      </Button>
                                    )}
                                    {(nec.estado?.toUpperCase() === 'EN_TRANSITO' || nec.estado?.toUpperCase() === 'EN TRÁNSITO') && (
                                      <Button 
                                        variant="info" 
                                        size="sm" 
                                        disabled
                                        className="d-flex align-items-center gap-1 fw-semibold text-white px-3"
                                      >
                                        <Navigation size={14} /> En Camino
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      
                      {renderPaginationUI(necesidadesActivas.length)}
                    </Card>
                  )}
                </Col>
                <Col lg={5}>
                  <div className="map-container-wrapper" style={{ height: '500px' }}>
                    <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <ChangeView center={mapCenter} />
                      
                      {necesidadesActivas.map(nec => (
                        nec.latitud && nec.longitud && (
                          <Marker key={`necmap-${nec.id}`} position={[nec.latitud, nec.longitud]} icon={necesidadMarkerIcon}>
                            <Popup className="custom-popup">
                              <div className="text-center p-1">
                                <Badge bg="danger" className="mb-2">Emergencia</Badge>
                                <h6 className="mb-1 fw-bold">{nec.tipoEmergencia || 'Alerta General'}</h6>
                                <p className="text-muted small mb-0">{nec.comuna}</p>
                              </div>
                            </Popup>
                          </Marker>
                        )
                      ))}
                    </MapContainer>
                  </div>
                </Col>
              </Row>
            )}

            {/* PESTAÑA 5: HISTORIAL DE NECESIDADES */}
            {activeTab === 'historial-necesidades' && (
               <div className="table-responsive">
                <Table className="modern-table w-100" hover borderless>
                  <thead>
                    <tr>
                      <th>Identificador</th>
                      <th>Tipo de Emergencia</th>
                      <th>Recurso Requerido</th>
                      <th>Cantidad</th>
                      <th>Comuna</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedNecesidadesCubiertas.map(nec => {
                      let recInfo = { categoria: '', cantidad: '', unidad: '' };
                      if (nec.recursos) {
                        try {
                          const parsed = JSON.parse(nec.recursos);
                          if (Array.isArray(parsed) && parsed.length > 0) {
                            recInfo = parsed[0];
                          }
                        } catch (e) {
                          console.error('Error al parsear recursos:', e);
                        }
                      }

                      return (
                      <tr key={nec.id}>
                        <td><span className="fw-bold text-primary">#{nec.id}</span></td>
                        <td className="fw-semibold text-dark">{nec.tipoEmergencia || 'General'}</td>
                        <td className="text-muted">{recInfo?.categoria || 'No especificado'}</td>
                        <td><span className="fw-bold">{recInfo?.cantidad || '-'}</span> <small className="text-muted">{recInfo?.unidad || ''}</small></td>
                        <td className="text-muted">{nec.comuna}</td>
                        <td>
                          <Badge bg="success" className="soft-badge bg-opacity-10 text-success border border-success">
                            <CheckCircle size={12} className="me-1" /> {nec.estado?.replace('_', ' ') || 'Cubierta'}
                          </Badge>
                        </td>
                      </tr>
                      );
                    })}
                    {necesidadesCubiertas.length === 0 && (
                      <tr>
                         <td colSpan={6} className="text-center py-5">
                          <div className="text-muted d-flex flex-column align-items-center">
                            <CheckCircle size={48} className="mb-3 opacity-25" />
                            <h5>No hay historial</h5>
                            <p>Aún no se han cubierto necesidades desde este centro.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
                {renderPaginationUI(necesidadesCubiertas.length)}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* MODAL: CONFIRMAR ASIGNACIÓN DE CONDUCTOR */}
        <Modal show={showConfirmAsignar} onHide={() => setShowConfirmAsignar(false)} centered backdrop="static">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-dark d-flex align-items-center">
              <Info size={24} className="text-primary me-2" />
              Confirmar Asignación
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            <p>
              ¿Estás seguro que deseas asignarle el retiro de la donación <strong>#{donacionAConfirmar?.id}</strong> al conductor <strong>{conductores.find(c => c.value === conductorAConfirmar)?.label}</strong>?
            </p>
            <p className="text-muted small mb-0">El conductor será notificado. Si acepta el viaje, el estado pasará a "En Tránsito" y luego podrás recibirla en bodega.</p>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="px-4 fw-semibold rounded-pill" onClick={() => setShowConfirmAsignar(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              className="px-4 fw-semibold rounded-pill shadow-sm"
              onClick={handleConfirmarAsignacion}
              disabled={actionLoading === donacionAConfirmar?.id}
            >
              {actionLoading === donacionAConfirmar?.id ? <Spinner size="sm" className="me-2" /> : null}
              Sí, Asignar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* MODAL: CUBRIR NECESIDAD */}
        <Modal show={showNecesidadModal} onHide={() => setShowNecesidadModal(false)} size="lg" centered backdrop="static">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold text-dark d-flex align-items-center">
              <Navigation size={24} className="text-primary me-2" />
              Cubrir Necesidad #{necesidadSeleccionada?.id}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            {necesidadSeleccionada && (
              <>
                <p className="text-muted mb-4">Revisa si tienes stock suficiente para cubrir esta emergencia y asigna un conductor para el despacho.</p>
                
                <Table className="modern-table mb-4" borderless>
                  <thead>
                    <tr>
                      <th>Recurso Requerido</th>
                      <th>Cantidad Pedida</th>
                      <th>Stock en Bodega</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chequearInventario(necesidadSeleccionada).detalles.map((det, i) => (
                      <tr key={`${det.categoria}-${det.subcategoria}-${det.unidad}-${i}`}>
                        <td>
                          <span className="fw-bold d-block">{det.subcategoria}</span>
                          <small className="text-muted">{det.categoria}</small>
                        </td>
                        <td>{det.cantidad} <small>{det.unidad}</small></td>
                        <td className="fw-bold">{det.disponible} <small>{det.unidad}</small></td>
                        <td>
                          {det.alcanza ? (
                            <Badge bg="success" className="soft-badge text-success bg-opacity-10">Suficiente</Badge>
                          ) : (
                            <Badge bg="danger" className="soft-badge text-danger bg-opacity-10">Falta stock</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <h6 className="fw-bold mb-2">Asignar Conductor para Despacho</h6>
                <Form.Group>
                  <Select
                    options={conductores}
                    value={conductores.find(c => c.value === conductorSeleccionadoNec) || null}
                    onChange={(v) => setConductorSeleccionadoNec(v?.value || null)}
                    placeholder="Buscar conductor..."
                    isClearable
                    styles={{
                      control: (base) => ({ ...base, borderRadius: '8px', borderColor: '#cbd5e1' })
                    }}
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0 d-flex justify-content-between">
            <Button variant="light" className="px-4 fw-semibold rounded-pill" onClick={() => setShowNecesidadModal(false)}>
              Cancelar
            </Button>
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                className="fw-semibold rounded-pill shadow-sm"
                onClick={() => handleCubrirNecesidad()}
                disabled={!conductorSeleccionadoNec || actionLoading === necesidadSeleccionada?.id}
              >
                {actionLoading === necesidadSeleccionada?.id ? <Spinner size="sm" /> : 'Asignar Conductor'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      {/* Modal Detalles Donación */}
      <Modal show={showDetallesDonacion} onHide={() => setShowDetallesDonacion(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Detalles de la Donación</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {donacionDetalle && (
            <Row className="g-4">
              <Col md={6}>
                <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Información General</h6>
                <p className="mb-2"><strong>ID Tracking:</strong> #{donacionDetalle.id}</p>
                <p className="mb-2"><strong>Título:</strong> {donacionDetalle.nombreArticulo || 'Sin título'}</p>
                <p className="mb-2"><strong>Recursos:</strong> {(() => {
                  let cant = 0;
                  try {
                    const recs = JSON.parse(donacionDetalle.recursos || '[]');
                    if (Array.isArray(recs)) cant = recs.reduce((s: number, r: any) => s + (r.cantidad || 0), 0);
                  } catch {}
                  return `${cant} items en total`;
                })()}</p>
                <p className="mb-2"><strong>Estado Actual:</strong> <Badge bg={getBadgeColor(donacionDetalle.estado || '')}>{donacionDetalle.estado}</Badge></p>
                <p className="mb-2"><strong>Fecha Registro:</strong> {new Date(donacionDetalle.fechaRegistro).toLocaleString()}</p>
              </Col>
              <Col md={6}>
                <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Logística</h6>
                <p className="mb-2"><strong>Vehículo Especial:</strong> {donacionDetalle.transporteEspecial ? <Badge bg="warning">Sí</Badge> : 'No'}</p>

                <p className="mb-2"><strong>Horario Disponible:</strong> {donacionDetalle.disponibilidadHoraria || 'Cualquier horario'}</p>
                <p className="mb-2"><strong>Donante ID:</strong> {donacionDetalle.donanteId || 'No registrado'}</p>
                <p className="mb-2"><strong>Conductor ID:</strong> {donacionDetalle.conductorId || 'No asignado'}</p>
              </Col>
              
              <Col md={12}>
                <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Recursos Donados</h6>
                {(() => {
                  try {
                    const recs = JSON.parse(donacionDetalle.recursos || '[]');
                    if (Array.isArray(recs) && recs.length > 0) {
                      return (
                        <div className="table-responsive">
                          <Table size="sm" bordered hover className="bg-white">
                            <thead className="table-success">
                              <tr>
                                <th>Categoría</th>
                                <th>Recurso</th>
                                <th>Estado</th>
                                <th>Cant.</th>
                                <th>Género/Talla</th>
                                <th>Vencimiento</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recs.map((r: any, idx: number) => (
                                <tr key={`${r.categoria}-${r.subCategoria}-${idx}`}>
                                  <td>{r.categoria}</td>
                                  <td>{r.subCategoria}</td>
                                  <td>{r.estadoArticulo}</td>
                                  <td>{r.cantidad} {r.unidadMedida}</td>
                                  <td>{r.genero || r.talla ? `${r.genero || '-'} / ${r.talla || '-'}` : '-'}</td>
                                  <td>{r.fechaVencimiento || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      );
                    } else {
                      return <span className="text-muted fst-italic">No hay recursos en esta donación.</span>;
                    }
                  } catch (e) {
                    console.error('Error parseando recursos:', e);
                    return <span className="text-muted fst-italic">Error al cargar recursos.</span>;
                  }
                })()}
              </Col>
              {donacionDetalle.descripcion && (
                <Col md={12}>
                  <h6 className="fw-bold text-muted mb-2">Descripción Adicional</h6>
                  <p className="bg-light p-3 rounded">{donacionDetalle.descripcion}</p>
                </Col>
              )}

              {donacionDetalle.fotoBase64 && (
                <Col md={12} className="text-center">
                  <h6 className="fw-bold text-muted mb-3 text-start">Fotografía Adjunta</h6>
                  <img src={donacionDetalle.fotoBase64} alt="Donación" className="img-fluid rounded shadow-sm" style={{ maxHeight: '300px', objectFit: 'cover' }} />
                </Col>
              )}

              <Col md={12}>
                <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Ubicación de Retiro</h6>
                <div className="bg-light p-3 rounded d-flex flex-column gap-2">
                  <p className="mb-0"><strong>Dirección:</strong> {donacionDetalle.direccionRetiro || `${donacionDetalle.direccionRetiroCalle || ''} ${donacionDetalle.direccionRetiroNumero || ''}`.trim() || 'No especificada'}</p>
                  <p className="mb-0"><strong>Comuna:</strong> {donacionDetalle.comunaRetiro || donacionDetalle.origen}</p>
                  <p className="mb-0"><strong>Región:</strong> {donacionDetalle.regionRetiro}</p>
                  
                  {donacionDetalle.latitudRetiro != null && donacionDetalle.longitudRetiro != null && (
                    <Button 
                      variant="primary" 
                      className="mt-2 align-self-start d-flex align-items-center gap-2 rounded-pill shadow-sm"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${donacionDetalle.latitudRetiro},${donacionDetalle.longitudRetiro}`, '_blank')}
                    >
                      <MapPin size={16} /> Ver en Google Maps
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowDetallesDonacion(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      </Container>
    </div>
  );
};

export default PanelAdminAcopio;
