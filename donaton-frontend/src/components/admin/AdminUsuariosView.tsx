import React from 'react';
import { Row, Col, Card, Badge, Form, Spinner, Button, Modal, Table } from 'react-bootstrap';
import Select from 'react-select';
import { AdminEditUserModal } from './AdminEditUserModal';
import { AdminUserForm } from './AdminUserForm';
import type { UsuarioExtended } from './AdminDonacionesView';
import { actualizarEstadoMasivoUsuarios } from '../../services/usuarioService';

const getRolBadgeColor = (rol: string) => {
  if (rol === 'ADMIN') return 'dark';
  if (rol === 'COORDINADOR') return 'danger';
  if (rol === 'LOGISTICA') return 'primary';
  return 'success';
};

const renderTipoUsuario = (u: UsuarioExtended) => {
  if (u.tipoPersona) {
    return (
      <Badge bg={u.tipoPersona === 'NATURAL' ? 'info' : 'secondary'} className="px-2 py-1" style={{ borderRadius: '10px' }}>
        {u.tipoPersona === 'NATURAL' ? '👤 Natural' : '🏢 Jurídica'}
      </Badge>
    );
  }
  
  if (u.subRol === 'CONDUCTOR') {
    return (
      <Badge bg="warning" text="dark" className="px-2 py-1" style={{ borderRadius: '10px' }}>
        🚛 Conductor
      </Badge>
    );
  }
  
  if (u.subRol === 'RECEPCIONISTA') {
    return (
      <Badge bg="success" className="px-2 py-1" style={{ borderRadius: '10px' }}>
        🏢 Admin de Acopio
      </Badge>
    );
  }

  return <span className="text-muted">—</span>;
};

interface AdminUsuariosViewProps {
  usuarios: UsuarioExtended[];
  loadingUsuarios: boolean;
  stats: { total: number; activos: number; donantes: number; logistica: number } | null;
  filtros: { rol: string; region: string; comuna: string };
  setFiltros: React.Dispatch<React.SetStateAction<{ rol: string; region: string; comuna: string }>>;
  pageInfo: { page: number; size: number; totalElements: number; totalPages: number };
  setPageInfo: React.Dispatch<React.SetStateAction<{ page: number; size: number; totalElements: number; totalPages: number }>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedUserIds: number[];
  setSelectedUserIds: React.Dispatch<React.SetStateAction<number[]>>;
  userToDelete: UsuarioExtended | null;
  setUserToDelete: React.Dispatch<React.SetStateAction<UsuarioExtended | null>>;
  userToEdit: UsuarioExtended | null;
  setUserToEdit: React.Dispatch<React.SetStateAction<UsuarioExtended | null>>;
  handleToggleActivo: () => Promise<void>;
  selectAllUsers: () => void;
  deselectAllUsers: () => void;
  selectUser: (id: number) => void;
  deselectUser: (id: number) => void;
  rolOptions: { value: string; label: string }[];
  fetchUsuariosActualizados: () => void;
}

