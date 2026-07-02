import type { DonacionResponse } from '../services/donacionService';
import type { UsuarioExtended } from '../components/admin/AdminDonacionesView';

export const getOpcionesDonacion = (estadoActual: string, usuario: any) => {
  if (usuario?.rol === 'ADMIN') {
    return ['Pendiente', 'En tránsito', 'Recibido', 'Cancelado'];
  }
  const actual = formatEstado(estadoActual);
  
  if (usuario?.subRol === 'CONDUCTOR') {
    if (actual === 'Pendiente') return ['Pendiente', 'En tránsito'];
    if (actual === 'En tránsito') return ['En tránsito', 'Cancelado'];
    return [actual];
  }
  
  if (usuario?.subRol === 'RECEPCIONISTA') {
    if (actual === 'Pendiente') return ['Pendiente', 'En tránsito'];
    if (actual === 'En tránsito') return ['En tránsito', 'Recibido', 'Cancelado'];
    return [actual];
  }
  
  return [actual];
};

export const isDonacionLocked = (estado: string, usuario: any) => {
  if (usuario?.rol === 'ADMIN') return false;
  const actual = formatEstado(estado);
  return actual === 'Recibido' || actual === 'Cancelado';
};

export const getOpcionesNecesidad = (estadoActual: string, usuario: any) => {
  if (usuario?.rol === 'ADMIN') {
    return ['Pendiente', 'En tránsito', 'Cubierta', 'Cancelada'];
  }
  const actual = formatEstado(estadoActual);
  
  if (usuario?.subRol === 'CONDUCTOR' || usuario?.subRol === 'RECEPCIONISTA') {
    if (actual === 'Pendiente') return ['Pendiente', 'En tránsito'];
    if (actual === 'En tránsito') return ['En tránsito', 'Cubierta'];
    return [actual];
  }
  
  return [actual];
};

export const isNecesidadLocked = (estado: string, usuario: any) => {
  if (usuario?.rol === 'ADMIN') return false;
  const actual = formatEstado(estado);
  return actual === 'Cubierta' || actual === 'Cancelada';
};

export const getDonanteNameFromMap = (donanteId?: number, map: Record<number, UsuarioExtended> = {}) => {
  if (!donanteId || !map[donanteId]) return 'Solidario/a';
  const u = map[donanteId];
  if ((u.tipoPersona === 'Jurídica' || u.tipoPersona === 'JURIDICO') && u.razonSocial) return u.razonSocial;
  return u.nombreCompleto || (u as any).nombre || 'Solidario/a';
};

export const filterDonaciones = (
  donaciones: DonacionResponse[],
  filtros: { id: string, region: string, comuna: string, centroAcopio: string, categoria: string, subcategoria?: string, donante: string, estado: string, fecha?: string },
  usuariosMap: Record<number, UsuarioExtended>
) => {
  const matchText = (val?: string, search?: string) => 
    !search || (val || '').toLowerCase().includes(search.toLowerCase());

  const matchDonante = (d: DonacionResponse) => {
    if (!filtros.donante) return true;
    const nombre = getDonanteNameFromMap(d.donanteId, usuariosMap).toLowerCase();
    return nombre.includes(filtros.donante.toLowerCase());
  };

  const matchFecha = (d: DonacionResponse) => {
    if (!filtros.fecha) return true;
    const reqDate = d.fechaRegistro ? d.fechaRegistro.split('T')[0].split(' ')[0] : '';
    return reqDate === filtros.fecha;
  };

  return donaciones.filter(d => 
    (!filtros.id || d.id.toString().includes(filtros.id)) &&
    matchText(d.regionRetiro, filtros.region) &&
    matchText(d.comunaRetiro, filtros.comuna) &&
    matchText(d.recursos, filtros.categoria) &&
    matchText(d.recursos, filtros.subcategoria) &&
    (!filtros.centroAcopio || d.centroAcopioDestinoId?.toString() === filtros.centroAcopio) &&
    matchDonante(d) &&
    (!filtros.estado || formatEstado(d.estado) === filtros.estado) &&
    matchFecha(d)
  );
};

export const filterDonacionesLogistica = (donaciones: DonacionResponse[]) => {
  return donaciones.filter(d => {
    if (!d.latitudRetiro || !d.longitudRetiro) return false;
    const est = d.estado?.toUpperCase() || '';
    return ['PENDIENTE', 'EN TRANSITO', 'EN TRÁNSITO', 'PENDIENTE RETIRO'].includes(est);
  });
};

export const filterNecesidadesLogistica = (necesidades: any[]) => {
  return necesidades.filter(n => {
    if (!n.latitud || !n.longitud) return false;
    const est = n.estado?.toUpperCase() || 'PENDIENTE';
    return ['PENDIENTE', 'EN TRANSITO', 'EN TRÁNSITO', 'EN_TRANSITO'].includes(est);
  });
};

export const formatEstado = (estado?: string) => {
  if (!estado) return 'Pendiente';
  const normalized = estado.toUpperCase().replace(/\s+/g, '_');
  switch (normalized) {
    case 'PENDIENTE': return 'Pendiente';
    case 'EN_TRANSITO': return 'En tránsito';
    case 'EN_TRÁNSITO': return 'En tránsito';
    case 'EN_PROGRESO': return 'En progreso';
    case 'ENTREGADO': return 'Entregado';
    case 'RECIBIDO': return 'Recibido';
    case 'CUBIERTA': return 'Cubierta';
    case 'CERRADO': return 'Cerrado';
    case 'CANCELADO': return 'Cancelado';
    case 'CANCELADA': return 'Cancelada';
    case 'RECHAZADO': return 'Rechazado';
    default:
      return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase().replaceAll('_', ' ');
  }
};

export const getEstadoBadgeColor = (estado: string) => {
  const f = formatEstado(estado);
  if (f === 'Recibido' || f === 'Entregado' || f === 'Cubierta') return 'success';
  if (f === 'En tránsito' || f === 'En progreso') return 'primary';
  if (f === 'Cancelado' || f === 'Cancelada' || f === 'Rechazado') return 'danger';
  if (f === 'Pendiente') return 'warning';
  return 'secondary';
};

export const getNecesidadBgColor = (estado?: string) => {
  const f = formatEstado(estado);
  if (f === 'Cubierta') return '#f0fff4';
  if (f === 'En tránsito' || f === 'En progreso') return '#fff9e6';
  return '#fff';
};

