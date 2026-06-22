import React, { useEffect, useState } from 'react';
import { Card, Table, Spinner, Badge, Alert, Button, Modal, Row, Col } from 'react-bootstrap';
import { listarDonaciones, type DonacionResponse } from '../services/donacionService';
import { obtenerCentrosAcopio, type CentroAcopio } from '../services/logisticaService';
import { useAuth } from '../context/AuthContext';

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

  useEffect(() => {
    obtenerCentrosAcopio().then(setCentros).catch(() => {});
  }, []);

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
        console.error(err);
        setError('Ocurrió un error al cargar las donaciones.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonaciones();
  }, [refreshTrigger]);

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
                    <th>ID DB</th>
                    <th>ID Seguimiento</th>
                    <th>Recurso</th>
                    <th>Cantidad</th>
                    <th>Estado</th>
                    <th>Fecha de Registro</th>
                    <th>Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {donaciones.map((donacion) => (
                    <tr key={donacion.id}>
                      <td className="text-secondary">#{donacion.id}</td>
                      <td className="fw-bold font-monospace text-primary">
                        {canSeeTracking(usuario, donacion) ? (donacion.trackingId || '-') : <span className="text-muted fst-italic">No disponible</span>}
                      </td>
                      <td>{donacion.recurso}</td>
                      <td>{donacion.cantidad} {donacion.unidadMedida || ''}</td>
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
                {canSeeDonor(usuario) && selectedDonacion.nombreDonante && (
                  <DetailRow label="Donante" value={selectedDonacion.visibilidad === 'Privada' ? `${selectedDonacion.nombreDonante} (Anónimo en público)` : selectedDonacion.nombreDonante} />
                )}
                <DetailRow label="Categoría" value={selectedDonacion.categoria} />
                <DetailRow label="Descripción" value={selectedDonacion.descripcion} />
                <DetailRow label="Estado del Artículo" value={selectedDonacion.estadoArticulo} />
                <DetailRow label="Cantidad" value={`${selectedDonacion.cantidad} ${selectedDonacion.unidadMedida || ''}`} />
                <DetailRow label="Peso Aproximado" value={selectedDonacion.pesoAproximado ? `${selectedDonacion.pesoAproximado} kg` : undefined} />
                <DetailRow label="Fecha de Vencimiento" value={selectedDonacion.fechaVencimiento} />
                <DetailRow label="Requiere Transporte Especial" value={selectedDonacion.transporteEspecial} />
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
