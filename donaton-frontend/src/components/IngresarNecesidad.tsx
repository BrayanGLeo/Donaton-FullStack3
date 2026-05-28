import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ingresarNecesidad } from '../services/bffService';

const IngresarNecesidad: React.FC = () => {
  const [recursos, setRecursos] = useState('');
  const [tipoEmergencia, setTipoEmergencia] = useState('');
  const [latitud, setLatitud] = useState<number | ''>('');
  const [longitud, setLongitud] = useState<number | ''>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("La geolocalización no es soportada por tu navegador.");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitud(position.coords.latitude);
        setLongitud(position.coords.longitude);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setIsLoading(false);
        setError("Error al obtener la ubicación. Por favor, ingresa las coordenadas manualmente.");
        console.error(err);
      }
    );
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!recursos.trim() || latitud === '' || longitud === '') {
      setError("Por favor, completa todos los campos obligatorios (recursos y ubicación).");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await ingresarNecesidad({
        recursos,
        latitud: Number(latitud),
        longitud: Number(longitud),
        tipoEmergencia: tipoEmergencia || undefined
      });
      setSuccess(true);
      setRecursos('');
      setTipoEmergencia('');
      setLatitud('');
      setLongitud('');
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al registrar la necesidad. Inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5" style={{ maxWidth: '700px' }}>
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary display-6">Registrar Nueva Necesidad</h2>
        <p className="text-muted">
          Ingresa las solicitudes de ayuda y su ubicación exacta para alertar a los equipos.
        </p>
      </div>

      <Card className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-4 p-md-5">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
              ¡Necesidad registrada exitosamente! Ya aparecerá en el mapa de alertas.
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4" controlId="recursos">
              <Form.Label className="fw-semibold">Recursos Solicitados <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Ej. 50 raciones de comida, 100 litros de agua, carpas..."
                value={recursos}
                onChange={(e) => setRecursos(e.target.value)}
                disabled={isLoading}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="tipoEmergencia">
              <Form.Label className="fw-semibold">Tipo de Emergencia</Form.Label>
              <Form.Select
                value={tipoEmergencia}
                onChange={(e) => setTipoEmergencia(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Selecciona el tipo de emergencia (opcional)</option>
                <option value="Incendio">🔥 Incendio</option>
                <option value="Inundación">🌊 Inundación</option>
                <option value="Terremoto">🏚️ Terremoto</option>
                <option value="Corte de suministros">⚡ Corte de suministros</option>
                <option value="General">📍 Otro / General</option>
              </Form.Select>
            </Form.Group>

            <div className="bg-light p-4 rounded-3 mb-4 border">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Form.Label className="fw-semibold mb-0">Ubicación (Latitud / Longitud) <span className="text-danger">*</span></Form.Label>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={handleGetLocation}
                  disabled={isLoading}
                  className="rounded-pill px-3"
                >
                  📍 Usar mi ubicación actual
                </Button>
              </div>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="latitud" className="mb-3 mb-md-0">
                    <Form.Control
                      type="number"
                      step="any"
                      placeholder="Latitud (Ej. -33.448)"
                      value={latitud}
                      onChange={(e) => setLatitud(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={isLoading}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="longitud">
                    <Form.Control
                      type="number"
                      step="any"
                      placeholder="Longitud (Ej. -70.669)"
                      value={longitud}
                      onChange={(e) => setLongitud(e.target.value === '' ? '' : Number(e.target.value))}
                      disabled={isLoading}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg" 
                disabled={isLoading}
                className="py-3 rounded-pill fw-bold"
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Procesando...
                  </>
                ) : (
                  'Registrar Alerta'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default IngresarNecesidad;
