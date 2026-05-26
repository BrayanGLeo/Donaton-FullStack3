import React, { useState } from 'react';
import MapaNecesidades from './MapaNecesidades';
import { Container, Card, Alert, Form } from 'react-bootstrap';

const DashboardCoordinador: React.FC = () => {
  const [rol, setRol] = useState<string>('Coordinador'); // Por defecto 'Coordinador' para probar

  return (
    <Container className="my-4 p-0">
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="bg-white rounded">
          <Form.Group controlId="roleSelector">
            <Form.Label className="fw-bold text-secondary">Simulador de Rol (Prueba de Acceso)</Form.Label>
            <Form.Select 
              value={rol} 
              onChange={(e) => setRol(e.target.value)}
              className="w-auto"
            >
              <option value="Coordinador">Coordinador</option>
              <option value="Voluntario">Voluntario</option>
              <option value="Donante">Donante</option>
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      {rol === 'Coordinador' ? (
        <div className="animate__animated animate__fadeIn">
            <MapaNecesidades />
        </div>
      ) : (
        <Alert variant="danger" className="d-flex align-items-center animate__animated animate__headShake">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-shield-lock-fill me-3" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99A1.5 1.5 0 0 1 8 5z"/>
          </svg>
          <div>
            <strong>Acceso Denegado:</strong> No posees los permisos de "Coordinador" requeridos para visualizar el mapa de alertas y necesidades en terreno.
          </div>
        </Alert>
      )}
    </Container>
  );
};

export default DashboardCoordinador;
