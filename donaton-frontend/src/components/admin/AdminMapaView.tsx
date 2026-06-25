import React from 'react';
import { Row, Col, Card, Badge, Form, Spinner, Button } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Truck } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DonacionResponse } from '../../services/donacionService';
import type { Necesidad } from '../../services/bffService';

export const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const necesidadIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
};

const parseRecursos = (recursosData: any) => {
  if (!recursosData) return [];
  
  let parsed = recursosData;
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed); } catch(e) { console.debug(e); }
  }
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

export type MapFilterType = 'GLOBAL' | 'DONACIONES' | 'NECESIDADES';

interface AdminMapaViewProps {
  mapFilter: MapFilterType;
  setMapFilter: React.Dispatch<React.SetStateAction<MapFilterType>>;
  donacionesLogistica: DonacionResponse[];
  necesidades: Necesidad[];
  loadingMapa: boolean;
  mapCenter: [number, number];
  setMapCenter: React.Dispatch<React.SetStateAction<[number, number]>>;
  usuario: any;
  setConfirmModal: React.Dispatch<React.SetStateAction<{ show: boolean, type: 'donacion' | 'necesidad', id: number, newState: string } | null>>;
  setDonacionDetalle: React.Dispatch<React.SetStateAction<DonacionResponse | null>>;
  isDonacionLocked: (estado: string, usuario: any) => boolean;
  getOpcionesDonacion: (estado: string, usuario: any) => string[];
  isNecesidadLocked: (estado: string, usuario: any) => boolean;
  getOpcionesNecesidad: (estado: string, usuario: any) => string[];
  getNecesidadBgColor: (estado?: string) => string;
}

