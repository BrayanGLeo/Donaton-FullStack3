import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Row, Col, InputGroup, Button, Collapse } from 'react-bootstrap';
import { Archive, Search, Filter, Calendar, User } from 'lucide-react';
import Select from 'react-select';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../../utils/chileData';
import { RegionComunaInput } from '../common/RegionComunaInput';
import { formatEstado } from '../../utils/adminDashboardUtils';
import type { Necesidad } from '../../services/bffService';

interface PanelHistorialNecesidadesProps {
  necesidades: Necesidad[];
  getNecesidadBgColor?: (estado?: string) => string;
  setNecesidadDetalle?: React.Dispatch<React.SetStateAction<Necesidad | null>>;
  usuarios?: { id: number | string; nombre: string; apellido?: string }[];
}

export const PanelHistorialNecesidades: React.FC<PanelHistorialNecesidadesProps> = ({ 
  necesidades,
  getNecesidadBgColor = () => '#fff',
  setNecesidadDetalle,
  usuarios = []
}) => {
  const [filtros, setFiltros] = useState({ id: '', estado: '', region: '', comuna: '', fecha: '', coordinador: '' });
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFiltros, setShowFiltros] = useState(false);

  useEffect(() => {
    setCurrentPage(0);
  }, [filtros]);

  const necesidadesFiltradas = necesidades.filter(n => {
    const matchId = filtros.id === '' || n.id.toString() === filtros.id;
    const matchEstado = filtros.estado === '' || formatEstado(n.estado) === filtros.estado;
    const matchRegion = filtros.region === '' || n.region === filtros.region;
    const matchComuna = filtros.comuna === '' || n.comuna === filtros.comuna;
    
    let matchFecha = true;
    if (filtros.fecha !== '') {
      const reqDate = n.fechaReporte ? n.fechaReporte.split('T')[0].split(' ')[0] : '';
      matchFecha = reqDate === filtros.fecha;
    }
    
    let matchCoordinador = true;
    if (filtros.coordinador !== '') {
      const coordName = getCoordinadorName(n.coordinadorId).toLowerCase();
      matchCoordinador = coordName.includes(filtros.coordinador.toLowerCase());
    }

    return matchId && matchEstado && matchRegion && matchComuna && matchFecha && matchCoordinador;
  });

  const totalElements = necesidadesFiltradas.length;
  const totalPages = Math.ceil(totalElements / itemsPerPage) || 1;
  const paginatedNecesidades = necesidadesFiltradas.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getCoordinadorName = (coordinadorId?: number) => {
    if (!coordinadorId) return 'N/A';
    const user: any = usuarios.find(u => Number(u.id) === coordinadorId);
    return user ? (user.nombreCompleto || user.razonSocial || user.nombre || `ID: ${coordinadorId}`) : `ID: ${coordinadorId}`;
  };

  const getBadgeColor = (estado?: string) => {
    const f = formatEstado(estado);
    if (f === 'Pendiente') return 'danger';
    if (f === 'En tránsito') return 'warning';
    if (f === 'Cubierta') return 'success';
    return 'secondary';
  };

  return (
    <div className="py-2">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
          <Archive size={28} className="text-success" />
        </div>
        <div>
          <h4 className="fw-bold mb-0">Historial de Necesidades</h4>
          <p className="text-muted mb-0">Registro general de todas las alertas y necesidades</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm d-flex flex-column" style={{ borderRadius: '16px', overflow: 'hidden', height: 'calc(100vh - 240px)' }}>
        <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold text-success">Total Registros ({totalElements})</h6>
        </div>
        
        <div className="p-3 bg-white border-bottom">
          <Row className="g-2">
            <Col md={3}>
              <InputGroup size="sm">
                <InputGroup.Text><Search size={14} /></InputGroup.Text>
                <Form.Control
                  placeholder="ID Alerta"
                  value={filtros.id}
                  onChange={(e) => setFiltros({ ...filtros, id: e.target.value })}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup size="sm">
                <InputGroup.Text><User size={14} /></InputGroup.Text>
                <Form.Control
                  placeholder="Nombre Coordinador"
                  value={filtros.coordinador}
                  onChange={(e) => setFiltros({ ...filtros, coordinador: e.target.value })}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <InputGroup size="sm">
                <InputGroup.Text><Calendar size={14} /></InputGroup.Text>
                <Form.Control
                  type="date"
                  value={filtros.fecha}
                  onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
                  title="Fecha de reporte"
                />
              </InputGroup>
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
              <Row className="g-2">
                <Col md={3}>
                  <InputGroup size="sm">
                    <InputGroup.Text><Filter size={14} /></InputGroup.Text>
                    <Form.Select
                      value={filtros.estado}
                      onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    >
                      <option value="">Todos los Estados</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="En progreso">En progreso</option>
                      <option value="En tránsito">En tránsito</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cubierta">Cubierta</option>
                      <option value="Rechazado">Rechazado</option>
                      <option value="Cerrado">Cerrado</option>
                    </Form.Select>
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Select
                    isClearable
                    components={{ Input: RegionComunaInput }}
                    placeholder="Región..."
                    options={REGIONES_CHILE.map(r => ({ value: r, label: r }))}
                    value={filtros.region ? { value: filtros.region, label: filtros.region } : null}
                    onChange={opt => setFiltros(prev => ({ ...prev, region: opt?.value ?? '', comuna: '' }))}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{ control: (base) => ({ ...base, fontSize: '0.875rem', minHeight: '31px' }), menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                </Col>
                <Col md={3}>
                  <Select
                    isClearable
                    components={{ Input: RegionComunaInput }}
                    placeholder="Comuna..."
                    isDisabled={!filtros.region}
                    options={filtros.region ? (COMUNAS_POR_REGION[filtros.region] ?? []).map(c => ({ value: c, label: c })) : []}
                    value={filtros.comuna ? { value: filtros.comuna, label: filtros.comuna } : null}
                    onChange={opt => setFiltros(prev => ({ ...prev, comuna: opt?.value ?? '' }))}
                    noOptionsMessage={() => filtros.region ? 'No hay comunas' : 'Selecciona una región primero'}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                    styles={{ control: (base) => ({ ...base, fontSize: '0.875rem', minHeight: '31px' }), menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                </Col>
                {(filtros.id || filtros.estado || filtros.region || filtros.comuna || filtros.fecha || filtros.coordinador) && (
                  <Col md={3} className="d-flex align-items-center justify-content-end">
                    <Button variant="link" className="text-danger p-0" style={{ textDecoration: 'none' }} onClick={() => setFiltros({ id: '', estado: '', region: '', comuna: '', fecha: '', coordinador: '' })}>
                      Limpiar Filtros
                    </Button>
                  </Col>
                )}
              </Row>
            </div>
          </Collapse>
        </div>
        
        {necesidadesFiltradas.length === 0 ? (
          <div className="text-center py-5">
            <Archive size={48} className="text-muted opacity-25 mb-3" />
            <p className="text-muted mb-0">No hay necesidades registradas todavía.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive" style={{ overflowY: 'auto', flex: 1 }}>
              <Table hover className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="py-3 px-4">Alerta (ID)</th>
                    <th className="py-3">Fecha Reporte</th>
                    <th className="py-3">Coordinador</th>
                    <th className="py-3">Tipo de Emergencia</th>
                    <th className="py-3">Cantidad de tipos de Recursos</th>
                    <th className="py-3">Ubicación</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
              </thead>
              <tbody>
                {paginatedNecesidades.map(item => (
                  <tr key={item.id} style={{ backgroundColor: getNecesidadBgColor(item.estado) }}>
                    <td className="px-4 fw-semibold text-danger">Necesidad #{item.id}</td>
                    <td className="text-muted">{formatDate(item.fechaReporte)}</td>
                    <td className="text-muted">{getCoordinadorName(item.coordinadorId)}</td>
                    <td>
                      <div className="fw-bold text-dark">{item.tipoEmergencia || 'Alerta General'}</div>
                    </td>
                    <td>
                      <Badge bg="primary" pill>
                        {(() => {
                          let totalTipos = 0;
                          try {
                            const recs = JSON.parse(item.recursos || '[]');
                            if (Array.isArray(recs)) totalTipos = recs.length;
                          } catch {}
                          return `${totalTipos} Tipos`;
                        })()}
                      </Badge>
                    </td>
                    <td className="text-muted">
                      {item.comuna}, {item.region}
                    </td>
                    <td className="px-4 text-center">
                      <Badge 
                        bg={getBadgeColor(item.estado)} 
                        className="px-3 py-2" 
                        style={{ borderRadius: '20px' }}
                      >
                        {formatEstado(item.estado)}
                      </Badge>
                    </td>
                    <td className="px-4 text-center">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        style={{ borderRadius: '8px' }} 
                        onClick={() => setNecesidadDetalle?.(item)}
                      >
                        🔍 Detalles
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </div>
            
            {/* Pagination Controls */}
            {totalElements > 0 && (
              <div className="d-flex justify-content-between align-items-center p-3 border-top bg-white flex-shrink-0">
                <small className="text-muted">Mostrando {paginatedNecesidades.length} de {totalElements} registros</small>
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
          </>
        )}
      </Card>
    </div>
  );
};


