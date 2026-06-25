import React, { useEffect, useState } from 'react';
import { Card, Table, Spinner, Badge, Alert, Button, Modal, Row, Col } from 'react-bootstrap';
import { listarDonaciones, type DonacionResponse } from '../../services/donacionService';
import { obtenerCentrosAcopio, type CentroAcopio } from '../../services/logisticaService';
import { obtenerUsuarios } from '../../services/usuarioService';
import { useAuth, type Usuario } from '../../context/AuthContext';

interface Props {
  refreshTrigger: number;
}

const getEstadoBadge = (estado?: string) => {
  if (estado === 'RECIBIDO') return 'success';
  if (estado === 'EN TRANSITO') return 'primary';
  if (estado === 'Cancelado') return 'danger';
  return 'warning';
};

// Roles que siempre pueden ver el ID de seguimiento
const ROLES_VER_TRACKING = new Set(['ADMIN', 'LOGISTICA', 'COORDINADOR']);

const canSeeTracking = (usuario: any, donacion: DonacionResponse): boolean => {
  if (!usuario) return false;
  if (ROLES_VER_TRACKING.has(usuario.rol)) return true;
  // El donante solo puede ver el tracking de SUS propias donaciones
  if (usuario.rol === 'DONANTE' && donacion.donanteId === Number(usuario.id)) return true;
  return false;
};

const canSeeDonor = (usuario: any): boolean => {
  if (!usuario) return false;
  return ROLES_VER_TRACKING.has(usuario.rol);
};

const formatDetailValue = (value: string | number | boolean): string => {
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
};

const DetailRow = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
  if (value === null || value === undefined || value === '' || value === 0) return null;
  return (
    <Row className="mb-2 py-2 border-bottom">
      <Col xs={5} className="text-muted fw-semibold small">{label}</Col>
      <Col xs={7} className="fw-bold small text-break">{formatDetailValue(value)}</Col>
    </Row>
  );
};

