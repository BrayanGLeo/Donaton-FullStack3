import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { confirmarIngresoAcopio } from '../services/logisticaService';
import axios from 'axios';

const ControlIngreso: React.FC = () => {
  const [trackingId, setTrackingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      await confirmarIngresoAcopio(trackingId);
      setSuccess('Ingreso confirmado: El stock está disponible en inventario.');
      setTrackingId('');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setError('Donación no encontrada');
      } else {
        setError('Ocurrió un error al confirmar el ingreso.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title as="h2" className="mb-4 text-center">Control de Ingreso en Centro de Acopio</Card.Title>
          
          {success && <Alert variant="success">{success}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="trackingId">
              <Form.Label>ID de Seguimiento (Tracking ID)</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                placeholder="Ej. TRK-DON-123"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant="primary" size="lg" type="submit" disabled={loading || !trackingId.trim()}>
                {loading ? 'Confirmando...' : 'Confirmar Ingreso'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ControlIngreso;