export const AdminMapaView: React.FC<AdminMapaViewProps> = ({
  mapFilter,
  setMapFilter,
  donacionesLogistica,
  necesidades,
  loadingMapa,
  mapCenter,
  setMapCenter,
  usuario,
  setConfirmModal,
  setDonacionDetalle,
  isDonacionLocked,
  getOpcionesDonacion,
  isNecesidadLocked,
  getOpcionesNecesidad,
  getNecesidadBgColor
}) => {
  const showDonaciones = mapFilter === 'GLOBAL' || mapFilter === 'DONACIONES';
  const showNecesidades = mapFilter === 'GLOBAL' || mapFilter === 'NECESIDADES';

  const puntosAccion: any[] = [];
  if (showDonaciones) {
    puntosAccion.push(...donacionesLogistica.map(d => ({ ...d, _tipo: 'donacion' })));
  }
  if (showNecesidades) {
    puntosAccion.push(...necesidades.map(n => ({ ...n, _tipo: 'necesidad' })));
  }

  const [currentPage, setCurrentPage] = React.useState(0);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  React.useEffect(() => {
    setCurrentPage(0);
  }, [mapFilter]);

  const totalElements = puntosAccion.length;
  const totalPages = Math.ceil(totalElements / itemsPerPage) || 1;
  const paginatedPuntos = puntosAccion.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>🗺️ Mapa Logístico Operativo</h4>
          <p className="text-muted mb-0">Gestión de retiros y entregas en terreno</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Form.Select 
            size="sm" 
            value={mapFilter} 
            onChange={(e) => setMapFilter(e.target.value as 'GLOBAL' | 'DONACIONES' | 'NECESIDADES')}
            style={{ width: '180px', borderRadius: '10px', border: '2px solid #e0e0e0', fontWeight: 500 }}
          >
            <option value="GLOBAL">🌐 Mostrar Todo</option>
            <option value="DONACIONES">📦 Solo Donaciones</option>
            <option value="NECESIDADES">🚨 Solo Necesidades</option>
          </Form.Select>
          <Badge bg="primary" pill className="px-3 py-2">📦 {donacionesLogistica.length} Retiros</Badge>
          <Badge bg="danger" pill className="px-3 py-2">🔴 {necesidades.length} Necesidades</Badge>
        </div>
      </div>

      {loadingMapa ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Cargando mapa operativo...</p></div>
      ) : (
        <Row>
          <Col lg={4} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', maxHeight: '650px', overflowY: 'auto' }}>
              <Card.Body className="p-0">
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ backgroundColor: '#f8f9ff', position: 'sticky', top: 0, zIndex: 10 }}>
                  <h6 className="fw-bold mb-0" style={{ color: '#6c63ff' }}>📋 Puntos de Acción</h6>
                </div>

                {paginatedPuntos.map((item) => {
                  if (item._tipo === 'donacion') {
                    const d = item as DonacionResponse;
                    return (
                      <div key={`don-${d.id}`} className="p-3 border-bottom text-start w-100 d-block" style={{ transition: 'background 0.2s', backgroundColor: d.estado === 'En tránsito' ? '#f0f8ff' : '#fff' }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Badge bg="info" style={{ fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => setMapCenter([d.latitudRetiro || 0, d.longitudRetiro || 0])}>
                            📍 Donación #{d.id}
                          </Badge>
                          <Form.Select
                            size="sm"
                            value={d.estado || 'Pendiente'}
                            onChange={(e) => setConfirmModal({ show: true, type: 'donacion', id: d.id, newState: e.target.value })}
                            style={{ width: '120px', borderRadius: '8px', fontSize: '0.8rem' }}
                            disabled={isDonacionLocked(d.estado || '', usuario)}
                          >
                            {getOpcionesDonacion(d.estado || '', usuario).map(est => (
                              <option key={est} value={est}>{est}</option>
                            ))}
                          </Form.Select>
                        </div>
                        <p className="mb-1 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                          {d.nombreArticulo || 'Varias Donaciones'}
                        </p>
                        <div className="mb-1">{renderRecursos(d.recursos)}</div>
                        <small className="text-muted d-block"><Truck size={12} className="me-1"/>{d.direccionRetiro || (d.direccionRetiroCalle + ' ' + (d.direccionRetiroNumero ? '#' + d.direccionRetiroNumero : '')).trim()}, {d.comunaRetiro}, {d.regionRetiro}</small>
                        <div className="mt-2 text-end">
                          <Button variant="outline-primary" size="sm" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '8px' }} onClick={() => setDonacionDetalle(d)}>Ver Detalles</Button>
                        </div>
                      </div>
                    );
                  } else {
                    const n = item as Necesidad;
                    return (
                      <div key={`nec-${n.id}`} className="p-3 border-bottom text-start w-100 d-block" style={{ transition: 'background 0.2s', backgroundColor: getNecesidadBgColor(n.estado) }}>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Badge bg="danger" style={{ fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => setMapCenter([n.latitud, n.longitud])}>
                            🚨 {n.tipoEmergencia || 'Necesidad'}
                          </Badge>
                          <Form.Select
                            size="sm"
                            value={n.estado || 'Pendiente'}
                            onChange={(e) => setConfirmModal({ show: true, type: 'necesidad', id: n.id, newState: e.target.value })}
                            style={{ width: '120px', borderRadius: '8px', fontSize: '0.8rem' }}
                            disabled={isNecesidadLocked(n.estado || '', usuario)}
                          >
                            {getOpcionesNecesidad(n.estado || '', usuario).map(est => (
                              <option key={est} value={est}>{est}</option>
                            ))}
                          </Form.Select>
                        </div>
                        <div className="mb-0 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{renderRecursos(n.recursos)}</div>
                      </div>
                    );
                  }
                })}

                {totalElements === 0 && (
                  <div className="text-center py-5 text-muted">
                    <div style={{ fontSize: '2rem' }}>🍃</div>
                    No hay puntos activos en la lista
                  </div>
                )}
              </Card.Body>
              
              {/* Pagination Controls */}
              {totalElements > 0 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top bg-light" style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
                  <small className="text-muted">Mostrando {paginatedPuntos.length} de {totalElements}</small>
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Select size="sm" style={{ width: '70px', borderRadius: '10px' }} value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(0); }}>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                    </Form.Select>
                    <div className="d-flex gap-1">
                      <Button size="sm" variant="outline-secondary" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)} style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>&lt;</Button>
                      <Button size="sm" variant="outline-primary" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)} style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>&gt;</Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
              <div style={{ height: '650px' }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapUpdater center={mapCenter} />

                  {showDonaciones && donacionesLogistica.map(d => (
                    <Marker key={`don-marker-${d.id}`} position={[d.latitudRetiro || 0, d.longitudRetiro || 0]} icon={userIcon}>
                      <Popup>
                        <strong>Donación #{d.id} - {d.nombreArticulo || 'Varias Donaciones'}</strong><br/>
                        {renderRecursos(d.recursos)}
                        <Badge bg="info" className="mt-1">{d.estado}</Badge>
                      </Popup>
                    </Marker>
                  ))}

                  {showNecesidades && necesidades.map(n => (
                    <Marker key={`nec-marker-${n.id}`} position={[n.latitud, n.longitud]} icon={necesidadIcon}>
                      <Popup>
                        <strong>{n.tipoEmergencia || 'Necesidad'}</strong><br/>
                        {renderRecursos(n.recursos)}<br/>
                        <Badge bg="danger" className="mt-1">{n.estado || 'Pendiente'}</Badge>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