export const AdminUsuariosView: React.FC<AdminUsuariosViewProps> = ({
  usuarios,
  loadingUsuarios,
  stats,
  filtros,
  setFiltros,
  pageInfo,
  setPageInfo,
  searchTerm,
  setSearchTerm,
  selectedUserIds,
  setSelectedUserIds,
  userToDelete,
  setUserToDelete,
  userToEdit,
  setUserToEdit,
  handleToggleActivo,
  selectAllUsers,
  deselectAllUsers,
  selectUser,
  deselectUser,
  rolOptions,
  fetchUsuariosActualizados
}) => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>👥 Usuarios y Empresas</h4>
          <p className="text-muted mb-0">Gestiona los usuarios registrados en la plataforma</p>
        </div>
        <Button variant="primary" onClick={() => setUserToEdit({} as UsuarioExtended)} style={{ borderRadius: '12px' }}>
          ✨ Crear Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Card className="border-0 shadow text-center py-3" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #6c63ff 0%, #483dff 100%)' }}>
              <h3 className="fw-bold text-white mb-0">{stats.total}</h3>
              <small className="text-white fw-semibold opacity-75">Total Usuarios</small>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow text-center py-3" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)' }}>
              <h3 className="fw-bold text-white mb-0">{stats.activos}</h3>
              <small className="text-white fw-semibold opacity-75">Usuarios Activos</small>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow text-center py-3" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <h3 className="fw-bold text-white mb-0">{stats.donantes}</h3>
              <small className="text-white fw-semibold opacity-75">Donantes</small>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow text-center py-3" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)' }}>
              <h3 className="fw-bold text-white mb-0">{stats.logistica}</h3>
              <small className="text-white fw-semibold opacity-75">Logística</small>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-3">
          <Row className="g-2">
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Región"
                value={filtros.region}
                onChange={e => setFiltros(prev => ({ ...prev, region: e.target.value, page: 0 }))}
              />
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Comuna"
                value={filtros.comuna}
                onChange={e => setFiltros(prev => ({ ...prev, comuna: e.target.value, page: 0 }))}
              />
            </Col>
            <Col md={3}>
              <Select
                options={rolOptions}
                value={rolOptions.find(o => o.value === filtros.rol)}
                onChange={o => setFiltros(prev => ({ ...prev, rol: o?.value || '', page: 0 }))}
                placeholder="Filtrar por Rol"
                isClearable
              />
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Buscar por RUT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Acciones Masivas */}
      {selectedUserIds.length > 0 && (
        <div className="bg-primary bg-opacity-10 text-primary px-4 py-3 rounded-4 mb-4 d-flex justify-content-between align-items-center shadow-sm">
          <span className="fw-semibold">✅ {selectedUserIds.length} usuario(s) seleccionado(s)</span>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" size="sm" onClick={async () => { await actualizarEstadoMasivoUsuarios(selectedUserIds, false); setSelectedUserIds([]); fetchUsuariosActualizados(); }}>Desactivar Selección</Button>
            <Button variant="outline-success" size="sm" onClick={async () => { await actualizarEstadoMasivoUsuarios(selectedUserIds, true); setSelectedUserIds([]); fetchUsuariosActualizados(); }}>Reactivar Selección</Button>
          </div>
        </div>
      )}

      <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Table hover responsive className="align-middle mb-0">
          <thead style={{ backgroundColor: '#f8f9ff' }}>
            <tr>
              <th className="py-3 px-4" style={{ width: '40px' }}>
                <input 
                  type="checkbox"
                  className="form-check-input shadow-sm"
                  style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px', borderColor: '#8898aa', cursor: 'pointer' }}
                  checked={usuarios.length > 0 && selectedUserIds.length === usuarios.filter(u => u.rol !== 'ADMIN').length}
                  onChange={(e) => e.target.checked ? selectAllUsers() : deselectAllUsers()}
                />
              </th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Usuario</th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>RUT</th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Tipo</th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Rol</th>
              <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Ubicación</th>
              <th className="py-3 pe-4 text-end" style={{ color: '#6c63ff', fontWeight: 600 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingUsuarios ? (
              <tr><td colSpan={7} className="text-center py-5"><Spinner animation="border" variant="primary" /></td></tr>
            ) : usuarios.map((u) => (
              <tr key={u.id}>
                <td className="px-4">
                  {u.rol !== 'ADMIN' && (
                    <input 
                      type="checkbox"
                      className="form-check-input shadow-sm"
                      style={{ width: '1.2rem', height: '1.2rem', borderWidth: '2px', borderColor: '#8898aa', cursor: 'pointer' }}
                      checked={selectedUserIds.includes(Number(u.id))}
                      onChange={(e) => e.target.checked ? selectUser(Number(u.id)) : deselectUser(Number(u.id))}
                    />
                  )}
                </td>
                <td>
                  <div className="fw-semibold" style={{ color: '#333' }}>{u.nombreCompleto || u.razonSocial || '—'}</div>
                  <small className="text-muted">{u.email}</small>
                </td>
                <td>{u.rut || '—'}</td>
                <td>
                  {renderTipoUsuario(u)}
                </td>
                <td>
                  <Badge bg={getRolBadgeColor(u.rol)} className="px-3 py-2" style={{ borderRadius: '20px' }}>{u.rol}</Badge>
                </td>
                <td>
                  {u.comuna && u.region ? <small className="text-muted">{u.comuna}, {u.region}</small> : <span className="text-muted">—</span>}
                </td>
                <td className="pe-4 text-end">
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => setUserToEdit(u)}>📝</Button>
                  {u.rol !== 'ADMIN' && (
                    <Button
                      variant={u.activo === false ? 'outline-success' : 'outline-danger'}
                      size="sm"
                      onClick={() => setUserToDelete(u)}
                    >
                      {u.activo === false ? 'Reactivar' : 'Desactivar'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-4 mb-2">
        <small className="text-muted">Mostrando {usuarios.length} de {pageInfo.totalElements} registros</small>
        <div className="d-flex gap-2 align-items-center">
          <Form.Select size="sm" style={{ width: '80px', borderRadius: '10px' }} value={pageInfo.size} onChange={(e) => setPageInfo(prev => ({ ...prev, size: Number(e.target.value), page: 0 }))}>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </Form.Select>
          <div className="d-flex gap-1">
            <Button size="sm" variant="outline-secondary" disabled={pageInfo.page === 0} onClick={() => setPageInfo(prev => ({ ...prev, page: prev.page - 1 }))}>Anterior</Button>
            <Button size="sm" variant="outline-primary" disabled={pageInfo.page >= pageInfo.totalPages - 1} onClick={() => setPageInfo(prev => ({ ...prev, page: prev.page + 1 }))}>Siguiente</Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal show={!!userToDelete} onHide={() => setUserToDelete(null)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: userToDelete?.activo === false ? '#198754' : '#dc3545' }}>
            {userToDelete?.activo === false ? '✅ Reactivar Usuario' : '⚠️ Desactivar Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          {userToDelete?.activo === false
            ? <>¿Estás seguro de que deseas <strong>reactivar</strong> a <strong>{userToDelete?.nombreCompleto || userToDelete?.razonSocial || 'este usuario'}</strong>?<br/><br/>El usuario podrá volver a iniciar sesión en el sistema.</>
            : <>¿Estás seguro de que deseas <strong>desactivar</strong> a <strong>{userToDelete?.nombreCompleto || userToDelete?.razonSocial || 'este usuario'}</strong>?<br/><br/>El usuario no podrá iniciar sesión, pero mantendremos su historial en el sistema.</>  
          }
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="light" onClick={() => setUserToDelete(null)}>Cancelar</Button>
          <Button
            variant={userToDelete?.activo === false ? 'success' : 'danger'}
            onClick={handleToggleActivo}
          >
            {userToDelete?.activo === false ? 'Reactivar Cuenta' : 'Desactivar Cuenta'}
          </Button>
        </Modal.Footer>
      </Modal>

      <AdminEditUserModal
        show={!!userToEdit && Object.keys(userToEdit).length > 0}
        onHide={() => setUserToEdit(null)}
        usuario={userToEdit}
        onSuccess={fetchUsuariosActualizados}
        usuarios={usuarios}
      />

      <Modal 
        show={!!userToEdit && Object.keys(userToEdit).length === 0} 
        onHide={() => setUserToEdit(null)} 
        size="lg" 
        centered
        contentClassName="border-0 shadow-lg overflow-hidden"
        style={{ borderRadius: '16px' }}
      >
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
           <Modal.Header closeButton closeVariant="white" className="border-0 pb-0">
             <Modal.Title className="fw-bold text-white">✨ Crear Nuevo Usuario Operativo</Modal.Title>
           </Modal.Header>
           <Modal.Body className="p-4 pt-2">
             <AdminUserForm onUserCreated={() => {
                setUserToEdit(null);
                fetchUsuariosActualizados();
             }} />
           </Modal.Body>
        </div>
      </Modal>
    </div>
  );
};

