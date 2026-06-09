import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Alert, Spinner, Nav, InputGroup, Dropdown } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { obtenerUsuarios, registrarUsuarioAdmin, obtenerCentrosAcopioPorRegion, type CentroAcopio } from '../services/usuarioService';
import { listarDonaciones, actualizarEstadoDonacion, type DonacionResponse } from '../services/donacionService';
import { obtenerNecesidades, type Necesidad } from '../services/bffService';
import type { Usuario } from '../context/AuthContext';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../utils/chileData';
import { COUNTRY_CODES } from '../utils/countryCodes';
import { validarRutChileno, validarNombres, validarTelefono, validarPassword, validarEmailDominio } from '../utils/validators';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const necesidadIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
};

const ESTADOS_DONACION = ['Pendiente', 'EN TRANSITO', 'RECIBIDO', 'Cancelado'];

const getEstadoBadgeColor = (estado: string) => {
  if (estado === 'RECIBIDO') return 'success';
  if (estado === 'EN TRANSITO') return 'primary';
  if (estado === 'Cancelado') return 'danger';
  return 'warning';
};

const getRolBadgeColor = (rol: string) => {
  if (rol === 'ADMIN') return 'dark';
  if (rol === 'COORDINADOR') return 'danger';
  if (rol === 'LOGISTICA') return 'primary';
  return 'success';
};

type AdminSection = 'donaciones' | 'mapa' | 'usuarios';

interface UsuarioExtended extends Usuario {
  email?: string;
  tipoPersona?: string;
  nombreCompleto?: string;
  razonSocial?: string;
  rut?: string;
  telefono?: string;
  region?: string;
  comuna?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
}

const validateUserForm = (data: any) => {
  const newErrors: Record<string, string> = {};

  if (!data.nuevoUserEmail) newErrors.email = 'El correo es requerido.';
  else if (!validarEmailDominio(data.nuevoUserEmail)) newErrors.email = 'Por favor ingresa un correo válido (ej: usuario@gmail.com).';

  if (!data.nuevoUserPass) newErrors.pass = 'La contraseña es requerida.';
  else if (!validarPassword(data.nuevoUserPass)) newErrors.pass = 'La contraseña debe incluir al menos 3 letras y 3 números.';

  if (!data.nuevoUserRol) newErrors.rol = 'El rol es requerido.';
  
  if (data.nuevoUserRol === 'LOGISTICA' && !data.nuevoUserSubRol) {
    newErrors.subRol = 'Debes seleccionar el tipo de personal.';
  }

  if (data.nuevoUserRol === 'COORDINADOR' || (data.nuevoUserRol === 'LOGISTICA' && data.nuevoUserSubRol)) {
    if (!data.nuevoUserNombre) newErrors.nombre = 'El nombre es requerido.';
    else if (!validarNombres(data.nuevoUserNombre)) newErrors.nombre = 'El nombre es requerido.';

    if (!data.nuevoUserApellido) newErrors.apellido = 'El apellido es requerido.';
    else if (!validarNombres(data.nuevoUserApellido)) newErrors.apellido = 'El apellido es requerido.';

    if (!data.nuevoUserRut) newErrors.rut = 'El RUT es requerido.';
    else if (!validarRutChileno(data.nuevoUserRut)) newErrors.rut = 'El RUT ingresado no es válido. (Ej: 12345678-9)';

    if (!data.nuevoUserTelefono) newErrors.telefono = 'El teléfono es requerido.';
    else if (!validarTelefono(data.nuevoUserTelefono)) newErrors.telefono = 'El teléfono debe tener entre 9 y 12 dígitos.';

    if (!data.nuevoUserRegion || !data.nuevoUserComuna || !COMUNAS_POR_REGION[data.nuevoUserRegion]?.includes(data.nuevoUserComuna)) {
      newErrors.regionComuna = 'Debes seleccionar una región y comuna válida.';
    }

    if (!data.nuevoUserDireccion || data.nuevoUserDireccion.trim().length < 5) {
      newErrors.direccion = 'Debes ingresar una dirección válida.';
    }
    
    if (data.nuevoUserRol === 'LOGISTICA') {
      if (data.nuevoUserSubRol === 'CONDUCTOR') {
        if (!data.nuevoUserTipoVehiculo) newErrors.tipoVehiculo = 'Selecciona el tipo de vehículo.';
        if (!data.nuevoUserMatricula) newErrors.matricula = 'Ingresa la matrícula del vehículo.';
      } else if (data.nuevoUserSubRol === 'RECEPCIONISTA') {
        if (!data.nuevoUserRegionAcopio) newErrors.regionAcopio = 'Selecciona la región del centro de acopio.';
        if (!data.nuevoUserCentroAcopioId) newErrors.centroAcopioId = 'Selecciona un centro de acopio.';
      }
    }
  }

  return newErrors;
};

