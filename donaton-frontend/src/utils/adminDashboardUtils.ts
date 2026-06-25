import type { DonacionResponse } from '../services/donacionService';
import type { UsuarioExtended } from '../components/admin/AdminDonacionesView';

export const getOpcionesDonacion = (estadoActual: string, usuario: any) => {
  if (usuario?.rol === 'ADMIN') {
    return ['Pendiente', 'En tránsito', 'Recibido', 'Cancelado'];
  }
  const actual = estadoActual || 'Pendiente';
  
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
  return estado === 'Recibido' || estado === 'Cancelado';
};

export const getOpcionesNecesidad = (estadoActual: string, usuario: any) => {
  if (usuario?.rol === 'ADMIN') {
    return ['Pendiente', 'En tránsito', 'Cubierta', 'Cancelada'];
  }
  const actual = estadoActual || 'Pendiente';
  
  if (usuario?.subRol === 'CONDUCTOR' || usuario?.subRol === 'RECEPCIONISTA') {
    if (actual === 'Pendiente') return ['Pendiente', 'En tránsito'];
    if (actual === 'En tránsito') return ['En tránsito', 'Cubierta'];
    return [actual];
  }
  
  return [actual];
};

export const isNecesidadLocked = (estado: string, usuario: any) => {
  if (usuario?.rol === 'ADMIN') return false;
  return estado === 'Cubierta' || estado === 'Cancelada';
};

export const getDonanteNameFromMap = (donanteId?: number, map: Record<number, UsuarioExtended> = {}) => {
  if (!donanteId || !map[donanteId]) return 'Solidario/a';
  const u = map[donanteId];
  if (u.tipoPersona === 'Jurídica' && u.razonSocial) return u.razonSocial;
  return u.nombreCompleto || (u as any).nombre || 'Solidario/a';
};

export const filterDonaciones = (
  donaciones: DonacionResponse[],
  filtros: { id: string, region: string, comuna: string, centroAcopio: string, categoria: string, donante: string },
  usuariosMap: Record<number, UsuarioExtended>
) => {
  return donaciones.filter(d => {
    if (filtros.id && !d.id.toString().includes(filtros.id)) return false;
    if (filtros.region && !d.regionRetiro?.toLowerCase().includes(filtros.region.toLowerCase())) return false;
    if (filtros.comuna && !d.comunaRetiro?.toLowerCase().includes(filtros.comuna.toLowerCase())) return false;
    if (filtros.categoria && !d.recursos?.toLowerCase().includes(filtros.categoria.toLowerCase())) return false;
    if (filtros.centroAcopio && d.centroAcopioDestinoId?.toString() !== filtros.centroAcopio) return false;
    if (filtros.donante) {
      const nombre = getDonanteNameFromMap(d.donanteId, usuariosMap).toLowerCase();
      if (!nombre.includes(filtros.donante.toLowerCase())) return false;
    }
    return true;
  });
};

export const filterDonacionesLogistica = (donaciones: DonacionResponse[]) => {
  return donaciones.filter(d => {
    if (!d.latitudRetiro || !d.longitudRetiro) return false;
    const est = d.estado?.toUpperCase() || '';
    return ['PENDIENTE', 'EN TRANSITO', 'EN TRÁNSITO', 'PENDIENTE RETIRO'].includes(est);
  });
};

export const getEstadoBadgeColor = (estado: string) => {
  if (estado === 'RECIBIDO') return 'success';
  if (estado === 'EN TRANSITO') return 'primary';
  if (estado === 'Cancelado') return 'danger';
  return 'warning';
};

export const getNecesidadBgColor = (estado?: string) => {
  if (estado === 'Cubierta') return '#f0fff4';
  if (estado === 'En tránsito') return '#fff9e6';
  return '#fff';
};