export const DonacionList: React.FC<Props> = ({ refreshTrigger }) => {
  const { usuario } = useAuth();
  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [centros, setCentros] = useState<CentroAcopio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDonacion, setSelectedDonacion] = useState<DonacionResponse | null>(null);
  const [usuariosMap, setUsuariosMap] = useState<Record<number, Usuario>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const centrosData = await obtenerCentrosAcopio().catch(e => {
          console.error("Error centros:", e);
          return [];
        });
        setCentros(centrosData);

        try {
          const usuariosPage = await obtenerUsuarios({ size: 1000 });
          const userMap: Record<number, Usuario> = {};
          usuariosPage.content.forEach((u: Usuario) => {
            if (u.id) userMap[Number(u.id)] = u;
          });
          setUsuariosMap(userMap);
        } catch (e) {
          console.error("Error usuarios:", e);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [usuario]);

  const getDonanteName = (donanteId?: number) => {
    if (!donanteId || !usuariosMap[donanteId]) return 'Donante solidario';
    const u = usuariosMap[donanteId];
    if (u.tipoPersona === 'Jurídica' && u.razonSocial) return u.razonSocial;
    if (u.nombreCompleto) return u.nombreCompleto;
    return u.nombre || 'Donante solidario';
  };

  useEffect(() => {
    const fetchDonaciones = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listarDonaciones();
        const misDonaciones = usuario?.rol === 'DONANTE'
          ? data.filter(d => d.donanteId === Number(usuario.id))
          : data;
        setDonaciones(misDonaciones);
      } catch (err) {
        console.error("Error en fetchDonaciones:", err);
        setError('Ocurrió un error al cargar las donaciones.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonaciones();
  }, [refreshTrigger, usuario]);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-secondary">Cargando donaciones...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <Card className="shadow-sm border-0 mt-5 mb-5">
        <Card.Header className="bg-white border-0 pt-4 pb-0">
          <Card.Title className="fw-bold fs-4 text-primary">Historial de Donaciones</Card.Title>
        </Card.Header>
        <Card.Body>
          {donaciones.length === 0 ? (
            <Alert variant="info" className="text-center">
              Aún no hay donaciones registradas en el sistema.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>ID de Seguimiento</th>
                    <th>Título / Nombre</th>
                    <th>Recursos</th>
                    <th>Estado</th>
                    <th>Fecha de Registro</th>
                    <th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {donaciones.map((donacion) => (
                    <tr key={donacion.id}>
                      <td className="fw-bold font-monospace text-primary">
                        {canSeeTracking(usuario, donacion) ? (donacion.trackingId || '-') : <span className="text-muted fst-italic">No disponible</span>}
                      </td>
                      <td>{donacion.nombreArticulo || 'Varias Donaciones'}</td>
                      <td>{(() => {
                        try {
                          const recs = JSON.parse(donacion.recursos || '[]');
                          if (!Array.isArray(recs) || recs.length === 0) return <span className="text-muted fst-italic">Sin recursos</span>;
                          const subcats = recs.map((r: any) => r.subCategoria || r.recurso || r.categoria).filter(Boolean);
                          return subcats.join(', ');
                        } catch {
                          return '-';
                        }
                      })()}</td>
                      <td>
                        <Badge bg={getEstadoBadge(donacion.estado)}>
                          {donacion.estado || 'REGISTRADA'}
                        </Badge>
                      </td>
                      <td>
                        {donacion.fechaRegistro
                          ? new Date(donacion.fechaRegistro).toLocaleString('es-CL')
                          : 'Reciente'}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="rounded-pill px-3"
                          onClick={() => setSelectedDonacion(donacion)}
                        >
                          <i className="bi bi-eye me-1"></i> Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal de Detalle */}
      <Modal
        show={!!selectedDonacion}
        onHide={() => setSelectedDonacion(null)}
        centered
        size="lg"
        scrollable
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary fs-5">
            <i className="bi bi-box-seam me-2"></i>
            Detalle de Donación #{selectedDonacion?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pt-3">
          {selectedDonacion && (
            <>
              {/* Identificación */}
              <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: '#f8f9ff', border: '1px solid #e0e7ff' }}>
                <h6 className="text-primary fw-bold mb-3"><i className="bi bi-fingerprint me-2"></i>Identificación</h6>
                <DetailRow label="ID de Registro" value={`#${selectedDonacion.id}`} />
                {canSeeTracking(usuario, selectedDonacion) && (
                  <DetailRow label="ID de Seguimiento" value={selectedDonacion.trackingId} />
                )}
                {!canSeeTracking(usuario, selectedDonacion) && (
                  <Row className="mb-2 py-2 border-bottom">
                    <Col xs={5} className="text-muted fw-semibold small">ID de Seguimiento</Col>
                    <Col xs={7} className="text-muted fst-italic small">🔒 Solo visible para el donante y el equipo de logística</Col>
                  </Row>
                )}
                <DetailRow label="Estado" value={selectedDonacion.estado || 'REGISTRADA'} />
                <DetailRow label="Visibilidad" value={selectedDonacion.visibilidad === 'Privada' ? '🔒 Anónima' : '🌍 Pública'} />
                <DetailRow label="Fecha de Registro" value={selectedDonacion.fechaRegistro ? new Date(selectedDonacion.fechaRegistro).toLocaleString('es-CL') : 'Reciente'} />
              </div>

              {/* Descripción del artículo */}
              <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: '#f8fff8', border: '1px solid #d1fae5' }}>
                <h6 className="text-success fw-bold mb-3"><i className="bi bi-tags me-2"></i>Descripción del Artículo</h6>
                {canSeeDonor(usuario) && selectedDonacion.donanteId && (
                  <DetailRow label="Donante" value={selectedDonacion.visibilidad === 'Privada' ? `${getDonanteName(selectedDonacion.donanteId)} (Anónimo en público)` : getDonanteName(selectedDonacion.donanteId)} />
                )}
                <DetailRow label="Título de la Donación" value={selectedDonacion.nombreArticulo || 'Sin título'} />
                <DetailRow label="Descripción General" value={selectedDonacion.descripcion} />
                <DetailRow label="Requiere Transporte Especial" value={selectedDonacion.transporteEspecial} />
                
                <h6 className="mt-4 mb-2 fw-bold text-success">Recursos Donados</h6>
                {(() => {
                  try {
                    const recs = JSON.parse(selectedDonacion.recursos || '[]');
                    if (Array.isArray(recs)) {
                      return (
                        <div className="table-responsive">
                          <Table size="sm" bordered hover className="bg-white">
                            <thead className="table-success">
                              <tr>
                                <th>Categoría</th>
                                <th>Recurso</th>
                                <th>Estado</th>
                                <th>Cant.</th>
                                <th>Vencimiento</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recs.map((r: any, idx: number) => (
                                <tr key={`${r.categoria}-${r.subCategoria}-${idx}`}>
                                  <td>{r.categoria}</td>
                                  <td>{r.subCategoria}</td>
                                  <td>{r.estadoArticulo}</td>
                                  <td>{r.cantidad} {r.unidadMedida}</td>
                                  <td>{r.fechaVencimiento || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      );
                    } else {
                      return <span className="text-muted fst-italic">No hay recursos en esta donación.</span>;
                    }
                  } catch (e) {
                    console.error('Error parseando recursos:', e);
                    return <span className="text-muted">Error al leer recursos</span>;
                  }
                })()}
              </div>

              {/* Entrega */}
              <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: '#fffbf0', border: '1px solid #fde68a' }}>
                <h6 className="text-warning fw-bold mb-3"><i className="bi bi-truck me-2"></i>Información de Entrega</h6>
                <DetailRow label="Modalidad" value={selectedDonacion.modalidadEntrega} />
                {selectedDonacion.modalidadEntrega === 'Acopio' && (() => {
                  const centro = centros.find(c => c.id === selectedDonacion.centroAcopioDestinoId);
                  return centro ? (
                    <>
                      <DetailRow label="Centro de Acopio" value={centro.nombre} />
                      <DetailRow label="Dirección" value={`${centro.direccion}, ${centro.comuna}, ${centro.region}`} />
                    </>
                  ) : (
                    <DetailRow label="Centro de Acopio ID" value={selectedDonacion.centroAcopioDestinoId} />
                  );
                })()}
                {selectedDonacion.modalidadEntrega === 'Retiro' && (
                  <>
                    <DetailRow label="Región de Retiro" value={selectedDonacion.regionRetiro} />
                    <DetailRow label="Comuna de Retiro" value={selectedDonacion.comunaRetiro} />
                    <DetailRow label="Dirección de Retiro" value={selectedDonacion.direccionRetiro} />
                    <DetailRow label="Disponibilidad Horaria" value={selectedDonacion.disponibilidadHoraria} />
                  </>
                )}
              </div>

              {/* Foto si existe */}
              {selectedDonacion.fotoBase64 && (
                <div className="mb-3 p-3 rounded-3" style={{ backgroundColor: '#fdf4ff', border: '1px solid #e9d5ff' }}>
                  <h6 className="text-purple fw-bold mb-3" style={{ color: '#7c3aed' }}><i className="bi bi-image me-2"></i>Fotografía</h6>
                  <img
                    src={selectedDonacion.fotoBase64}
                    alt="Foto de la donación"
                    className="img-fluid rounded-3 shadow-sm"
                    style={{ maxHeight: '250px', objectFit: 'cover', width: '100%' }}
                  />
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" className="rounded-pill px-4" onClick={() => setSelectedDonacion(null)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

