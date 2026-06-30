import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Nav, Modal, Form, Pagination, Collapse } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Select from 'react-select';
import { Package, CheckCircle, Navigation, Archive, Info, MapPin, Map as MapIcon, Filter, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { listarDonaciones, asignarConductor, actualizarEstadoDonacion, type DonacionResponse } from '../../services/donacionService';
import { obtenerNecesidades, actualizarEstadoNecesidad, type Necesidad } from '../../services/bffService';
import { obtenerUsuarios } from '../../services/usuarioService';
import { obtenerCentrosAcopio, type CentroAcopio } from '../../services/logisticaService';
import { AcopioOverview } from './AcopioOverview';
import { RecursosDetalleTable } from '../common/RecursosDetalleTable';
import { RegionComunaInput } from '../common/RegionComunaInput';
import './PanelAdminAcopio.css';
import { flattenResourceUnit } from '../../utils/unidadesLogic';
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

const getComunaOptions = (items: any[]) => {
  const set = new Set<string>();
  items.forEach(p => { const c = p.comunaRetiro || p.comuna; if (c) set.add(c); });
  return Array.from(set).sort((a, b) => a.localeCompare(b)).map(c => ({ value: c, label: c }));
};

const getEstadoOptions = (items: any[]) => {
  const set = new Set<string>();
  items.forEach(p => { if (p.estado) set.add(p.estado.toUpperCase()); });
  return Array.from(set).sort((a, b) => a.localeCompare(b)).map(c => ({ value: c, label: c }));
};

const getCategoriaOptions = (items: any[]) => {
  const set = new Set<string>();
  items.forEach(p => {
    try {
      const recs = typeof p.recursos === 'string' ? JSON.parse(p.recursos) : p.recursos;
      const recsArray = Array.isArray(recs) ? recs : JSON.parse(recs);
      if (Array.isArray(recsArray)) recsArray.forEach((r: any) => { if (r?.categoria) set.add(r.categoria); });
    } catch { }
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b)).map(c => ({ value: c, label: c }));
};

const getSubcategoriaOptions = (items: any[], categoriaFiltro: string) => {
  if (!categoriaFiltro) return [];
  const set = new Set<string>();
  items.forEach(p => {
    try {
      const recs = typeof p.recursos === 'string' ? JSON.parse(p.recursos) : p.recursos;
      const recsArray = Array.isArray(recs) ? recs : JSON.parse(recs);
      if (Array.isArray(recsArray)) recsArray.forEach((r: any) => {
        if (categoriaFiltro && r?.categoria !== categoriaFiltro) return;
        const sub = r?.subcategoria || r?.subCategoria;
        if (sub) set.add(sub);
      });
    } catch { }
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b)).map(c => ({ value: c, label: c }));
};

const matchRecursos = (recursos: any, catFilter: string, subcatFilter: string) => {
  let hasCat = !catFilter;
  let hasSubcat = !subcatFilter;

  try {
    const recs = typeof recursos === 'string' ? JSON.parse(recursos) : recursos;
    const recsArray = Array.isArray(recs) ? recs : JSON.parse(recs);
    if (Array.isArray(recsArray)) {
      recsArray.forEach((r: any) => {
        if (catFilter && r?.categoria?.toLowerCase().includes(catFilter.toLowerCase())) hasCat = true;
        if (subcatFilter && (r?.subcategoria?.toLowerCase().includes(subcatFilter.toLowerCase()) || r?.subCategoria?.toLowerCase().includes(subcatFilter.toLowerCase()))) hasSubcat = true;
      });
    }
  } catch { }
  return hasCat && hasSubcat;
};

const filterItems = (items: any[], filters: any, isDonacion: boolean) => {
  return items.filter(item => {
    if (filters.id && !item.id?.toString().includes(filters.id)) return false;
    const com = isDonacion ? (item.comunaRetiro || item.comuna || '') : (item.comuna || '');
    if (filters.comuna && !com.toLowerCase().includes(filters.comuna.toLowerCase())) return false;
    if (filters.estado && item.estado?.toUpperCase() !== filters.estado) return false;

    if (filters.categoria || filters.subcategoria) {
      if (!matchRecursos(item.recursos, filters.categoria, filters.subcategoria)) return false;
    }
    return true;
  });
};

const atributosClave = ['genero', 'talla', 'tamano', 'etapa', 'restriccionDietetica', 'dimensiones', 'litros', 'formatoQueso', 'formatoSupermercado', 'tipoLeche', 'tipoYogur', 'capacidadBandeja', 'pesoQueso'];
const labelsAtributos: Record<string, string> = {
  genero: 'Género', talla: 'Talla', tamano: 'Tamaño', etapa: 'Etapa', restriccionDietetica: 'Restricción',
  dimensiones: 'Medidas', litros: 'Capacidad', formatoQueso: 'Formato', formatoSupermercado: 'Formato',
  tipoLeche: 'Leche', tipoYogur: 'Yogur', capacidadBandeja: 'Bandeja', pesoQueso: 'Peso'
};

const calcularInventarioLista = (donacionesRecibidas: any[]) => {
  const inventarioMap = new Map<string, number>();
  donacionesRecibidas.forEach(d => {
    try {
      const recs = JSON.parse(d.recursos || '[]');
      if (Array.isArray(recs)) {
        recs.forEach((r: any) => {
          const { finalCantidad, finalUnidad } = flattenResourceUnit(r, r.cantidad || 1);
          const detalles = atributosClave.filter(k => r[k]).map(k => `${labelsAtributos[k]}: ${r[k]}`).join(';');
          const key = `${r.categoria || 'Otros'}|${r.subCategoria || r.subcategoria || 'General'}|${finalUnidad || 'Unidades'}|${detalles}`;
          inventarioMap.set(key, (inventarioMap.get(key) || 0) + finalCantidad);
        });
      }
    } catch { }
  });
  return Array.from(inventarioMap.entries()).map(([key, cant]) => {
    const [cat, subcat, uni, det] = key.split('|');
    return { categoria: cat, subcategoria: subcat, unidadMedida: uni, cantidad: cant, detalles: det };
  });
};

// Helpers to reduce cognitive complexity of PanelAdminAcopio
const renderDonacionCantidadText = (don: any) => {
  try {
    const recs = JSON.parse(don.recursos || '[]');
    if (Array.isArray(recs) && recs.length > 0) {
      const unitMap: Record<string, number> = {};
      recs.forEach((r: any) => {
        const { finalCantidad, finalUnidad } = flattenResourceUnit(r, r.cantidad || 0);
        unitMap[finalUnidad] = (unitMap[finalUnidad] || 0) + finalCantidad;
      });
      return (
        <div className="d-flex flex-column gap-1">
          {Object.entries(unitMap).map(([uni, cant]) => (
            <div key={uni} style={{ lineHeight: '1.2' }}>
              <span className="fw-bold">{cant}</span> <small className="text-muted">{uni}</small>
            </div>
          ))}
        </div>
      );
    }
  } catch { }
  return <><span className="fw-bold">0</span> <small className="text-muted">items</small></>;
};

const renderDonacionNombreText = (don: any) => {
  try {
    const recs = JSON.parse(don.recursos || '[]');
    if (Array.isArray(recs) && recs.length === 1 && recs[0].nombreArticulo) {
      return recs[0].nombreArticulo;
    }
  } catch { }
  return don.nombreArticulo || 'Varias Donaciones';
};

const renderDonacionCategoriaText = (don: any) => {
  try {
    const recs = JSON.parse(don.recursos || '[]');
    if (Array.isArray(recs) && recs.length === 1) {
      return (
        <div className="d-flex flex-column">
          <span>{recs[0].categoria || 'Sin categoría'}</span>
          {(recs[0].subCategoria || recs[0].subcategoria) && (
            <small className="text-muted">{recs[0].subCategoria || recs[0].subcategoria}</small>
          )}
        </div>
      );
    }
    if (Array.isArray(recs) && recs.length > 1) {
      const cats = Array.from(new Set(recs.map((r: any) => r.categoria).filter(Boolean)));
      if (cats.length === 1) {
        const subcats = Array.from(new Set(recs.map((r: any) => r.subCategoria || r.subcategoria).filter(Boolean)));
        return (
          <div className="d-flex flex-column">
            <span>{cats[0]}</span>
            {subcats.length > 0 && <small className="text-muted">{subcats.join(', ')}</small>}
          </div>
        );
      }
    }
  } catch { }
  return <span>Varias</span>;
};

const renderDonacionRecibidaCategoriaText = (don: any) => {
  try {
    const recs = JSON.parse(don.recursos || '[]');
    if (Array.isArray(recs) && recs.length === 1) {
      return (
        <div className="d-flex flex-column">
          <span className="fw-semibold text-dark">{recs[0].categoria || 'Sin categoría'}</span>
          {(recs[0].subCategoria || recs[0].subcategoria) && (
            <small className="text-muted">{recs[0].subCategoria || recs[0].subcategoria}</small>
          )}
        </div>
      );
    }
    if (Array.isArray(recs) && recs.length > 1) {
      const cats = Array.from(new Set(recs.map((r: any) => r.categoria).filter(Boolean)));
      if (cats.length === 1) {
        const subcats = Array.from(new Set(recs.map((r: any) => r.subCategoria || r.subcategoria).filter(Boolean)));
        return (
          <div className="d-flex flex-column">
            <span className="fw-semibold text-dark">{cats[0]}</span>
            {subcats.length > 0 && <small className="text-muted">{subcats.join(', ')}</small>}
          </div>
        );
      }
    }
  } catch { }
  return <span className="fw-semibold text-dark">Varias Categorías</span>;
};

const renderDonacionRecibidaCantidadText = (don: any) => {
  try {
    const recs = JSON.parse(don.recursos || '[]');
    if (Array.isArray(recs) && recs.length > 0) {
      const unitMap: Record<string, number> = {};
      recs.forEach((r: any) => {
        const { finalCantidad, finalUnidad } = flattenResourceUnit(r, r.cantidad || 0);
        unitMap[finalUnidad] = (unitMap[finalUnidad] || 0) + finalCantidad;
      });
      return (
        <div className="d-flex flex-column gap-1">
          {Object.entries(unitMap).map(([uni, cant]) => (
            <div key={uni} style={{ lineHeight: '1.2' }}>
              <span className="fw-bold text-dark">{cant}</span> <small>{uni}</small>
            </div>
          ))}
        </div>
      );
    }
  } catch { }
  return <><span className="fw-bold text-dark">0</span> <small>items</small></>;
};

const getNecesidadResourceInfo = (nec: any) => {
  let recInfo: any = null;
  try {
    if (nec.recursos) {
      const parsed = JSON.parse(nec.recursos);
      if (Array.isArray(parsed) && parsed.length > 0) recInfo = parsed[0];
    }
  } catch (e) {
    console.error('Error al parsear recursos:', e);
  }
  let finalCant: any = '-';
  let finalUni: any = '';
  if (recInfo) {
    const { finalCantidad, finalUnidad } = flattenResourceUnit(recInfo, recInfo.cantidad || 0);
    finalCant = finalCantidad;
    finalUni = finalUnidad;
  }
  return { recInfo, finalCant, finalUni };
};

const chequearInventarioHelper = (necesidad: Necesidad, inventarioLista: any[]) => {
  const recursos = parseRecursos(necesidad.recursos);
  let suficientes = true;
  const detalles = recursos.map(rec => {
    const { finalCantidad, finalUnidad } = flattenResourceUnit(rec, rec.cantidad || 1);
    const reqDetalles = atributosClave.filter(k => rec[k]).map(k => `${labelsAtributos[k]}: ${rec[k]}`).join(';');
    const inv = inventarioLista.find(i => 
      i.categoria === rec.categoria && 
      i.subcategoria === (rec.subcategoria || rec.subCategoria) && 
      i.unidadMedida === finalUnidad &&
      (i.detalles || '') === reqDetalles
    );
    const cantInv = inv ? inv.cantidad : 0;
    if (cantInv < finalCantidad) suficientes = false;
    return {
      ...rec,
      cantidad: finalCantidad,
      unidad: finalUnidad,
      disponible: cantInv,
      alcanza: cantInv >= finalCantidad,
      detallesStr: reqDetalles
    };
  });
  return { suficientes, detalles };
};

const PaginationControl = ({ totalItems, startIndex, endIndex, itemsPerPage, setItemsPerPage, page, setPage }: any) => {
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
          <Pagination.Prev disabled={page === 1} onClick={() => setPage((p: number) => p - 1)} />
          <Pagination.Next disabled={page === Math.ceil(totalItems / itemsPerPage) || totalItems === 0} onClick={() => setPage((p: number) => p + 1)} />
        </Pagination>
      </div>
    </div>
  );
};

