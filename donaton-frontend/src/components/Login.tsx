import React, { useState } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol, Usuario } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa correo y contraseña.');
      return;
    }

    let rolSimulado: Rol = 'DONANTE';
    let nombreSimulado = 'Juan Donante';

    if (email.includes('logistica')) {
      rolSimulado = 'LOGISTICA';
      nombreSimulado = 'María Logística';
    } else if (email.includes('coordinador')) {
      rolSimulado = 'COORDINADOR';
      nombreSimulado = 'Carlos Coordinador';
    } else if (email.includes('admin')) {
      rolSimulado = 'ADMIN';
      nombreSimulado = 'Administrador Sistema';
    }

    const usuarioSimulado: Usuario = {
      id: Date.now(),
      nombre: nombreSimulado,
      rol: rolSimulado
    };

    const fakeToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.simulated_${rolSimulado}_token`;
    
    login(fakeToken, usuarioSimulado);
    
    if (rolSimulado === 'ADMIN') {
      navigate('/admin');
    } else if (rolSimulado === 'COORDINADOR') {
      navigate('/dashboard');
    } else if (rolSimulado === 'LOGISTICA') {
      navigate('/logistica');
    } else {
      navigate('/mis-donaciones');
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
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                    ♥
                  </div>
                  <h3 className="fw-bold text-dark">Bienvenido de vuelta</h3>
                  <p className="text-muted">Inicia sesión en el Sistema Donatón</p>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label className="fw-semibold">Correo Electrónico</Form.Label>
                    <Form.Control 
                      type="email" 
                      placeholder="ejemplo@correo.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="py-2"
                    />
                    <Form.Text className="text-muted">
                      💡 Tip: Usa "admin@", "logistica@" o "coordinador@" para cambiar de rol.
                    </Form.Text>
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
                    Ingresar
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
