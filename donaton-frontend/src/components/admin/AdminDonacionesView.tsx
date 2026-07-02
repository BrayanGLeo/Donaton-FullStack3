import React from 'react';
import { Card, Table, Badge, Button, Row, Col, Form, Spinner, Collapse } from 'react-bootstrap';
import Select from 'react-select';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../../utils/chileData';
import type { DonacionResponse } from '../../services/donacionService';
import type { CentroAcopio } from '../../services/logisticaService';
import type { Usuario } from '../../context/AuthContext';

export interface UsuarioExtended extends Usuario {
  rut?: string;
  telefono?: string;
  direccion?: string;
}



import { formatEstado } from '../../utils/adminDashboardUtils';

interface AdminDonacionesViewProps {
  donaciones: DonacionResponse[];
  loadingDonaciones: boolean;
  donacionesFiltradas: DonacionResponse[];
  donacionFiltros: any;
  setDonacionFiltros: React.Dispatch<React.SetStateAction<any>>;
  centros: CentroAcopio[];
  usuariosMapDonacion: Record<number, UsuarioExtended>;
  setDonacionDetalle: React.Dispatch<React.SetStateAction<DonacionResponse | null>>;
  RegionComunaInput: any;
  getDonanteNameFromMap: (donanteId?: number, map?: Record<number, UsuarioExtended>) => string;
  getEstadoBadgeColor: (estado: string) => string;
}

