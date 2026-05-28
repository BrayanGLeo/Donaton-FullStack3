import React, { useState } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import type { Rol, Usuario } from '../context/AuthContext';

interface AuthResponse {
  token: string;
  email: string;
  rol: Rol;
  id: number;
  nombreCompleto: string;
  subRol?: string;
  region?: string;
  centroAcopioId?: number;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor ingresa correo y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', { email, password });
      const data = response.data;
      
      const usuarioLogueado: Usuario = {
        id: data.id,
        nombre: data.nombreCompleto || data.email,
        email: data.email,
        rol: data.rol,
        subRol: data.subRol,
        region: data.region,
        centroAcopioId: data.centroAcopioId
      };

      login(data.token, usuarioLogueado);

      if (data.rol === 'ADMIN') {
        navigate('/admin');
      } else if (data.rol === 'COORDINADOR') {
        navigate('/dashboard');
      } else if (data.rol === 'LOGISTICA') {
        if (data.subRol === 'RECEPCIONISTA') {
          navigate('/recepcionista');
        } else if (data.subRol === 'CONDUCTOR') {
          navigate('/conductor');
        } else {
          navigate('/logistica');
        }
      } else {
        navigate('/mis-donaciones');
      }
      
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('Credenciales inválidas. Por favor, intenta nuevamente.');
      } else {
        setError('Ocurrió un error de conexión. Verifica que el servidor esté en línea.');
      }
    } finally {
      setLoading(false);
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
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm mb-3" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Ingresar'}
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
