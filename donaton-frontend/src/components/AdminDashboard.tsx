import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Tabs, Tab, Form, Alert, Spinner } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { obtenerUsuarios, registrarUsuarioAdmin } from '../services/usuarioService';
import { listarDonaciones, type DonacionResponse } from '../services/donacionService';
import { obtenerNecesidades, type Necesidad } from '../services/bffService';
import type { Usuario } from '../context/AuthContext';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
};

const getEstadoBadgeColor = (estado: string) => {
  if (estado === 'RECIBIDO') return 'success';
  if (estado === 'EN TRANSITO') return 'primary';
  return 'warning';
};

const getRolBadgeColor = (rol: string) => {
  if (rol === 'ADMIN') return 'dark';
  if (rol === 'COORDINADOR') return 'danger';
  if (rol === 'LOGISTICA') return 'primary';
  return 'success';
};

const AdminDashboard: React.FC = () => {
  const [key, setKey] = useState<string>('donaciones');

  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.448, -70.669]);
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevoUserEmail, setNuevoUserEmail] = useState('');
  const [nuevoUserPass, setNuevoUserPass] = useState('');
  const [nuevoUserRol, setNuevoUserRol] = useState('');
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

  const [loadingDonaciones, setLoadingDonaciones] = useState(false);
  const [loadingNecesidades, setLoadingNecesidades] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  useEffect(() => {
    const cargarDonaciones = async () => {
      setLoadingDonaciones(true);
      try {
        const data = await listarDonaciones();
        setDonaciones(data);
      } catch (e) {
        console.error(e);
      }
      setLoadingDonaciones(false);
    };

    const cargarNecesidades = async () => {
      setLoadingNecesidades(true);
      try {
        const data = await obtenerNecesidades();
        setNecesidades(data);
        if (data.length > 0) {
          setMapCenter([data[0].latitud, data[0].longitud]);
        }
      } catch (e) {
        console.error(e);
      }
      setLoadingNecesidades(false);
    };

    const cargarUsuarios = async () => {
      setLoadingUsuarios(true);
      try {
        const data = await obtenerUsuarios();
        setUsuarios(data);
      } catch (e) {
        console.error(e);
      }
      setLoadingUsuarios(false);
    };

    if (key === 'donaciones') cargarDonaciones();
    if (key === 'necesidades') cargarNecesidades();
    if (key === 'usuarios') cargarUsuarios();
  }, [key]);

  const handleCreateUser = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!nuevoUserEmail || !nuevoUserPass || !nuevoUserRol) {
      setUserMsg({ type: 'danger', text: 'Completa todos los campos' });
      return;
    }
    try {
      await registrarUsuarioAdmin({ email: nuevoUserEmail, password: nuevoUserPass, rol: nuevoUserRol as any });
      setUserMsg({ type: 'success', text: 'Usuario creado exitosamente. Recarga para ver cambios.' });
      setNuevoUserEmail('');
      setNuevoUserPass('');
      setNuevoUserRol('');
    } catch (err) {
      console.error(err);
      setUserMsg({ type: 'danger', text: 'Error al crear usuario' });
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary">Panel de Administrador</h2>
          <p className="text-muted mb-0">Control total del sistema Donatón</p>
        </div>
      </div>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Tabs
            id="admin-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k || 'donaciones')}
            className="mb-4 bg-light p-3 border-bottom rounded-top"
          >
            <Tab eventKey="donaciones" title="📦 Historial Donaciones">
              <div className="p-4">
                {loadingDonaciones ? <Spinner animation="border" /> : (
                  <Table hover responsive className="align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Recurso</th>
                        <th>Origen</th>
                        <th>Estado</th>
                        <th>Acopio de Recepción</th>
                        <th>Tracking ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donaciones.map((d: DonacionResponse & { acopioRecepcion?: string }) => (
                        <tr key={d.id}>
                          <td>#{d.id}</td>
                          <td className="fw-semibold">{d.cantidad}x {d.recurso}</td>
                          <td>{d.origen}</td>
                          <td>
                            <Badge bg={getEstadoBadgeColor(d.estado)}>
                              {d.estado}
                            </Badge>
                          </td>
                          <td>{d.acopioRecepcion || <span className="text-muted">Aún no recepcionado</span>}</td>
                          <td><code className="text-dark bg-light px-2 py-1 rounded">{d.trackingId}</code></td>
                        </tr>
                      ))}
                      {donaciones.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-4">No hay donaciones registradas</td></tr>
                      )}
                    </tbody>
                  </Table>
                )}
              </div>
            </Tab>

            <Tab eventKey="necesidades" title="🗺️ Necesidades y Mapa">
              <div className="p-4">
                <Row>
                  <Col md={5} className="mb-4 mb-md-0">
                    <h5 className="fw-bold mb-3">Lista de Necesidades</h5>
                    {loadingNecesidades ? <Spinner animation="border" /> : (
                      <div className="list-group shadow-sm">
                        {necesidades.map((n) => (
                          <div key={n.id} className="list-group-item p-3 border-0 border-bottom">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <Badge bg="danger">{n.tipoEmergencia || 'General'}</Badge>
                              <small className="text-muted">{n.fechaReporte?.substring(0, 10)}</small>
                            </div>
                            <p className="mb-2 fw-semibold text-dark">{n.recursos}</p>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => setMapCenter([n.latitud, n.longitud])}
                              className="w-100"
                            >
                              📍 Ver ubicación en mapa
                            </Button>
                          </div>
                        ))}
                        {necesidades.length === 0 && (
                          <div className="p-3 text-center text-muted">No hay necesidades reportadas</div>
                        )}
                      </div>
                    )}
                  </Col>
                  <Col md={7}>
                    <div className="border rounded-4 overflow-hidden shadow-sm h-100" style={{ minHeight: '500px' }}>
                      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater center={mapCenter} />
                        {necesidades.map(n => (
                          <Marker key={n.id} position={[n.latitud, n.longitud]}>
                            <Popup>
                              <strong>{n.tipoEmergencia || 'Alerta'}</strong><br/>
                              {n.recursos}
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  </Col>
                </Row>
              </div>
            </Tab>

            <Tab eventKey="usuarios" title="👥 Gestión Usuarios">
              <div className="p-4">
                <Row>
                  <Col lg={8}>
                    <h5 className="fw-bold mb-3">Usuarios Registrados</h5>
                    {loadingUsuarios ? <Spinner animation="border" /> : (
                      <Table hover responsive className="align-middle border shadow-sm rounded overflow-hidden">
                        <thead className="table-light">
                          <tr>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usuarios.map((u: Usuario & { email?: string }) => (
                            <tr key={u.id}>
                              <td className="fw-semibold">{u.email}</td>
                              <td>
                                <Badge bg={getRolBadgeColor(u.rol)}>
                                  {u.rol}
                                </Badge>
                              </td>
                              <td><span className="text-success">●</span> Activo</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </Col>
                  
                  <Col lg={4}>
                    <Card className="shadow-sm border-0 bg-light">
                      <Card.Body className="p-4">
                        <h5 className="fw-bold mb-3">Crear Usuario Operativo</h5>
                        {userMsg && <Alert variant={userMsg.type} onClose={() => setUserMsg(null)} dismissible>{userMsg.text}</Alert>}
                        
                        <Form onSubmit={handleCreateUser}>
                          <Form.Group className="mb-3">
                            <Form.Label>Correo Electrónico</Form.Label>
                            <Form.Control type="email" value={nuevoUserEmail} onChange={e => setNuevoUserEmail(e.target.value)} />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control type="password" value={nuevoUserPass} onChange={e => setNuevoUserPass(e.target.value)} />
                          </Form.Group>
                          <Form.Group className="mb-4">
                            <Form.Label>Rol del Sistema</Form.Label>
                            <Form.Select value={nuevoUserRol} onChange={e => setNuevoUserRol(e.target.value)}>
                              <option value="">Selecciona un rol...</option>
                              <option value="LOGISTICA">Logística</option>
                              <option value="COORDINADOR">Coordinador</option>
                            </Form.Select>
                            <Form.Text className="text-muted">Los donantes se registran solos.</Form.Text>
                          </Form.Group>
                          <Button variant="primary" type="submit" className="w-100 fw-bold">Registrar Usuario</Button>
                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;