const DonacionPendienteRow = ({ don, conductores, setDonacionAConfirmar, setConductorAConfirmar, setShowConfirmAsignar, setDonacionDetalle, setShowDetallesDonacion, centrarMapa, handleRecibirDonacion }: any) => {
  const isRechazada = don.estado?.toUpperCase() === 'RECHAZADA_CONDUCTOR';
  const isAssigned = !isRechazada && (don.conductorId || ['EN_TRANSITO', 'DESPACHADO', 'ASIGNADO', 'EN TRÁNSITO'].includes(don.estado?.toUpperCase() || ''));
  const canReceive = ['EN_TRANSITO', 'DESPACHADO', 'EN TRÁNSITO'].includes(don.estado?.toUpperCase() || '');

  return (
    <tr>
      <td><span className="fw-bold text-primary">#{don.id}</span></td>
      <td>{renderDonacionCantidadText(don)}</td>
      <td>{renderDonacionNombreText(don)}</td>
      <td>{renderDonacionCategoriaText(don)}</td>
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
          value={isRechazada ? null : (conductores.find((c: any) => c.value === don.conductorId) || null)}
          isDisabled={!!isAssigned}
          onChange={(v: any) => {
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
          <small className="text-success d-block mt-1 fw-bold" style={{ fontSize: '11px' }}>Solicitud de asignación enviada</small>
        )}
        {isRechazada && (
          <small className="text-danger d-block mt-1 fw-bold" style={{ fontSize: '11px' }}>¡Rechazado! Reasignar</small>
        )}
        {canReceive && (
          <small className="text-info d-block mt-1" style={{ fontSize: '11px' }}>En camino</small>
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
};

const NecesidadActivaRow = ({ nec, centrarMapa, setNecesidadSeleccionada, setShowNecesidadModal, setNecesidadDetalle, setShowDetallesNecesidad }: any) => {
  const { finalCant, finalUni } = getNecesidadResourceInfo(nec);
  return (
    <tr>
      <td><span className="fw-bold text-danger">#{nec.id}</span></td>
      <td><span className="fw-bold">{nec.tipoEmergencia || 'Alerta General'}</span></td>
      <td>{renderDonacionCategoriaText(nec)}</td>
      <td><span className="fw-bold">{finalCant}</span> <small className="text-muted">{finalUni}</small></td>
      <td><span className="text-muted">{nec.comuna}</span></td>
      <td>
        <Badge bg={getBadgeColor(nec.estado || 'PENDIENTE')} className="soft-badge text-white">
          {nec.estado?.replace('_', ' ') || 'PENDIENTE'}
        </Badge>
      </td>
      <td>
        <div className="d-flex gap-1">
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => { setNecesidadDetalle(nec); setShowDetallesNecesidad(true); }}
            title="Ver Detalles"
            className="d-flex align-items-center"
          >
            <Info size={14} />
          </Button>
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
};

const GenericFilterBar = ({ filters, setFilters, comunaOptions, estadoOptions, categoriaOptions, subcategoriaOptions }: any) => {
  const hasF = Boolean(filters.id || filters.comuna || filters.categoria || filters.subcategoria || filters.estado);
  return (
    <Row className="g-2 align-items-center">
      <Col lg={2} md={4} xs={6}>
        <Form.Control size="sm" placeholder="ID..." value={filters.id} onChange={e => setFilters((prev: any) => ({ ...prev, id: e.target.value }))} style={{ height: '38px' }} />
      </Col>
      <Col lg={2} md={4} xs={6}>
        <Select
          options={comunaOptions}
          placeholder="Comuna..."
          isClearable
          components={{ Input: RegionComunaInput }}
          value={filters.comuna ? { value: filters.comuna, label: filters.comuna } : null}
          onChange={(opt: any) => setFilters((prev: any) => ({ ...prev, comuna: opt?.value || '' }))}
          noOptionsMessage={() => "Sin comunas"}
        />
      </Col>
      <Col lg={2} md={4} xs={6}>
        <Select
          options={estadoOptions}
          placeholder="Estado..."
          isClearable
          value={filters.estado ? { value: filters.estado, label: filters.estado } : null}
          onChange={(opt: any) => setFilters((prev: any) => ({ ...prev, estado: opt?.value || '' }))}
          noOptionsMessage={() => "Sin estados"}
        />
      </Col>
      <Col lg={2} md={4} xs={6}>
        <Select
          options={categoriaOptions}
          placeholder="Categoría..."
          isClearable
          components={{ Input: RegionComunaInput }}
          value={filters.categoria ? { value: filters.categoria, label: filters.categoria } : null}
          onChange={(opt: any) => setFilters((prev: any) => ({ ...prev, categoria: opt?.value || '', subcategoria: '' }))}
          noOptionsMessage={() => "Sin categorías"}
        />
      </Col>
      <Col lg={2} md={4} xs={6}>
        <Select
          options={subcategoriaOptions}
          placeholder="Subcategoría..."
          isClearable
          isDisabled={!filters.categoria}
          components={{ Input: RegionComunaInput }}
          value={filters.subcategoria ? { value: filters.subcategoria, label: filters.subcategoria } : null}
          onChange={(opt: any) => setFilters((prev: any) => ({ ...prev, subcategoria: opt?.value || '' }))}
          noOptionsMessage={() => filters.categoria ? "Sin subcategorías" : "Seleccione una categoría primero"}
        />
      </Col>
      {hasF && (
        <Col lg={2} md={4} xs={6} className="text-end">
          <Button variant="link" size="sm" className="text-danger p-0 text-decoration-none" onClick={() => setFilters({ id: '', comuna: '', categoria: '', subcategoria: '', estado: '' })}>
            <X size={14} className="me-1" /> Limpiar Filtros
          </Button>
        </Col>
      )}
    </Row>
  );
};

const InventarioFilterBar = ({ filters, setFilters, categoriaOptions, subcategoriaOptions }: any) => {
  const hasF = Boolean(filters.categoria || filters.subcategoria);
  return (
    <Row className="g-2 align-items-center">
      <Col lg={4} md={4} xs={12}>
        <Select
          options={categoriaOptions}
          placeholder="Categoría..."
          isClearable
          components={{ Input: RegionComunaInput }}
          value={filters.categoria ? { value: filters.categoria, label: filters.categoria } : null}
          onChange={(opt: any) => setFilters((prev: any) => ({ ...prev, categoria: opt?.value || '', subcategoria: '' }))}
          noOptionsMessage={() => "Sin categorías"}
        />
      </Col>
      <Col lg={4} md={4} xs={12}>
        <Select
          options={subcategoriaOptions}
          placeholder="Subcategoría..."
          isClearable
          isDisabled={!filters.categoria}
          components={{ Input: RegionComunaInput }}
          value={filters.subcategoria ? { value: filters.subcategoria, label: filters.subcategoria } : null}
          onChange={(opt: any) => setFilters((prev: any) => ({ ...prev, subcategoria: opt?.value || '' }))}
          noOptionsMessage={() => filters.categoria ? "Sin subcategorías" : "Seleccione una categoría primero"}
        />
      </Col>
      {hasF && (
        <Col lg={4} md={4} xs={12} className="text-end">
          <Button variant="link" size="sm" className="text-danger p-0 text-decoration-none" onClick={() => setFilters({ categoria: '', subcategoria: '' })}>
            <X size={14} className="me-1" /> Limpiar Filtros
          </Button>
        </Col>
      )}
    </Row>
  );
};

const DonacionRecibidaRow = ({ don, getBadgeColor, setDonacionDetalle, setShowDetallesDonacion }: any) => (
  <tr>
    <td><span className="fw-bold text-primary">#{don.id}</span></td>
    <td>{renderDonacionRecibidaCategoriaText(don)}</td>
    <td className="text-muted">{renderDonacionRecibidaCantidadText(don)}</td>
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
);

const NecesidadCubiertaRow = ({ nec }: any) => {
  const { recInfo, finalCant, finalUni } = getNecesidadResourceInfo(nec);
  return (
    <tr>
      <td><span className="fw-bold text-primary">#{nec.id}</span></td>
      <td className="fw-semibold text-dark">{nec.tipoEmergencia || 'General'}</td>
      <td className="text-muted">{recInfo?.categoria || 'No especificado'}</td>
      <td><span className="fw-bold">{finalCant}</span> <small className="text-muted">{finalUni}</small></td>
      <td className="text-muted">{nec.comuna}</td>
      <td>
        <Badge bg="success" className="soft-badge bg-opacity-10 text-success border border-success">
          <CheckCircle size={12} className="me-1" /> {nec.estado?.replace('_', ' ') || 'Cubierta'}
        </Badge>
      </td>
    </tr>
  );
};

const InventarioRow = ({ inv }: any) => {
  const extras = inv.detalles ? inv.detalles.split(';').filter(Boolean) : [];
  return (
    <tr>
      <td className="fw-semibold text-dark">
        <Package size={16} className="me-2 text-muted" />
        <span className="d-block">{inv.subcategoria}</span>
        <small className="text-muted fw-normal">{inv.categoria}</small>
        {extras.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mt-1">
            {extras.map((extra: string) => (
              <span key={extra} className="badge bg-light text-primary border border-primary-subtle" style={{ fontSize: '0.7rem' }}>
                {extra}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="text-muted fw-bold">{inv.cantidad}</td>
      <td className="text-muted">{inv.unidadMedida}</td>
      <td>
        <Badge bg="success" className="soft-badge bg-opacity-10 text-success border border-success">
          <CheckCircle size={12} className="me-1" /> En Stock
        </Badge>
      </td>
    </tr>
  );
};

const PanelAdminAcopio: React.FC = () => {
  const { usuario } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.4489, -70.6693]);

  const [miCentro, setMiCentro] = useState<CentroAcopio | null>(null);
  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [conductores, setConductores] = useState<{ value: number; label: string }[]>([]);

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [listFilters, setListFilters] = useState({ id: '', comuna: '', categoria: '', subcategoria: '', estado: '' });
  const [showFilters, setShowFilters] = useState(false);

  const [historialFilters, setHistorialFilters] = useState({ id: '', comuna: '', categoria: '', subcategoria: '', estado: '' });
  const [showHistorialFilters, setShowHistorialFilters] = useState(false);

  const [inventarioFilters, setInventarioFilters] = useState({ categoria: '', subcategoria: '' });
  const [showInventarioFilters, setShowInventarioFilters] = useState(false);

  const [necesidadesFilters, setNecesidadesFilters] = useState({ id: '', comuna: '', categoria: '', subcategoria: '', estado: '' });
  const [showNecesidadesFilters, setShowNecesidadesFilters] = useState(false);

  const [historialNecesidadesFilters, setHistorialNecesidadesFilters] = useState({ id: '', comuna: '', categoria: '', subcategoria: '', estado: '' });
  const [showHistorialNecesidadesFilters, setShowHistorialNecesidadesFilters] = useState(false);

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

  const [showDetallesNecesidad, setShowDetallesNecesidad] = useState(false);
  const [necesidadDetalle, setNecesidadDetalle] = useState<Necesidad | null>(null);

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

  const donacionesRecibidasFiltradas = React.useMemo(() =>
    filterItems(donacionesRecibidas, historialFilters, true),
    [donacionesRecibidas, historialFilters]);

  const historialComunaOptions = React.useMemo(() => getComunaOptions(donacionesRecibidas), [donacionesRecibidas]);
  const historialCategoriaOptions = React.useMemo(() => getCategoriaOptions(donacionesRecibidas), [donacionesRecibidas]);
  const historialSubcategoriaOptions = React.useMemo(() => getSubcategoriaOptions(donacionesRecibidas, historialFilters.categoria), [donacionesRecibidas, historialFilters.categoria]);
  const historialEstadoOptions = React.useMemo(() => getEstadoOptions(donacionesRecibidas), [donacionesRecibidas]);

  const donacionesFiltradas = React.useMemo(() =>
    filterItems(donacionesPendientes, listFilters, true),
    [donacionesPendientes, listFilters]);

  const comunaOptions = React.useMemo(() => getComunaOptions(donacionesPendientes), [donacionesPendientes]);
  const categoriaOptions = React.useMemo(() => getCategoriaOptions(donacionesPendientes), [donacionesPendientes]);
  const subcategoriaOptions = React.useMemo(() => getSubcategoriaOptions(donacionesPendientes, listFilters.categoria), [donacionesPendientes, listFilters.categoria]);
  const estadoOptions = React.useMemo(() => getEstadoOptions(donacionesPendientes), [donacionesPendientes]);

  const misNecesidades = necesidades.filter(n => n.region === regionUser);
  const necesidadesActivas = misNecesidades.filter(n => {
    const e = n.estado?.toUpperCase() || '';
    return ['ACTIVA', 'PENDIENTE', 'EN_PROCESO', 'ASIGNADO', 'EN_TRANSITO', 'EN TRÁNSITO'].includes(e);
  });

  const necesidadesActivasFiltradas = React.useMemo(() =>
    filterItems(necesidadesActivas, necesidadesFilters, false),
    [necesidadesActivas, necesidadesFilters]);

  const necComunaOptions = React.useMemo(() => getComunaOptions(necesidadesActivas), [necesidadesActivas]);
  const necEstadoOptions = React.useMemo(() => getEstadoOptions(necesidadesActivas), [necesidadesActivas]);
  const necCategoriaOptions = React.useMemo(() => getCategoriaOptions(necesidadesActivas), [necesidadesActivas]);
  const necSubcategoriaOptions = React.useMemo(() => getSubcategoriaOptions(necesidadesActivas, necesidadesFilters.categoria), [necesidadesActivas, necesidadesFilters.categoria]);

  const necesidadesCubiertas = misNecesidades.filter(n => ['CUBIERTA', 'ENTREGADO'].includes(n.estado?.toUpperCase() || ''));

  const necesidadesCubiertasFiltradas = React.useMemo(() =>
    filterItems(necesidadesCubiertas, historialNecesidadesFilters, false),
    [necesidadesCubiertas, historialNecesidadesFilters]);

  const necHistorialComunaOptions = React.useMemo(() => getComunaOptions(necesidadesCubiertas), [necesidadesCubiertas]);
  const necHistorialEstadoOptions = React.useMemo(() => getEstadoOptions(necesidadesCubiertas), [necesidadesCubiertas]);
  const necHistorialCategoriaOptions = React.useMemo(() => getCategoriaOptions(necesidadesCubiertas), [necesidadesCubiertas]);
  const necHistorialSubcategoriaOptions = React.useMemo(() => getSubcategoriaOptions(necesidadesCubiertas, historialNecesidadesFilters.categoria), [necesidadesCubiertas, historialNecesidadesFilters.categoria]);

  const inventarioLista = React.useMemo(() =>
    calcularInventarioLista(donacionesRecibidas),
    [donacionesRecibidas]);

  const inventarioFiltrado = React.useMemo(() => {
    return inventarioLista.filter(inv => {
      if (inventarioFilters.categoria && !inv.categoria?.toLowerCase().includes(inventarioFilters.categoria.toLowerCase())) return false;
      if (inventarioFilters.subcategoria && !inv.subcategoria?.toLowerCase().includes(inventarioFilters.subcategoria.toLowerCase())) return false;
      return true;
    });
  }, [inventarioLista, inventarioFilters]);

  const inventarioCategoriaOptions = React.useMemo(() => {
    const set = new Set<string>();
    inventarioLista.forEach(i => { if (i.categoria) set.add(i.categoria); });
    return Array.from(set).sort((a, b) => a.localeCompare(b)).map(c => ({ value: c, label: c }));
  }, [inventarioLista]);

  const inventarioSubcategoriaOptions = React.useMemo(() => {
    if (!inventarioFilters.categoria) return [];
    const set = new Set<string>();
    inventarioLista.forEach(i => {
      if (inventarioFilters.categoria && i.categoria !== inventarioFilters.categoria) return;
      if (i.subcategoria) set.add(i.subcategoria);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b)).map(c => ({ value: c, label: c }));
  }, [inventarioLista, inventarioFilters.categoria]);

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = page * itemsPerPage;

  const paginatedDonacionesPendientes = donacionesFiltradas.slice(startIndex, endIndex);
  const paginatedDonacionesRecibidas = donacionesRecibidasFiltradas.slice(startIndex, endIndex);
  const paginatedInventario = inventarioFiltrado.slice(startIndex, endIndex);
  const paginatedNecesidadesActivas = necesidadesActivasFiltradas.slice(startIndex, endIndex);
  const paginatedNecesidadesCubiertas = necesidadesCubiertasFiltradas.slice(startIndex, endIndex);

  const invCheck = necesidadSeleccionada ? chequearInventarioHelper(necesidadSeleccionada, inventarioLista) : { suficientes: false, detalles: [] };

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
      toast.success('Conductor asignado con éxito');
    } catch (error) {
      console.error(error);
      toast.error('Error al asignar conductor.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecibirDonacion = async (donacionId: number) => {
    try {
      await actualizarEstadoDonacion(donacionId, 'RECIBIDO');
      fetchData();
      toast.success('Donación recibida en bodega');
    } catch (error) {
      console.error(error);
      toast.error('Error al recibir donación.');
    }
  };

  const handleCubrirNecesidad = async () => {
    if (!necesidadSeleccionada || !conductorSeleccionadoNec) return;
    setActionLoading(necesidadSeleccionada.id);
    try {
      const estadoNuevo = 'ASIGNADO';
      await actualizarEstadoNecesidad(necesidadSeleccionada.id, estadoNuevo, miCentro?.id, conductorSeleccionadoNec);
      setShowNecesidadModal(false);
      setConductorSeleccionadoNec(null);
      fetchData();
      toast.success('Necesidad asignada con éxito');
    } catch (error) {
      console.error(error);
      toast.error('Error al cubrir necesidad.');
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
                <Nav.Link active={activeTab === 'resumen'} onClick={() => setActiveTab('resumen')}>
                  Resumen
                </Nav.Link>
              </Nav.Item>
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

            {activeTab === 'resumen' && (
              <AcopioOverview
                donaciones={misDonaciones}
                necesidades={misNecesidades}
                capacidadMax={(miCentro as any)?.capacidadMaxima || 10000}
              />
            )}

            {/* PESTAÑA 1: DONACIONES (PENDIENTES Y EN TRÁNSITO) */}
            {activeTab === 'donaciones' && (
              <Row>
                <Col lg={7} className="mb-4 mb-lg-0">
                  <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                    <h5 className="mb-0 fw-bold">Gestión de Retiros y Recepciones</h5>
                    <Button variant="outline-primary" size="sm" onClick={() => setShowFilters(!showFilters)} style={{ borderRadius: '8px' }}>
                      <Filter size={14} className="me-1" />
                      Filtros
                    </Button>
                  </div>

                  <Collapse in={showFilters}>
                    <div className="bg-light p-3 border rounded-4 mb-3">
                      <GenericFilterBar
                        filters={listFilters}
                        setFilters={setListFilters}
                        comunaOptions={comunaOptions}
                        estadoOptions={estadoOptions}
                        categoriaOptions={categoriaOptions}
                        subcategoriaOptions={subcategoriaOptions}
                      />
                    </div>
                  </Collapse>

                  {donacionesFiltradas.length === 0 ? (
                    <div className="text-center p-5 bg-light rounded-4 border">
                      <Package size={48} className="text-muted mb-3 opacity-50" />
                      <h6 className="text-muted">No se encontraron donaciones con los filtros actuales.</h6>
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
                            {paginatedDonacionesPendientes.map(don => (
                              <DonacionPendienteRow
                                key={don.id}
                                don={don}
                                conductores={conductores}
                                setDonacionAConfirmar={setDonacionAConfirmar}
                                setConductorAConfirmar={setConductorAConfirmar}
                                setShowConfirmAsignar={setShowConfirmAsignar}
                                setDonacionDetalle={setDonacionDetalle}
                                setShowDetallesDonacion={setShowDetallesDonacion}
                                centrarMapa={centrarMapa}
                                handleRecibirDonacion={handleRecibirDonacion}
                              />
                            ))}
                          </tbody>
                        </Table>
                      </div>

                      <PaginationControl
                        totalItems={donacionesFiltradas.length}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        itemsPerPage={itemsPerPage}
                        setItemsPerPage={setItemsPerPage}
                        page={page}
                        setPage={setPage}
                      />
                    </Card>
                  )}
                </Col>
                <Col lg={5}>
                  <div className="map-container-wrapper" style={{ height: '500px' }}>
                    <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <ChangeView center={mapCenter} />

                      {donacionesFiltradas.map(don => (
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
              <Card className="border shadow-sm p-3 rounded-4 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                  <h5 className="mb-0 fw-bold">Historial de Donaciones Recibidas</h5>
                  <Button variant="outline-primary" size="sm" onClick={() => setShowHistorialFilters(!showHistorialFilters)} style={{ borderRadius: '8px' }}>
                    <Filter size={14} className="me-1" />
                    Filtros
                  </Button>
                </div>

                <Collapse in={showHistorialFilters}>
                  <div className="bg-light p-3 border rounded-4 mb-3">
                    <GenericFilterBar
                      filters={historialFilters}
                      setFilters={setHistorialFilters}
                      comunaOptions={historialComunaOptions}
                      estadoOptions={historialEstadoOptions}
                      categoriaOptions={historialCategoriaOptions}
                      subcategoriaOptions={historialSubcategoriaOptions}
                    />
                  </div>
                </Collapse>

                {donacionesRecibidasFiltradas.length === 0 ? (
                  <div className="text-center p-5 bg-light rounded-4 border">
                    <Package size={48} className="text-muted mb-3 opacity-50" />
                    <h6 className="text-muted">No se encontraron donaciones con los filtros actuales en el historial.</h6>
                  </div>
                ) : (
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
                          <DonacionRecibidaRow
                            key={don.id}
                            don={don}
                            getBadgeColor={getBadgeColor}
                            setDonacionDetalle={setDonacionDetalle}
                            setShowDetallesDonacion={setShowDetallesDonacion}
                          />
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
                {donacionesRecibidasFiltradas.length > 0 && (
                  <PaginationControl
                    totalItems={donacionesRecibidasFiltradas.length}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    page={page}
                    setPage={setPage}
                  />
                )}
              </Card>
            )}

            {/* PESTAÑA 3: INVENTARIO */}
            {activeTab === 'inventario' && (
              <Card className="border shadow-sm p-3 rounded-4 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                  <h5 className="mb-0 fw-bold">Inventario General</h5>
                  <Button variant="outline-primary" size="sm" onClick={() => setShowInventarioFilters(!showInventarioFilters)} style={{ borderRadius: '8px' }}>
                    <Filter size={14} className="me-1" />
                    Filtros
                  </Button>
                </div>

                <Collapse in={showInventarioFilters}>
                  <div className="bg-light p-3 border rounded-4 mb-3">
                    <InventarioFilterBar
                      filters={inventarioFilters}
                      setFilters={setInventarioFilters}
                      categoriaOptions={inventarioCategoriaOptions}
                      subcategoriaOptions={inventarioSubcategoriaOptions}
                    />
                  </div>
                </Collapse>

                {inventarioFiltrado.length === 0 ? (
                  <div className="text-center p-5 bg-light rounded-4 border">
                    <Archive size={48} className="mb-3 opacity-25" />
                    <h6 className="text-muted">No se encontraron ítems en el inventario con los filtros actuales.</h6>
                  </div>
                ) : (
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
                        {paginatedInventario.map((inv: any, idx: number) => (
                          <InventarioRow key={`${inv.categoria}-${inv.subcategoria}-${inv.unidadMedida}-${inv.detalles || ''}-${idx}`} inv={inv} />
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
                {inventarioFiltrado.length > 0 && (
                  <PaginationControl
                    totalItems={inventarioFiltrado.length}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    page={page}
                    setPage={setPage}
                  />
                )}
              </Card>
            )}

            {/* PESTAÑA 4: ALERTA DE NECESIDADES */}
            {activeTab === 'alertas' && (
              <Row>
                <Col lg={7} className="mb-4 mb-lg-0">
                  <Card className="border shadow-sm p-3 rounded-4 bg-white mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                      <h5 className="mb-0 fw-bold">Alertas Activas</h5>
                      <Button variant="outline-primary" size="sm" onClick={() => setShowNecesidadesFilters(!showNecesidadesFilters)} style={{ borderRadius: '8px' }}>
                        <Filter size={14} className="me-1" />
                        Filtros
                      </Button>
                    </div>

                    <Collapse in={showNecesidadesFilters}>
                      <div className="bg-light p-3 border rounded-4 mb-3">
                        <GenericFilterBar
                          filters={necesidadesFilters}
                          setFilters={setNecesidadesFilters}
                          comunaOptions={necComunaOptions}
                          estadoOptions={necEstadoOptions}
                          categoriaOptions={necCategoriaOptions}
                          subcategoriaOptions={necSubcategoriaOptions}
                        />
                      </div>
                    </Collapse>

                    {necesidadesActivasFiltradas.length === 0 ? (
                      <div className="text-center p-5 bg-light rounded-4 border">
                        <CheckCircle size={48} className="text-success mb-3 opacity-50" />
                        <h6 className="text-muted">No hay necesidades urgentes con los filtros actuales.</h6>
                      </div>
                    ) : (
                      <>
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
                              {paginatedNecesidadesActivas.map(nec => (
                                <NecesidadActivaRow
                                  key={nec.id}
                                  nec={nec}
                                  centrarMapa={centrarMapa}
                                  setNecesidadSeleccionada={setNecesidadSeleccionada}
                                  setShowNecesidadModal={setShowNecesidadModal}
                                  setNecesidadDetalle={setNecesidadDetalle}
                                  setShowDetallesNecesidad={setShowDetallesNecesidad}
                                />
                              ))}
                            </tbody>
                          </Table>
                        </div>
                        {necesidadesActivasFiltradas.length > 0 && (
                          <PaginationControl
                            totalItems={necesidadesActivasFiltradas.length}
                            startIndex={startIndex}
                            endIndex={endIndex}
                            itemsPerPage={itemsPerPage}
                            setItemsPerPage={setItemsPerPage}
                            page={page}
                            setPage={setPage}
                          />
                        )}
                      </>
                    )}
                  </Card>
                </Col>
                <Col lg={5}>
                  <div className="map-container-wrapper" style={{ height: '500px' }}>
                    <MapContainer center={mapCenter} zoom={11} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <ChangeView center={mapCenter} />

                      {necesidadesActivasFiltradas.map(nec => (
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
              <Card className="border shadow-sm p-3 rounded-4 bg-white mb-3">
                <div className="d-flex align-items-center justify-content-between mb-3 px-2">
                  <h5 className="mb-0 fw-bold">Historial de Necesidades</h5>
                  <Button variant="outline-primary" size="sm" onClick={() => setShowHistorialNecesidadesFilters(!showHistorialNecesidadesFilters)} style={{ borderRadius: '8px' }}>
                    <Filter size={14} className="me-1" />
                    Filtros
                  </Button>
                </div>

                <Collapse in={showHistorialNecesidadesFilters}>
                  <div className="bg-light p-3 border rounded-4 mb-3">
                    <GenericFilterBar
                      filters={historialNecesidadesFilters}
                      setFilters={setHistorialNecesidadesFilters}
                      comunaOptions={necHistorialComunaOptions}
                      estadoOptions={necHistorialEstadoOptions}
                      categoriaOptions={necHistorialCategoriaOptions}
                      subcategoriaOptions={necHistorialSubcategoriaOptions}
                    />
                  </div>
                </Collapse>

                {necesidadesCubiertasFiltradas.length === 0 ? (
                  <div className="text-center p-5 bg-light rounded-4 border">
                    <CheckCircle size={48} className="text-muted mb-3 opacity-25" />
                    <h5 className="text-muted">No hay historial</h5>
                    <p className="text-muted">Aún no se han cubierto necesidades o no coinciden con los filtros.</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table className="modern-table w-100 mb-0" hover borderless style={{ minWidth: '600px' }}>
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
                          {paginatedNecesidadesCubiertas.map(nec => (
                            <NecesidadCubiertaRow key={nec.id} nec={nec} />
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    {necesidadesCubiertasFiltradas.length > 0 && (
                      <PaginationControl
                        totalItems={necesidadesCubiertasFiltradas.length}
                        startIndex={startIndex}
                        endIndex={endIndex}
                        itemsPerPage={itemsPerPage}
                        setItemsPerPage={setItemsPerPage}
                        page={page}
                        setPage={setPage}
                      />
                    )}
                  </>
                )}
              </Card>
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
                    {invCheck.detalles.map((det: any, i: number) => {
                      const extras = det.detallesStr ? det.detallesStr.split(';').filter(Boolean) : [];
                      return (
                        <tr key={`${det.categoria}-${det.subcategoria}-${det.unidad}-${i}`}>
                          <td>
                            <span className="fw-bold d-block">{det.subcategoria}</span>
                            <small className="text-muted">{det.categoria}</small>
                            {extras.length > 0 && (
                              <div className="d-flex flex-wrap gap-1 mt-1">
                                {extras.map((extra: string) => (
                                  <span key={extra} className="badge bg-light text-primary border border-primary-subtle" style={{ fontSize: '0.7rem' }}>
                                    {extra}
                                  </span>
                                ))}
                              </div>
                            )}
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
                      );
                    })}
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
                disabled={!conductorSeleccionadoNec || actionLoading === necesidadSeleccionada?.id || !invCheck.suficientes}
              >
                {actionLoading === necesidadSeleccionada?.id ? <Spinner size="sm" /> : 'Asignar Conductor'}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
        {/* Modal Detalles Necesidad */}
        <Modal show={showDetallesNecesidad} onHide={() => setShowDetallesNecesidad(false)} size="lg" centered>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold">Detalles de la Necesidad</Modal.Title>
          </Modal.Header>
          <Modal.Body className="py-4">
            {necesidadDetalle && (
              <Row className="g-4">
                <Col md={6}>
                  <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Información General</h6>
                  <p className="mb-2"><strong>ID:</strong> #{necesidadDetalle.id}</p>
                  <p className="mb-2"><strong>Emergencia:</strong> {necesidadDetalle.tipoEmergencia || 'Alerta General'}</p>
                  <p className="mb-2"><strong>Estado Actual:</strong> <Badge bg={getBadgeColor(necesidadDetalle.estado || '')}>{necesidadDetalle.estado?.replace('_', ' ') || 'PENDIENTE'}</Badge></p>
                  <p className="mb-2"><strong>Fecha Solicitud:</strong> {new Date(necesidadDetalle.fechaReporte).toLocaleString()}</p>
                </Col>
                <Col md={6}>
                  <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Logística</h6>
                  <p className="mb-2"><strong>Región:</strong> {necesidadDetalle.region || 'No especificada'}</p>
                  <p className="mb-2"><strong>Comuna:</strong> {necesidadDetalle.comuna || 'No especificada'}</p>
                  <p className="mb-2"><strong>Conductor ID:</strong> {necesidadDetalle.conductorId || 'No asignado'}</p>
                  <p className="mb-2"><strong>Centro Acopio ID:</strong> {necesidadDetalle.centroAcopioId || 'No asignado'}</p>
                </Col>

                <Col md={12}>
                  <h6 className="fw-bold text-muted mb-3 border-bottom pb-2">Recursos Solicitados</h6>
                  <RecursosDetalleTable recursos={necesidadDetalle.recursos || '[]'} />
                </Col>
              </Row>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setShowDetallesNecesidad(false)}>Cerrar</Button>
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
                    try {
                      const recs = JSON.parse(donacionDetalle.recursos || '[]');
                      if (Array.isArray(recs) && recs.length > 0) {
                        const unitMap: Record<string, number> = {};
                        recs.forEach((r: any) => {
                          const { finalCantidad, finalUnidad } = flattenResourceUnit(r, r.cantidad || 0);
                          unitMap[finalUnidad] = (unitMap[finalUnidad] || 0) + finalCantidad;
                        });
                        return Object.entries(unitMap).map(([u, c]) => `${c} ${u}`).join(', ');
                      }
                    } catch { }
                    return '0 items';
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
                  <RecursosDetalleTable recursos={donacionDetalle.recursos || '[]'} />
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
