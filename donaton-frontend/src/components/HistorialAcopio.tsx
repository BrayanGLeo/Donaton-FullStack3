import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { obtenerInventario, type InventarioItem } from '../services/logisticaService';

const HistorialAcopio: React.FC = () => {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const data = await obtenerInventario();
        setInventario(data);
      } catch (err) {
        console.error("Error al obtener inventario:", err);
        setError("No se pudo cargar el historial de acopio. Por favor, intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventario();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando el estado del acopio...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold text-primary display-5">Historial de Acopio</h2>
        <p className="text-muted lead">
          Mira el impacto de tus donaciones y de toda la comunidad. 
          Estos son los recursos que ya han sido recibidos en nuestros centros.
        </p>
      </div>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {!error && inventario.length === 0 ? (
        <Alert variant="info" className="text-center shadow-sm">
          Aún no hay recursos registrados en los centros de acopio. ¡Sé el primero en donar!
        </Alert>
      ) : (
        <Row className="g-4">
          {inventario.map((item) => (
            <Col key={item.id} xs={12} md={6} lg={4}>
              <Card className="h-100 shadow-sm border-0 bg-white">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                  <div 
                    className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <span className="fs-1">📦</span>
                  </div>
                  <Card.Title className="fw-bold fs-4 mb-3 text-dark">
                    {item.recurso}
                  </Card.Title>
                  <Card.Text as="div" className="w-100">
                    <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                      <span className="text-muted fw-semibold">Total Recibido</span>
                      <Badge bg="success" pill className="fs-5 px-3 py-2">
                        {item.cantidadTotal}
                      </Badge>
                    </div>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default HistorialAcopio;