const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('donaciones');

  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioExtended[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.448, -70.669]);

  const [nuevoUserEmail, setNuevoUserEmail] = useState('');
  const [nuevoUserPass, setNuevoUserPass] = useState('');
  const [nuevoUserRol, setNuevoUserRol] = useState('');
  const [nuevoUserNombre, setNuevoUserNombre] = useState('');
  const [nuevoUserApellido, setNuevoUserApellido] = useState('');
  const [nuevoUserRut, setNuevoUserRut] = useState('');
  const [nuevoUserTelefono, setNuevoUserTelefono] = useState('');
  const [nuevoUserCodigoPais, setNuevoUserCodigoPais] = useState('+56');
  const [nuevoUserRegion, setNuevoUserRegion] = useState('');
  const [nuevoUserComuna, setNuevoUserComuna] = useState('');
  const [nuevoUserDireccion, setNuevoUserDireccion] = useState('');
  const [nuevoUserSubRol, setNuevoUserSubRol] = useState('');
  const [nuevoUserTipoVehiculo, setNuevoUserTipoVehiculo] = useState('');
  const [nuevoUserMatricula, setNuevoUserMatricula] = useState('');
  const [nuevoUserRegionAcopio, setNuevoUserRegionAcopio] = useState('');
  const [nuevoUserCentroAcopioId, setNuevoUserCentroAcopioId] = useState<number | ''>('');
  
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>([]);
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [filtroRut, setFiltroRut] = useState('');

  const [loadingDonaciones, setLoadingDonaciones] = useState(false);
  const [loadingMapa, setLoadingMapa] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [updatingEstado, setUpdatingEstado] = useState<number | null>(null);

  useEffect(() => {
    if (activeSection === 'donaciones') {
      setLoadingDonaciones(true);
      listarDonaciones()
        .then(setDonaciones)
        .catch(console.error)
        .finally(() => setLoadingDonaciones(false));
    }
    if (activeSection === 'mapa') {
      setLoadingMapa(true);
      Promise.all([obtenerUsuarios(), obtenerNecesidades()])
        .then(([users, necs]) => {
          setUsuarios(users);
          setNecesidades(necs);
        })
        .catch(console.error)
        .finally(() => setLoadingMapa(false));
    }
    if (activeSection === 'usuarios') {
      setLoadingUsuarios(true);
      obtenerUsuarios()
        .then((data) => setUsuarios(data))
        .catch(console.error)
        .finally(() => setLoadingUsuarios(false));
    }
  }, [activeSection]);

  const handleCambiarEstado = async (id: number, nuevoEstado: string) => {
    setUpdatingEstado(id);
    try {
      const updated = await actualizarEstadoDonacion(id, nuevoEstado);
      setDonaciones(prev => prev.map(d => d.id === id ? { ...d, estado: updated.estado } : d));
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
    setUpdatingEstado(null);
  };

  useEffect(() => {
    if (nuevoUserRegionAcopio && nuevoUserSubRol === 'RECEPCIONISTA') {
      obtenerCentrosAcopioPorRegion(nuevoUserRegionAcopio).then(setCentrosAcopio);
    } else {
      setCentrosAcopio([]);
    }
  }, [nuevoUserRegionAcopio, nuevoUserSubRol]);

  const handleCreateUser = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    const newErrors = validateUserForm({
      nuevoUserEmail, nuevoUserPass, nuevoUserRol, nuevoUserSubRol,
      nuevoUserNombre, nuevoUserApellido, nuevoUserRut, nuevoUserTelefono, nuevoUserRegion,
      nuevoUserComuna, nuevoUserDireccion, nuevoUserTipoVehiculo,
      nuevoUserMatricula, nuevoUserRegionAcopio, nuevoUserCentroAcopioId
    });

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setUserMsg({ type: 'danger', text: 'Por favor, corrige los errores en el formulario.' });
      return;
    }

    setFormErrors({});

    try {
      const requestData: any = { 
        email: nuevoUserEmail, 
        password: nuevoUserPass, 
        rol: nuevoUserRol,
        nombreCompleto: `${nuevoUserNombre.trim()} ${nuevoUserApellido.trim()}`,
        rut: nuevoUserRut,
        telefono: `${nuevoUserCodigoPais}${nuevoUserTelefono}`,
        region: nuevoUserRegion,
        comuna: nuevoUserComuna,
        direccion: nuevoUserDireccion
      };

      if (nuevoUserRol === 'LOGISTICA') {
        requestData.subRol = nuevoUserSubRol;
        if (nuevoUserSubRol === 'CONDUCTOR') {
          requestData.tipoVehiculo = nuevoUserTipoVehiculo;
          requestData.matricula = nuevoUserMatricula;
        } else if (nuevoUserSubRol === 'RECEPCIONISTA') {
          requestData.centroAcopioId = nuevoUserCentroAcopioId === '' ? null : Number(nuevoUserCentroAcopioId);
        }
      }

      await registrarUsuarioAdmin(requestData);
      setUserMsg({ type: 'success', text: 'Usuario creado exitosamente.' });
      setNuevoUserEmail('');
      setNuevoUserPass('');
      setNuevoUserRol('');
      setNuevoUserNombre('');
      setNuevoUserApellido('');
      setNuevoUserRut('');
      setNuevoUserTelefono('');
      setNuevoUserRegion('');
      setNuevoUserComuna('');
      setNuevoUserDireccion('');
      setNuevoUserSubRol('');
      setNuevoUserTipoVehiculo('');
      setNuevoUserMatricula('');
      setNuevoUserRegionAcopio('');
      setNuevoUserCentroAcopioId('');
      const data = await obtenerUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
      setUserMsg({ type: 'danger', text: 'Error al crear usuario. Puede que el correo ya exista.' });
    }
  };

  const usuariosConCoordenadas = usuarios.filter(u => u.latitud && u.longitud);

  const renderDonaciones = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>📦 Gestión de Donaciones</h4>
          <p className="text-muted mb-0">Cambia el estado de cada donación con un clic</p>
        </div>
        <Badge bg="primary" pill className="fs-6 px-3 py-2">{donaciones.length} registros</Badge>
      </div>

      {loadingDonaciones ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Cargando donaciones...</p></div>
      ) : (
        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <Table hover responsive className="align-middle mb-0">
            <thead style={{ backgroundColor: '#f8f9ff' }}>
              <tr>
                <th className="py-3 px-4" style={{ color: '#6c63ff', fontWeight: 600 }}>ID</th>
                <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Recurso</th>
                <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Origen</th>
                <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Tracking</th>
                <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Estado</th>
                <th className="py-3 pe-4" style={{ color: '#6c63ff', fontWeight: 600 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {donaciones.map((d: DonacionResponse & { acopioRecepcion?: string }) => (
                <tr key={d.id} style={{ transition: 'background 0.2s' }}>
                  <td className="px-4 fw-semibold text-muted">#{d.id}</td>
                  <td>
                    <span className="fw-semibold">{d.cantidad}x</span>{' '}
                    <span style={{ color: '#333' }}>{d.recurso}</span>
                  </td>
                  <td className="text-muted">{d.origen}</td>
                  <td>
                    <code className="bg-light text-dark px-2 py-1 rounded" style={{ fontSize: '0.85rem' }}>{d.trackingId}</code>
                  </td>
                  <td>
                    <Badge
                      bg={getEstadoBadgeColor(d.estado)}
                      className="px-3 py-2"
                      style={{ fontSize: '0.8rem', borderRadius: '20px' }}
                    >
                      {d.estado}
                    </Badge>
                  </td>
                  <td className="pe-4">
                    {updatingEstado === d.id ? (
                      <Spinner animation="border" size="sm" variant="primary" />
                    ) : (
                      <Form.Select
                        size="sm"
                        value={d.estado}
                        onChange={(e) => handleCambiarEstado(d.id, e.target.value)}
                        style={{ width: '160px', borderRadius: '10px', border: '2px solid #e0e0e0', fontWeight: 500 }}
                      >
                        {ESTADOS_DONACION.map(est => (
                          <option key={est} value={est}>{est}</option>
                        ))}
                      </Form.Select>
                    )}
                  </td>
                </tr>
              ))}
              {donaciones.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-5">
                    <div style={{ fontSize: '3rem' }}>📭</div>
                    <p className="text-muted mt-2">No hay donaciones registradas aún</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );

  const renderMapa = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>🗺️ Mapa de Logística</h4>
          <p className="text-muted mb-0">Ubicaciones de donantes y necesidades activas</p>
        </div>
        <div>
          <Badge bg="primary" pill className="me-2 px-3 py-2">🔵 {usuariosConCoordenadas.length} Donantes</Badge>
          <Badge bg="danger" pill className="px-3 py-2">🔴 {necesidades.length} Necesidades</Badge>
        </div>
      </div>

      {loadingMapa ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Cargando mapa...</p></div>
      ) : (
        <Row>
          <Col lg={4} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px', maxHeight: '600px', overflowY: 'auto' }}>
              <Card.Body className="p-0">
                <div className="p-3 border-bottom" style={{ backgroundColor: '#f8f9ff' }}>
                  <h6 className="fw-bold mb-0" style={{ color: '#6c63ff' }}>📍 Puntos en el mapa</h6>
                </div>

                {usuariosConCoordenadas.map((u) => (
                  <button
                    key={`user-${u.id}`}
                    type="button"
                    className="p-3 border-bottom border-0 bg-transparent text-start w-100 d-block"
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0f0ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                    onClick={() => setMapCenter([u.latitud!, u.longitud!])}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Badge bg="primary" style={{ fontSize: '0.7rem' }}>Donante</Badge>
                      <Badge bg={getRolBadgeColor(u.rol)} style={{ fontSize: '0.7rem' }}>{u.rol}</Badge>
                    </div>
                    <p className="mb-1 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{u.nombreCompleto || u.razonSocial || u.email || 'Sin nombre'}</p>
                    <small className="text-muted">{u.comuna}, {u.region}</small>
                  </button>
                ))}

                {necesidades.map((n) => (
                  <button
                    key={`nec-${n.id}`}
                    type="button"
                    className="p-3 border-bottom border-0 bg-transparent text-start w-100 d-block"
                    style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff0f0')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                    onClick={() => setMapCenter([n.latitud, n.longitud])}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Badge bg="danger" style={{ fontSize: '0.7rem' }}>{n.tipoEmergencia || 'Necesidad'}</Badge>
                      <small className="text-muted">{n.fechaReporte?.substring(0, 10)}</small>
                    </div>
                    <p className="mb-0 fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{n.recursos}</p>
                  </button>
                ))}

                {usuariosConCoordenadas.length === 0 && necesidades.length === 0 && (
                  <div className="text-center p-4 text-muted">No hay puntos para mostrar</div>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col lg={8}>
            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '16px' }}>
              <div style={{ height: '600px' }}>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapUpdater center={mapCenter} />

                  {usuariosConCoordenadas.map(u => (
                    <Marker key={`user-marker-${u.id}`} position={[u.latitud!, u.longitud!]} icon={userIcon}>
                      <Popup>
                        <strong>{u.nombreCompleto || u.razonSocial || 'Donante'}</strong><br/>
                        <small>{u.email}</small><br/>
                        <Badge bg="primary" style={{ fontSize: '0.7rem' }}>{u.rol}</Badge>
                        {u.direccion && <><br/><small className="text-muted">{u.direccion}</small></>}
                      </Popup>
                    </Marker>
                  ))}

                  {necesidades.map(n => (
                    <Marker key={`nec-marker-${n.id}`} position={[n.latitud, n.longitud]} icon={necesidadIcon}>
                      <Popup>
                        <strong>{n.tipoEmergencia || 'Necesidad'}</strong><br/>
                        {n.recursos}
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

  const renderUsuarios = () => {
    const usuariosFiltrados = usuarios.filter(u => 
      filtroRut ? (u.rut?.toLowerCase().includes(filtroRut.toLowerCase())) : true
    );

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: '#1a1a2e' }}>👥 Usuarios y Empresas</h4>
            <p className="text-muted mb-0">Gestiona los usuarios registrados en la plataforma</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Form.Control
              type="text"
              placeholder="Buscar por RUT..."
              value={filtroRut}
              onChange={(e) => setFiltroRut(e.target.value)}
              style={{ width: '250px', borderRadius: '20px' }}
            />
            <Badge bg="success" pill className="fs-6 px-3 py-2">{usuariosFiltrados.length} usuarios</Badge>
          </div>
        </div>

      {loadingUsuarios ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="mt-2 text-muted">Cargando usuarios...</p></div>
      ) : (
        <Row>
          <Col lg={8} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <Table hover responsive className="align-middle mb-0">
                <thead style={{ backgroundColor: '#f8f9ff' }}>
                  <tr>
                    <th className="py-3 px-4" style={{ color: '#6c63ff', fontWeight: 600 }}>Usuario</th>
                    <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>RUT</th>
                    <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Tipo</th>
                    <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Rol</th>
                    <th className="py-3" style={{ color: '#6c63ff', fontWeight: 600 }}>Ubicación</th>
                    <th className="py-3 pe-4" style={{ color: '#6c63ff', fontWeight: 600 }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4">
                        <div className="fw-semibold" style={{ color: '#333' }}>{u.nombreCompleto || u.razonSocial || '—'}</div>
                        <small className="text-muted">{u.email}</small>
                      </td>
                      <td>{u.rut || '—'}</td>
                      <td>
                        {u.tipoPersona ? (
                          <Badge bg={u.tipoPersona === 'NATURAL' ? 'info' : 'secondary'} className="px-2 py-1" style={{ borderRadius: '10px', fontSize: '0.75rem' }}>
                            {u.tipoPersona === 'NATURAL' ? '👤 Natural' : '🏢 Jurídica'}
                          </Badge>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        <Badge bg={getRolBadgeColor(u.rol)} className="px-3 py-2" style={{ borderRadius: '20px', fontSize: '0.8rem' }}>
                          {u.rol}
                        </Badge>
                      </td>
                      <td>
                        {u.comuna && u.region ? (
                          <small className="text-muted">{u.comuna}, {u.region}</small>
                        ) : <span className="text-muted">—</span>}
                      </td>
                      <td className="pe-4">
                        <span className="text-success fw-bold">● Activo</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3 text-white">✨ Crear Usuario Operativo</h5>
                {userMsg && <Alert variant={userMsg.type} onClose={() => setUserMsg(null)} dismissible className="py-2">{userMsg.text}</Alert>}

                <Form noValidate onSubmit={handleCreateUser}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white-50 small">Rol del Sistema</Form.Label>
                    <Form.Select
                      value={nuevoUserRol}
                      onChange={e => { setNuevoUserRol(e.target.value); setNuevoUserSubRol(''); setFormErrors(prev => ({...prev, rol: ''})); }}
                      style={{ borderRadius: '10px', border: 'none' }}
                      isInvalid={!!formErrors.rol}
                    >
                      <option value="">Selecciona un rol...</option>
                      <option value="LOGISTICA">🚛 Logística</option>
                      <option value="COORDINADOR">📋 Coordinador</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{formErrors.rol}</Form.Control.Feedback>
                  </Form.Group>

                  {nuevoUserRol && (
                    <div style={{ maxHeight: '450px', overflowY: 'auto', overflowX: 'hidden', paddingRight: '10px' }} className="mb-3 custom-scrollbar">
                      
                      {nuevoUserRol === 'LOGISTICA' && (
                        <Form.Group className="mb-3">
                          <Form.Label className="text-white-50 small">Tipo de Personal</Form.Label>
                          <Form.Select
                            value={nuevoUserSubRol}
                            onChange={e => { setNuevoUserSubRol(e.target.value); setFormErrors(prev => ({...prev, subRol: ''})); }}
                            style={{ borderRadius: '10px', border: 'none' }}
                            isInvalid={!!formErrors.subRol}
                          >
                            <option value="">Selecciona una opción...</option>
                            <option value="CONDUCTOR">🚗 Conductor</option>
                            <option value="RECEPCIONISTA">🏢 Recepcionista</option>
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{formErrors.subRol}</Form.Control.Feedback>
                        </Form.Group>
                      )}

                      {(nuevoUserRol === 'COORDINADOR' || (nuevoUserRol === 'LOGISTICA' && nuevoUserSubRol !== '')) && (
                        <>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-2">
                                <Form.Label className="text-white-50 small mb-0">Nombres</Form.Label>
                                <Form.Control type="text" size="sm" value={nuevoUserNombre} onChange={e => { setNuevoUserNombre(e.target.value); setFormErrors(prev => ({...prev, nombre: ''})); }} placeholder="Ej: Juan" isInvalid={!!formErrors.nombre} />
                                <Form.Control.Feedback type="invalid">{formErrors.nombre}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group className="mb-2">
                                <Form.Label className="text-white-50 small mb-0">Apellidos</Form.Label>
                                <Form.Control type="text" size="sm" value={nuevoUserApellido} onChange={e => { setNuevoUserApellido(e.target.value); setFormErrors(prev => ({...prev, apellido: ''})); }} placeholder="Ej: Pérez" isInvalid={!!formErrors.apellido} />
                                <Form.Control.Feedback type="invalid">{formErrors.apellido}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                          </Row>
                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small mb-0">RUT</Form.Label>
                            <Form.Control type="text" size="sm" value={nuevoUserRut} onChange={e => { setNuevoUserRut(e.target.value); setFormErrors(prev => ({...prev, rut: ''})); }} placeholder="Ej: 12.345.678-9" isInvalid={!!formErrors.rut} />
                            <Form.Control.Feedback type="invalid">{formErrors.rut}</Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small mb-0">Teléfono</Form.Label>
                            <InputGroup size="sm">
                              <Dropdown>
                                <Dropdown.Toggle variant="outline-light" id="dropdown-country" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                                  {COUNTRY_CODES.find(c => c.code === nuevoUserCodigoPais)?.flag} {nuevoUserCodigoPais}
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                  {COUNTRY_CODES.map((country) => (
                                    <Dropdown.Item key={country.name} onClick={() => setNuevoUserCodigoPais(country.code)} title={country.name}>
                                      {country.flag} {country.name} ({country.code})
                                    </Dropdown.Item>
                                  ))}
                                </Dropdown.Menu>
                              </Dropdown>
                              <Form.Control type="text" value={nuevoUserTelefono} onChange={e => { setNuevoUserTelefono(e.target.value); setFormErrors(prev => ({...prev, telefono: ''})); }} placeholder="Ej: 912345678" style={{ backgroundColor: '#fff', color: '#000' }} isInvalid={!!formErrors.telefono} />
                              <Form.Control.Feedback type="invalid">{formErrors.telefono}</Form.Control.Feedback>
                            </InputGroup>
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small mb-0">Región de Residencia</Form.Label>
                            <Form.Select size="sm" value={nuevoUserRegion} onChange={e => { setNuevoUserRegion(e.target.value); setNuevoUserComuna(''); setFormErrors(prev => ({...prev, regionComuna: ''})); }} isInvalid={!!formErrors.regionComuna}>
                              <option value="">Seleccione una región...</option>
                              {REGIONES_CHILE.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                          
                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small mb-0">Comuna de Residencia</Form.Label>
                            <Form.Select size="sm" value={nuevoUserComuna} onChange={e => { setNuevoUserComuna(e.target.value); setFormErrors(prev => ({...prev, regionComuna: ''})); }} disabled={!nuevoUserRegion} isInvalid={!!formErrors.regionComuna}>
                              <option value="">Seleccione una comuna...</option>
                              {nuevoUserRegion && COMUNAS_POR_REGION[nuevoUserRegion]?.map((c: string) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">{formErrors.regionComuna}</Form.Control.Feedback>
                          </Form.Group>

                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small mb-0">Dirección de Residencia</Form.Label>
                            <Form.Control type="text" size="sm" value={nuevoUserDireccion} onChange={e => { setNuevoUserDireccion(e.target.value); setFormErrors(prev => ({...prev, direccion: ''})); }} placeholder="Ej: Alameda 123" isInvalid={!!formErrors.direccion} />
                            <Form.Control.Feedback type="invalid">{formErrors.direccion}</Form.Control.Feedback>
                          </Form.Group>

                          {/* Campos Específicos para Conductor */}
                          {nuevoUserSubRol === 'CONDUCTOR' && (
                            <div className="p-3 my-3" style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
                              <h6 className="text-info fw-bold mb-3" style={{ fontSize: '0.85rem' }}><i className="bi bi-truck me-2"></i>Datos del Vehículo</h6>
                              <Form.Group className="mb-2">
                                <Form.Label className="text-white-50 small mb-0">Tipo de Vehículo</Form.Label>
                                <Form.Select size="sm" value={nuevoUserTipoVehiculo} onChange={e => { setNuevoUserTipoVehiculo(e.target.value); setFormErrors(prev => ({...prev, tipoVehiculo: ''})); }} isInvalid={!!formErrors.tipoVehiculo}>
                                  <option value="">Seleccione...</option>
                                  <option value="auto">Auto</option>
                                  <option value="camioneta">Camioneta</option>
                                  <option value="camion">Camión</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{formErrors.tipoVehiculo}</Form.Control.Feedback>
                              </Form.Group>
                              <Form.Group className="mb-0">
                                <Form.Label className="text-white-50 small mb-0">Matrícula</Form.Label>
                                <Form.Control type="text" size="sm" value={nuevoUserMatricula} onChange={e => { setNuevoUserMatricula(e.target.value); setFormErrors(prev => ({...prev, matricula: ''})); }} placeholder="Ej: ABCD-12" isInvalid={!!formErrors.matricula} />
                                <Form.Control.Feedback type="invalid">{formErrors.matricula}</Form.Control.Feedback>
                              </Form.Group>
                            </div>
                          )}

                          {/* Campos Específicos para Recepcionista */}
                          {nuevoUserSubRol === 'RECEPCIONISTA' && (
                            <div className="p-3 my-3" style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
                              <h6 className="text-warning fw-bold mb-3" style={{ fontSize: '0.85rem' }}><i className="bi bi-building me-2"></i>Asignación de Centro de Acopio</h6>
                              <Form.Group className="mb-2">
                                <Form.Label className="text-white-50 small mb-0">Región del Acopio</Form.Label>
                                <Form.Select size="sm" value={nuevoUserRegionAcopio} onChange={e => { setNuevoUserRegionAcopio(e.target.value); setFormErrors(prev => ({...prev, regionAcopio: '', centroAcopioId: ''})); }} isInvalid={!!formErrors.regionAcopio}>
                                  <option value="">Seleccione la región...</option>
                                  {REGIONES_CHILE.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{formErrors.regionAcopio}</Form.Control.Feedback>
                              </Form.Group>
                              <Form.Group className="mb-0">
                                <Form.Label className="text-white-50 small mb-0">Centro de Acopio</Form.Label>
                                <Form.Select size="sm" value={nuevoUserCentroAcopioId} onChange={e => { setNuevoUserCentroAcopioId(e.target.value ? Number(e.target.value) : ''); setFormErrors(prev => ({...prev, centroAcopioId: ''})); }} disabled={!nuevoUserRegionAcopio} isInvalid={!!formErrors.centroAcopioId}>
                                  <option value="">Seleccione un centro...</option>
                                  {centrosAcopio.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre} ({c.comuna})</option>
                                  ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{formErrors.centroAcopioId}</Form.Control.Feedback>
                                {!nuevoUserRegionAcopio && <Form.Text className="text-white-50" style={{ fontSize: '0.7rem' }}>Ingrese la región del acopio primero.</Form.Text>}
                              </Form.Group>
                            </div>
                          )}

                          <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

                          <h6 className="text-success fw-bold mb-3 mt-3" style={{ fontSize: '0.85rem' }}><i className="bi bi-shield-lock me-2"></i>Credenciales de Acceso</h6>

                          <Form.Group className="mb-2">
                            <Form.Label className="text-white-50 small mb-0">Correo Electrónico</Form.Label>
                            <Form.Control type="email" size="sm" value={nuevoUserEmail} onChange={e => { setNuevoUserEmail(e.target.value); setFormErrors(prev => ({...prev, email: ''})); }} placeholder="usuario@ejemplo.com" isInvalid={!!formErrors.email} />
                            <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-white-50 small mb-0">Contraseña Provisional</Form.Label>
                            <Form.Control type="password" size="sm" value={nuevoUserPass} onChange={e => { setNuevoUserPass(e.target.value); setFormErrors(prev => ({...prev, pass: ''})); }} placeholder="••••••••" isInvalid={!!formErrors.pass} />
                            <Form.Control.Feedback type="invalid">{formErrors.pass}</Form.Control.Feedback>
                          </Form.Group>
                        </>
                      )}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-100 fw-bold py-2 mt-2"
                    disabled={!nuevoUserRol || (nuevoUserRol === 'LOGISTICA' && !nuevoUserSubRol)}
                    style={{ borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', color: '#fff' }}
                  >
                    Registrar Usuario
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
    );
  };

  return (
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
                onClick={() => setActiveSection('donaciones')}
                className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                style={{
                  color: activeSection === 'donaciones' ? '#fff' : 'rgba(255,255,255,0.6)',
                  backgroundColor: activeSection === 'donaciones' ? 'rgba(108, 99, 255, 0.3)' : 'transparent',
                  border: activeSection === 'donaciones' ? '1px solid rgba(108, 99, 255, 0.5)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  fontWeight: activeSection === 'donaciones' ? 600 : 400,
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>📦</span>
                <span>Donaciones</span>
              </Nav.Link>

              <Nav.Link
                onClick={() => setActiveSection('mapa')}
                className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                style={{
                  color: activeSection === 'mapa' ? '#fff' : 'rgba(255,255,255,0.6)',
                  backgroundColor: activeSection === 'mapa' ? 'rgba(108, 99, 255, 0.3)' : 'transparent',
                  border: activeSection === 'mapa' ? '1px solid rgba(108, 99, 255, 0.5)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  fontWeight: activeSection === 'mapa' ? 600 : 400,
                }}
              >
                <span style={{ fontSize: '1.3rem' }}>🗺️</span>
                <span>Mapa Logístico</span>
              </Nav.Link>

              <Nav.Link
                onClick={() => setActiveSection('usuarios')}
                className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                style={{
                  color: activeSection === 'usuarios' ? '#fff' : 'rgba(255,255,255,0.6)',
                  backgroundColor: activeSection === 'usuarios' ? 'rgba(108, 99, 255, 0.3)' : 'transparent',
                  border: activeSection === 'usuarios' ? '1px solid rgba(108, 99, 255, 0.5)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  fontWeight: activeSection === 'usuarios' ? 600 : 400,
                }}
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

        <Col md={9} lg={10} className="p-4" style={{ backgroundColor: '#f5f6fa' }}>
          {activeSection === 'donaciones' && renderDonaciones()}
          {activeSection === 'mapa' && renderMapa()}
          {activeSection === 'usuarios' && renderUsuarios()}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
