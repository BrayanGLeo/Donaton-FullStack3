import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { listarDonaciones, type DonacionResponse } from '../services/donacionService';
import { Eye, EyeOff, Heart, Package } from 'lucide-react';

const HistorialAcopio: React.FC = () => {
  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonaciones = async () => {
      try {
        const data = await listarDonaciones();
        // Solo mostramos donaciones con estado RECIBIDO en el historial público
        const donacionesRecibidas = data.filter(d => d.estado === 'RECIBIDO');
        setDonaciones(donacionesRecibidas);
      } catch (err) {
        console.error('Error al obtener historial:', err);
        setError('No se pudo cargar el historial de acopio. Por favor, intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonaciones();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando el historial solidario...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary display-5">Muro Solidario</h2>
        <p className="text-muted lead">
          Estas son las donaciones que ya llegaron a sus destinos. Gracias a cada persona que aportó.
        </p>
      </div>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {!error && donaciones.length === 0 ? (
        <Alert variant="info" className="text-center shadow-sm">
          Aún no hay donaciones recibidas en el historial. ¡Sé el primero en donar!
        </Alert>
      ) : (
        <Row className="g-4">
          {donaciones.map((donacion) => {
            const esPrivada = donacion.visibilidad === 'Privada';
            return (
              <Col key={donacion.id} xs={12} md={6} lg={4}>
                <Card className="h-100 shadow-sm border-0 bg-white">
                  {donacion.fotoBase64 && !esPrivada && (
                    <Card.Img
                      variant="top"
                      src={donacion.fotoBase64}
                      style={{ height: '180px', objectFit: 'cover' }}
                    />
                  )}
                  <Card.Body className="d-flex flex-column p-4">
                    {/* Header con categoría */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div
                        className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '48px', height: '48px', flexShrink: 0 }}
                      >
                        <Package size={22} className="text-primary" />
                      </div>
                      <Badge
                        bg={esPrivada ? 'secondary' : 'success'}
                        className="d-flex align-items-center gap-1"
                      >
                        {esPrivada ? <EyeOff size={12} /> : <Eye size={12} />}
                        {esPrivada ? 'Anónima' : 'Pública'}
                      </Badge>
                    </div>

                    {/* Categoría y descripción */}
                    <Card.Title className="fw-bold fs-5 mb-1 text-dark">
                      {donacion.categoria || 'Donación'}{donacion.recurso ? ` · ${donacion.recurso}` : ''}
                    </Card.Title>

                    {donacion.descripcion && (
                      <Card.Text className="text-muted small mb-3" style={{ flexGrow: 1 }}>
                        {donacion.descripcion.length > 120
                          ? `${donacion.descripcion.substring(0, 120)}...`
                          : donacion.descripcion}
                      </Card.Text>
                    )}

                    {/* Cantidad */}
                    <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
                      <span className="text-muted fw-semibold small">Cantidad</span>
                      <Badge bg="primary" pill className="px-3 py-1">
                        {donacion.cantidad} {donacion.unidadMedida || ''}
                      </Badge>
                    </div>

                    {/* Donante */}
                    <div className="d-flex align-items-center gap-2 mt-auto border-top pt-3">
                      <Heart size={16} className={esPrivada ? 'text-secondary' : 'text-danger'} />
                      {esPrivada ? (
                        <span className="text-muted small fst-italic">Donante anónimo/a</span>
                      ) : (
                        <span className="text-dark small fw-semibold">
                          {donacion.nombreDonante || 'Donante solidario/a'}
                        </span>
                      )}
                    </div>

                    {/* Fecha */}
                    {donacion.fechaRegistro && (
                      <small className="text-muted mt-1">
                        {new Date(donacion.fechaRegistro).toLocaleDateString('es-CL', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </small>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default HistorialAcopio;
