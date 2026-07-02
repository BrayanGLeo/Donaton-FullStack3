import { useState, useEffect, useCallback } from 'react';
import { obtenerUsuarios, obtenerUsuariosStats, actualizarEstadoMasivoUsuarios } from '../services/usuarioService';
import { listarDonaciones, actualizarEstadoDonacion, type DonacionResponse } from '../services/donacionService';
import { obtenerCentrosAcopio, type CentroAcopio } from '../services/logisticaService';
import { obtenerNecesidades, actualizarEstadoNecesidad, type Necesidad } from '../services/bffService';
import { fixEncodingObject } from '../utils/unidadesLogic';
import type { UsuarioExtended } from '../components/admin/AdminDonacionesView';
import type { MapFilterType } from '../components/admin/AdminMapaView';

type AdminSection = 'resumen' | 'donaciones' | 'mapa' | 'usuarios' | 'historial';

export const useAdminDashboard = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('resumen');

  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [centros, setCentros] = useState<CentroAcopio[]>([]);
  const [usuariosMapDonacion, setUsuariosMapDonacion] = useState<Record<number, UsuarioExtended>>({});
  const [donacionFiltros, setDonacionFiltros] = useState({ id: '', region: '', comuna: '', centroAcopio: '', categoria: '', subcategoria: '', donante: '', estado: '', fecha: '' });
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioExtended[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.448, -70.669]);
  const [mapFilter, setMapFilter] = useState<MapFilterType>('GLOBAL');
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, type: 'donacion' | 'necesidad', id: number, newState: string } | null>(null);

  const [filtros, setFiltros] = useState({ rol: '', region: '', comuna: '', activo: '' });
  const [pageInfo, setPageInfo] = useState({ page: 0, size: 15, totalElements: 0, totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchNameTerm, setSearchNameTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userToDelete, setUserToDelete] = useState<UsuarioExtended | null>(null);
  const [userToEdit, setUserToEdit] = useState<UsuarioExtended | null>(null);
  const [stats, setStats] = useState<{ total: number; activos: number; donantes: number; logistica: number } | null>(null);
  const [donacionDetalle, setDonacionDetalle] = useState<DonacionResponse | null>(null);
  const [necesidadDetalle, setNecesidadDetalle] = useState<Necesidad | null>(null);

  const [loadingDonaciones, setLoadingDonaciones] = useState(false);
  const [loadingMapa, setLoadingMapa] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  const fetchUsuariosActualizados = useCallback(() => {
    setLoadingUsuarios(true);
    obtenerUsuarios({
      ...filtros,
      rut: searchTerm,
      nombre: searchNameTerm,
      page: pageInfo.page,
      size: pageInfo.size
    })
      .then((res) => {
        setUsuarios(res.content);
        setPageInfo(prev => ({
          ...prev,
          totalElements: res.totalElements,
          totalPages: res.totalPages
        }));
      })
      .catch(console.error)
      .finally(() => setLoadingUsuarios(false));
  }, [filtros, searchTerm, searchNameTerm, pageInfo.page, pageInfo.size]);

  useEffect(() => {
    if (activeSection === 'resumen') {
      Promise.all([
        listarDonaciones().catch(() => []),
        obtenerNecesidades().catch(() => []),
        obtenerCentrosAcopio().catch(() => []),
        obtenerUsuarios({ size: 1000 }).catch(() => ({ content: [] })),
        obtenerUsuariosStats().catch(() => null)
      ]).then(([dons, necs, cents, usersPage, statsData]) => {
        setDonaciones(dons.map(d => fixEncodingObject(d)));
        setNecesidades(necs.map(n => fixEncodingObject(n)));
        setCentros(cents.map(c => fixEncodingObject(c)));
        setUsuarios((usersPage.content || []).map(u => fixEncodingObject(u)));
        if (statsData) setStats(statsData);
      }).catch(console.error);
    } else if (activeSection === 'donaciones') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingDonaciones(true);
      Promise.all([
        listarDonaciones(),
        obtenerCentrosAcopio().catch(() => [])
      ])
        .then(async ([dons, cents]) => {
          setDonaciones(dons.map(d => fixEncodingObject(d)));
          setCentros(cents.map(c => fixEncodingObject(c)));
          const resUsers = await obtenerUsuarios({ size: 5000 });
          const usersPage = resUsers.content ? resUsers : { content: resUsers };
          const map: Record<number, UsuarioExtended> = {};
          const usersContent = (usersPage.content as any[]) || [];
          usersContent.map(u => fixEncodingObject(u)).forEach((u: UsuarioExtended) => {
            if (u.id) map[Number(u.id)] = u;
          });
          setUsuariosMapDonacion(map);
        })
        .catch(console.error)
        .finally(() => setLoadingDonaciones(false));
    } else if (activeSection === 'mapa') {
      setLoadingMapa(true);
      Promise.all([obtenerUsuarios(), obtenerNecesidades()])
        .then(([users, necs]) => {
          setUsuarios((users.content || []).map(u => fixEncodingObject(u)));
          setNecesidades(necs.map(n => fixEncodingObject(n)));
        })
        .catch(console.error)
        .finally(() => setLoadingMapa(false));
    } else if (activeSection === 'historial') {
      Promise.all([
        obtenerNecesidades(),
        obtenerUsuarios({ size: 5000 }).catch(() => ({ content: [] }))
      ])
        .then(([necs, usersPage]) => {
          setNecesidades(necs.map(n => fixEncodingObject(n)));
          setUsuarios((usersPage.content || []).map(u => fixEncodingObject(u)));
        })
        .catch(console.error);
    } else if (activeSection === 'usuarios') {
      fetchUsuariosActualizados();
      obtenerUsuariosStats().then(setStats).catch(console.error);
    }
  }, [activeSection, fetchUsuariosActualizados]);

  const handleConfirmarEstado = async () => {
    if (!confirmModal) return;
    const { type, id, newState } = confirmModal;
    
    try {
      if (type === 'donacion') {
        const updated = await actualizarEstadoDonacion(id, newState);
        setDonaciones(prev => prev.map(d => d.id === id ? { ...d, estado: updated.estado } : d));
      } else {
        const updated = await actualizarEstadoNecesidad(id, newState);
        setNecesidades(prev => prev.map(n => n.id === id ? { ...n, estado: updated.estado } : n));
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
    setConfirmModal(null);
  };

  const handleToggleActivo = async () => {
    if (!userToDelete) return;
    try {
      const nuevoEstado = !userToDelete.activo;
      await actualizarEstadoMasivoUsuarios([Number(userToDelete.id)], nuevoEstado);
      fetchUsuariosActualizados();
    } catch (err) {
      console.error(err);
    }
    setUserToDelete(null);
  };

  return {
    activeSection, setActiveSection,
    donaciones, centros, usuariosMapDonacion, donacionFiltros, setDonacionFiltros,
    necesidades, usuarios, mapCenter, setMapCenter, mapFilter, setMapFilter,
    confirmModal, setConfirmModal,
    filtros, setFiltros, pageInfo, setPageInfo, searchTerm, setSearchTerm, searchNameTerm, setSearchNameTerm,
    selectedUserIds, setSelectedUserIds, userToDelete, setUserToDelete,
    userToEdit, setUserToEdit, stats, donacionDetalle, setDonacionDetalle,
    necesidadDetalle, setNecesidadDetalle,
    loadingDonaciones, loadingMapa, loadingUsuarios,
    fetchUsuariosActualizados, handleConfirmarEstado, handleToggleActivo
  };
};

