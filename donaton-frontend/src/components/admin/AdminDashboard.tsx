import React from 'react';
import { Container, Row, Col, Nav, Modal, Button } from 'react-bootstrap';
import { AdminDonacionesView } from './AdminDonacionesView';
import { AdminMapaView } from './AdminMapaView';
import { AdminUsuariosView } from './AdminUsuariosView';
import { PanelHistorialNecesidades } from './PanelHistorialNecesidades';
import { AdminOverview } from './AdminOverview';
import { AdminDonacionDetalleModal } from './AdminDonacionDetalleModal';
import { RegionComunaInput } from '../common/RegionComunaInput';
import { useAuth } from '../../context/AuthContext';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import {
  getOpcionesDonacion,
  isDonacionLocked,
  getOpcionesNecesidad,
  isNecesidadLocked,
  getDonanteNameFromMap,
  filterDonaciones,
  filterDonacionesLogistica,
  getNecesidadBgColor,
  getEstadoBadgeColor
} from '../../utils/adminDashboardUtils';

type AdminSection = 'resumen' | 'donaciones' | 'mapa' | 'usuarios' | 'historial';

const AdminDashboard: React.FC = () => {
  const { usuario } = useAuth();
  
  const {
    activeSection, setActiveSection,
    donaciones, centros, usuariosMapDonacion, donacionFiltros, setDonacionFiltros,
    necesidades, usuarios, mapCenter, setMapCenter, mapFilter, setMapFilter,
    confirmModal, setConfirmModal,
    filtros, setFiltros, pageInfo, setPageInfo, searchTerm, setSearchTerm,
    selectedUserIds, setSelectedUserIds, userToDelete, setUserToDelete,
    userToEdit, setUserToEdit, stats, donacionDetalle, setDonacionDetalle,
    loadingDonaciones, loadingMapa, loadingUsuarios,
    fetchUsuariosActualizados, handleConfirmarEstado, handleToggleActivo
  } = useAdminDashboard();

  const donacionesFiltradas = filterDonaciones(donaciones, donacionFiltros, usuariosMapDonacion);
  const donacionesLogistica = filterDonacionesLogistica(donaciones);

  const selectUser = (id: number) => setSelectedUserIds(prev => [...prev, id]);
  const deselectUser = (id: number) => setSelectedUserIds(prev => prev.filter(uid => uid !== id));

  const selectAllUsers = () => setSelectedUserIds(usuarios.filter(u => u.rol !== 'ADMIN').map(u => Number(u.id)));
  const deselectAllUsers = () => setSelectedUserIds([]);

  const rolOptions = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'COORDINADOR', label: 'Coordinador' },
    { value: 'LOGISTICA', label: 'Logística' },
    { value: 'DONANTE', label: 'Donante' }
  ];

  const getNavStyle = (section: AdminSection) => ({
    color: activeSection === section ? '#fff' : 'rgba(255,255,255,0.6)',
    backgroundColor: activeSection === section ? 'rgba(108, 99, 255, 0.3)' : 'transparent',
    border: activeSection === section ? '1px solid rgba(108, 99, 255, 0.5)' : '1px solid transparent',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    fontWeight: activeSection === section ? 600 : 400,
  });

  return (
    <>
      <Container fluid className="px-0" style={{ minHeight: 'calc(100vh - 120px)' }}>
        <Row className="g-0">
          <Col md={3} lg={2} style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            minHeight: 'calc(100vh - 120px)',
          }}>
            <div className="p-4">
              <div className="text-center mb-4">
                <div style={{ fontSize: '2.5rem' }}>🛡️</div>
                <h5 className="text-white fw-bold mt-2 mb-0">Admin Panel</h5>
                <small className="text-white-50">Sistema Donatón</small>
              </div>

              <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

              <Nav className="flex-column gap-2">
                <Nav.Link
                  onClick={() => setActiveSection('resumen')}
                  className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                  style={getNavStyle('resumen')}
                >
                  <span style={{ fontSize: '1.3rem' }}>📊</span>
                  <span>Resumen (Dashboard)</span>
                </Nav.Link>
                <Nav.Link
                  onClick={() => setActiveSection('donaciones')}
                  className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                  style={getNavStyle('donaciones')}
                >
                  <span style={{ fontSize: '1.3rem' }}>📦</span>
                  <span>Historial Donaciones</span>
                </Nav.Link>

                <Nav.Link
                  onClick={() => setActiveSection('historial')}
                  className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                  style={getNavStyle('historial')}
                >
                  <span style={{ fontSize: '1.3rem' }}>📜</span>
                  <span>Historial Necesidades</span>
                </Nav.Link>

                <Nav.Link
                  onClick={() => setActiveSection('mapa')}
                  className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                  style={getNavStyle('mapa')}
                >
                  <span style={{ fontSize: '1.3rem' }}>🗺️</span>
                  <span>Mapa Logístico</span>
                </Nav.Link>

                <Nav.Link
                  onClick={() => setActiveSection('usuarios')}
                  className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                  style={getNavStyle('usuarios')}
                >
                  <span style={{ fontSize: '1.3rem' }}>👥</span>
                  <span>Usuarios</span>
                </Nav.Link>
              </Nav>

              <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

              <div className="text-center mt-4">
                <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                  Panel v2.0 · Donatón
                </small>
              </div>
            </div>
          </Col>

          <Col md={9} lg={10} className="p-4" style={{ backgroundColor: '#f5f6fa', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
            {activeSection === 'resumen' && (
              <AdminOverview 
                donaciones={donaciones}
                necesidades={necesidades}
                centros={centros}
                usuarios={usuarios}
              />
            )}
            {activeSection === 'donaciones' && (
              <AdminDonacionesView
                loadingDonaciones={loadingDonaciones}
                donacionesFiltradas={donacionesFiltradas}
                donacionFiltros={donacionFiltros}
                setDonacionFiltros={setDonacionFiltros}
                centros={centros}
                usuariosMapDonacion={usuariosMapDonacion}
                setDonacionDetalle={setDonacionDetalle}
                RegionComunaInput={RegionComunaInput}
                getDonanteNameFromMap={getDonanteNameFromMap}
                getEstadoBadgeColor={getEstadoBadgeColor}
              />
            )}
            {activeSection === 'mapa' && (
              <div>
                <AdminMapaView
                  mapFilter={mapFilter}
                  setMapFilter={setMapFilter}
                  donacionesLogistica={donacionesLogistica}
                  necesidades={necesidades.filter(n => ['Pendiente', 'En tránsito'].includes(n.estado || 'Pendiente'))}
                  loadingMapa={loadingMapa}
                  mapCenter={mapCenter}
                  setMapCenter={setMapCenter}
                  usuario={usuario}
                  setConfirmModal={setConfirmModal}
                  setDonacionDetalle={setDonacionDetalle}
                  isDonacionLocked={isDonacionLocked}
                  getOpcionesDonacion={getOpcionesDonacion}
                  isNecesidadLocked={isNecesidadLocked}
                  getOpcionesNecesidad={getOpcionesNecesidad}
                  getNecesidadBgColor={getNecesidadBgColor}
                />
                <Modal show={!!confirmModal} onHide={() => setConfirmModal(null)} centered>
                  <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">⚠️ Confirmar Cambio de Estado</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="pt-0">
                    ¿Estás seguro de que deseas cambiar el estado a <strong>{confirmModal?.newState}</strong>?<br/><br/>
                    <span className="text-danger">Nota: Esta acción no se puede deshacer. No podrás volver a un estado anterior una vez confirmado.</span>
                  </Modal.Body>
                  <Modal.Footer className="border-0">
                    <Button variant="light" onClick={() => setConfirmModal(null)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleConfirmarEstado}>Confirmar Cambio</Button>
                  </Modal.Footer>
                </Modal>
              </div>
            )}
            {activeSection === 'usuarios' && (
              <AdminUsuariosView
                usuarios={usuarios}
                loadingUsuarios={loadingUsuarios}
                stats={stats}
                filtros={filtros}
                setFiltros={setFiltros}
                pageInfo={pageInfo}
                setPageInfo={setPageInfo}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                userToDelete={userToDelete}
                setUserToDelete={setUserToDelete}
                userToEdit={userToEdit}
                setUserToEdit={setUserToEdit}
                handleToggleActivo={handleToggleActivo}
                selectAllUsers={selectAllUsers}
                deselectAllUsers={deselectAllUsers}
                selectUser={selectUser}
                deselectUser={deselectUser}
                rolOptions={rolOptions}
                fetchUsuariosActualizados={fetchUsuariosActualizados}
              />
            )}
            {activeSection === 'historial' && <PanelHistorialNecesidades necesidades={necesidades} getNecesidadBgColor={getNecesidadBgColor} />}
          </Col>
        </Row>
      </Container>

      <AdminDonacionDetalleModal
        show={!!donacionDetalle}
        onHide={() => setDonacionDetalle(null)}
        donacionDetalle={donacionDetalle}
        centros={centros}
      />
    </>
  );
};

export default AdminDashboard;


