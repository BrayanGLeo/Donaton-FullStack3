import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const { isAuthenticated, usuario } = useAuth();

  const getDashboardPath = () => {
    if (usuario?.rol === 'COORDINADOR') return '/dashboard';
    if (usuario?.rol === 'LOGISTICA') return '/logistica';
    return '/mis-donaciones';
  };

  return (
    <div className="landing-page">
      <div 
        className="hero-section text-white text-center d-flex flex-column justify-content-center align-items-center"
        style={{
          minHeight: '80vh',
          background: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url("https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80") center/cover',
          padding: '2rem'
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <div className="badge bg-primary rounded-pill mb-4 px-3 py-2 fs-6 fw-normal animate__animated animate__fadeInDown">
                Conectando Ayuda con Necesidad Real
              </div>
              <h1 className="display-2 fw-bolder mb-4 animate__animated animate__fadeInUp" style={{ letterSpacing: '-1px' }}>
                Juntos podemos hacer <br/> la <span className="text-primary">diferencia</span> hoy.
              </h1>
              <p className="lead fs-4 text-light mb-5 px-md-5 animate__animated animate__fadeInUp animate__delay-1s" style={{ opacity: 0.9 }}>
                Únete a la red más grande de logística humanitaria. Coordina, dona y rastrea la ayuda en tiempo real para quienes más lo necesitan en zonas de emergencia.
              </p>
              
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 animate__animated animate__fadeInUp animate__delay-2s">
                {isAuthenticated ? (
                  <Link to={getDashboardPath()} className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg">
                    Ir a mi Panel
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill fw-semibold">
                      Iniciar Sesión
                    </Link>
                    <Link to="/donar" className="btn btn-primary btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg">
                      Quiero Donar
                    </Link>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5 my-5">
        <Row className="text-center mb-5">
          <Col>
            <h2 className="fw-bold">Nuestra Plataforma</h2>
            <p className="text-muted">Herramientas tecnológicas para agilizar la ayuda humanitaria</p>
          </Col>
        </Row>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm rounded-4 text-center p-4 feature-card">
              <Card.Body>
                <div className="display-4 text-primary mb-3">📍</div>
                <Card.Title className="fw-bold">Monitoreo en Tiempo Real</Card.Title>
                <Card.Text className="text-muted">
                  Visualiza las necesidades exactas en zonas de emergencia a través de nuestros mapas interactivos satelitales.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm rounded-4 text-center p-4 feature-card">
              <Card.Body>
                <div className="display-4 text-primary mb-3">📦</div>
                <Card.Title className="fw-bold">Logística Transparente</Card.Title>
                <Card.Text className="text-muted">
                  Rastreo end-to-end de cada donación. Desde la recepción en el centro de acopio hasta su entrega final.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm rounded-4 text-center p-4 feature-card">
              <Card.Body>
                <div className="display-4 text-primary mb-3">🤝</div>
                <Card.Title className="fw-bold">Impacto Directo</Card.Title>
                <Card.Text className="text-muted">
                  Conectamos tu generosidad directamente con los centros de acopio autorizados sin intermediarios innecesarios.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LandingPage;
