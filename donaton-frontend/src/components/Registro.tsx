import React, { useState } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { registrarDonante } from '../services/usuarioService';

const Registro: React.FC = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!nombre || !email || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      await registrarDonante({ email, password });
      
      setSuccess('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch {
      setError('Ocurrió un error al registrarse. Puede que el correo ya esté en uso.');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 rounded-4 animate__animated animate__fadeInUp">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-dark">Únete a Donatón</h3>
                  <p className="text-muted">Crea tu cuenta como Donante y ayuda a quienes más lo necesitan.</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleRegister}>
                  <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label className="fw-semibold">Nombre Completo</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Ej. Juan Pérez" 
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="fw-semibold">Correo Electrónico</Form.Label>
                    <Form.Control 
                      type="email" 
                      placeholder="ejemplo@correo.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="py-2"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="formBasicPassword">
                    <Form.Label className="fw-semibold">Contraseña</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="py-2"
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm mb-3">
                    Registrarse
                  </Button>
                </Form>

                <div className="text-center mt-3">
                  <span className="text-muted">¿Ya tienes una cuenta? </span>
                  <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                    Inicia Sesión
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Registro;