export const AdminDonacionesView: React.FC<AdminDonacionesViewProps> = ({
  donaciones,
  loadingDonaciones,
  donacionesFiltradas,
  donacionFiltros,
  setDonacionFiltros,
  centros,
  usuariosMapDonacion,
  setDonacionDetalle,
  RegionComunaInput,
  getDonanteNameFromMap,
  getEstadoBadgeColor,
}) => {
  const [currentPage, setCurrentPage] = React.useState(0);
  const [itemsPerPage, setItemsPerPage] = React.useState(20);
  const [showFiltros, setShowFiltros] = React.useState(false);

  React.useEffect(() => {
    setCurrentPage(0);
  }, [donacionFiltros]);

  const totalElements = donacionesFiltradas.length;
  const totalPages = Math.ceil(totalElements / itemsPerPage) || 1;
  const paginatedDonaciones = donacionesFiltradas.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const parseRecursos = (recursosData: any) => {
    if (!recursosData) return [];
    let parsed = recursosData;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) { console.debug(e); }
    }
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) { console.debug(e); }
    }
    if (Array.isArray(parsed)) {
      return parsed.map(item => {
        if (typeof item === 'string') {
          try { return JSON.parse(item); } catch (e) { console.debug(e); return item; }
        }
        return item;
      });
    }
    return [];
  };

  const categoriaOptions = React.useMemo(() => {
    const set = new Set<string>();
    donaciones.forEach(d => {
      const recs = parseRecursos(d.recursos);
      if (Array.isArray(recs)) recs.forEach((r: any) => { if (r?.categoria) set.add(r.categoria); });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b)).map(c => ({ value: c, label: c }));
  }, [donaciones]);

  const subcategoriaOptions = React.useMemo(() => {
    const set = new Set<string>();
    donaciones.forEach(d => {
      const recs = parseRecursos(d.recursos);
      if (Array.isArray(recs)) recs.forEach((r: any) => {
        if (donacionFiltros.categoria && r?.categoria !== donacionFiltros.categoria) return;
        const sub = r?.subcategoria || r?.subCategoria;
        if (sub) set.add(sub);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b)).map(c => ({ value: c, label: c }));
  }, [donaciones, donacionFiltros.categoria]);

  return (
  <div>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>📦 Historial de Donaciones</h4>
        <p className="text-muted mb-0">Registro histórico de todas las donaciones del sistema</p>
      </div>
      <Badge bg="primary" pill className="fs-6 px-3 py-2">{totalElements} registros</Badge>
    </div>

    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
      <Card.Body className="bg-light p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-bold text-primary">Total Registros ({totalElements})</h6>
        </div>
        <Row className="g-2 align-items-center">
          <Col md={2}>
            <Form.Control size="sm" placeholder="🔍 ID" value={donacionFiltros.id} onChange={e => setDonacionFiltros((prev: any) => ({ ...prev, id: e.target.value }))} />
          </Col>
          <Col md={4}>
            <Form.Control
              size="sm"
              placeholder="👤 Buscar por donante (nombre, razón social...)"
              value={donacionFiltros.donante}
              onChange={e => setDonacionFiltros((prev: any) => ({ ...prev, donante: e.target.value }))}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="date"
              size="sm"
              value={donacionFiltros.fecha || ''}
              onChange={e => setDonacionFiltros((prev: any) => ({ ...prev, fecha: e.target.value }))}
              title="Fecha de ingreso"
            />
          </Col>
          <Col md={3}>
            <Button 
              variant="outline-secondary" 
              size="sm"
              className="w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => setShowFiltros(!showFiltros)}
            >
              <span>Filtros</span>
              <span style={{ fontSize: '0.8rem' }}>{showFiltros ? '▲' : '▼'}</span>
            </Button>
          </Col>
        </Row>

        <Collapse in={showFiltros}>
          <div className="mt-3">
            <Row className="g-2 align-items-center">
              <Col md={2}>
                <Select
                  isClearable
                  components={{ Input: RegionComunaInput }}
                  placeholder="Región..."
                  options={REGIONES_CHILE.map(r => ({ value: r, label: r }))}
                  value={donacionFiltros.region ? { value: donacionFiltros.region, label: donacionFiltros.region } : null}
                  onChange={opt => setDonacionFiltros((prev: any) => ({ ...prev, region: opt?.value ?? '', comuna: '', centroAcopio: '' }))}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{ control: (base) => ({ ...base, fontSize: '0.875rem', minHeight: '31px' }), menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </Col>
              <Col md={2}>
                <Select
                  isClearable
                  components={{ Input: RegionComunaInput }}
                  placeholder="Comuna..."
                  isDisabled={!donacionFiltros.region}
                  options={donacionFiltros.region ? (COMUNAS_POR_REGION[donacionFiltros.region as keyof typeof COMUNAS_POR_REGION] ?? []).map(c => ({ value: c, label: c })) : []}
                  value={donacionFiltros.comuna ? { value: donacionFiltros.comuna, label: donacionFiltros.comuna } : null}
                  onChange={opt => setDonacionFiltros((prev: any) => ({ ...prev, comuna: opt?.value ?? '' }))}
                  noOptionsMessage={() => donacionFiltros.region ? 'No hay comunas' : 'Selecciona una región primero'}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{ control: (base) => ({ ...base, fontSize: '0.875rem', minHeight: '31px' }), menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </Col>
              <Col md={2}>
                <Select
                  isClearable
                  components={{ Input: RegionComunaInput }}
                  placeholder="Categoría..."
                  options={categoriaOptions}
                  value={donacionFiltros.categoria ? { value: donacionFiltros.categoria, label: donacionFiltros.categoria } : null}
                  onChange={opt => setDonacionFiltros((prev: any) => ({ ...prev, categoria: opt?.value ?? '', subcategoria: '' }))}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{ control: (base) => ({ ...base, fontSize: '0.875rem', minHeight: '31px' }), menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </Col>
              <Col md={2}>
                <Select
                  isClearable
                  components={{ Input: RegionComunaInput }}
                  placeholder="Subcategoría..."
                  isDisabled={!donacionFiltros.categoria}
                  noOptionsMessage={() => donacionFiltros.categoria ? 'No hay subcategorías' : 'Selecciona una categoría primero'}
                  options={subcategoriaOptions}
                  value={donacionFiltros.subcategoria ? { value: donacionFiltros.subcategoria, label: donacionFiltros.subcategoria } : null}
                  onChange={opt => setDonacionFiltros((prev: any) => ({ ...prev, subcategoria: opt?.value ?? '' }))}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                  styles={{ control: (base) => ({ ...base, fontSize: '0.875rem', minHeight: '31px' }), menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                />
              </Col>
              <Col md={2}>
                <Form.Select
                  size="sm"
                  value={donacionFiltros.centroAcopio}
                  onChange={e => setDonacionFiltros((prev: any) => ({ ...prev, centroAcopio: e.target.value }))}
                >
                  <option value="">
                    {donacionFiltros.region ? `Centros en ${donacionFiltros.region.split(' ')[0]}...` : 'Todos los Centros'}
                  </option>
                  {(donacionFiltros.region
                    ? centros.filter(c => c.region === donacionFiltros.region)
                    : centros
                  ).map(c => (
                    <option key={c.id} value={c.id.toString()}>{c.nombre} — {c.comuna}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  size="sm"
                  value={donacionFiltros.estado || ''}
                  onChange={e => setDonacionFiltros((prev: any) => ({ ...prev, estado: e.target.value }))}
                >
                  <option value="">Todos los Estados</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En progreso">En progreso</option>
                  <option value="En tránsito">En tránsito</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Recibido">Recibido</option>
                  <option value="Rechazado">Rechazado</option>
                </Form.Select>
              </Col>
            </Row>
          </div>
        </Collapse>
      </Card.Body>
    </Card>

    {loadingDonaciones ? (
      <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Cargando donaciones...</p></div>
    ) : (
      <Card className="border-0 shadow-sm d-flex flex-column" style={{ borderRadius: '16px', overflow: 'hidden', height: 'calc(100vh - 400px)' }}>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <Table hover responsive className="align-middle mb-0">
          <thead style={{ backgroundColor: '#f8f9ff' }}>
            <tr>
              <th className="py-3 px-4" style={{ color: '#6c63ff', fontWeight: 600 }}>ID</th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Cantidad de tipos de Recursos</th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Título</th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Ubicación</th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Tracking</th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Donante</th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Estado</th>
              <th className="py-3 pe-4" style={{ color: '#6c63ff', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDonaciones.map((d: DonacionResponse & { acopioRecepcion?: string }) => {
              let ubicacionText = d.origen || '—';
              if (d.comunaRetiro) {
                ubicacionText = d.regionRetiro ? `${d.comunaRetiro}, ${d.regionRetiro}` : d.comunaRetiro;
              }
              
              return (
              <tr key={d.id} style={{ transition: 'background 0.2s' }}>
                <td className="px-4 fw-semibold text-muted">#{d.id}</td>
                <td>
                  <Badge bg="primary" pill>
                    {(() => {
                      let totalTipos = 0;
                      try {
                        const recs = JSON.parse(d.recursos || '[]');
                        if (Array.isArray(recs)) totalTipos = recs.length;
                      } catch {}
                      return `${totalTipos} Tipos`;
                    })()}
                  </Badge>
                </td>
                <td style={{ color: '#333' }}>{d.nombreArticulo || 'Varias Donaciones'}</td>
                <td>
                  <small style={{ color: '#555', fontWeight: 500 }}>
                    {ubicacionText}
                  </small>
                </td>
                <td>
                  <code className="bg-light text-dark px-2 py-1 rounded" style={{ fontSize: '0.85rem' }}>{d.trackingId}</code>
                </td>
                <td>
                  <small style={{ color: '#444', fontWeight: 500 }}>{getDonanteNameFromMap(d.donanteId, usuariosMapDonacion)}</small>
                </td>
                <td>
                    <Badge 
                      bg={getEstadoBadgeColor(d.estado || '')} 
                      className="px-3 py-2" 
                      style={{ fontSize: '0.8rem', borderRadius: '20px' }}
                    >
                      {formatEstado(d.estado)}
                    </Badge>
                </td>
                <td className="pe-4">
                  <Button variant="outline-primary" size="sm" style={{ borderRadius: '8px' }} onClick={() => setDonacionDetalle(d)}>
                    🔍 Detalles
                  </Button>
                </td>
              </tr>
              );
            })}
            {totalElements === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-5">
                  <div style={{ fontSize: '3rem' }}>📭</div>
                  <p className="text-muted mt-2">No hay donaciones que coincidan con los filtros</p>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
        </div>

        {/* Pagination Controls */}
        {totalElements > 0 && (
          <div className="d-flex justify-content-between align-items-center p-3 border-top bg-white flex-shrink-0">
            <small className="text-muted">Mostrando {paginatedDonaciones.length} de {totalElements} registros</small>
            <div className="d-flex gap-2 align-items-center">
              <Form.Select size="sm" style={{ width: '80px', borderRadius: '10px' }} value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(0); }}>
                <option value="20">20</option>
                <option value="35">35</option>
                <option value="50">50</option>
              </Form.Select>
              <div className="d-flex gap-1 align-items-center">
                <Button size="sm" variant="outline-secondary" disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}>Anterior</Button>
                <span className="text-muted mx-2" style={{ fontSize: '0.85rem' }}>
                  Página <strong>{currentPage + 1}</strong> de <strong>{totalPages || 1}</strong>
                </span>
                <Button size="sm" variant="outline-primary" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)}>Siguiente</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    )}
  </div>
  );
};

