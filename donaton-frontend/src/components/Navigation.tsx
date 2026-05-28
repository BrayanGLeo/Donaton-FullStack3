import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation: React.FC = () => {
  const { usuario, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="shadow-sm py-3">
      <Container>
        <Navbar.Brand as={Link as any} to="/" className="fw-bold fs-4 text-primary d-flex align-items-center gap-2">
          <span className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
            ♥
          </span>
          {' '}Donatón
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto ms-4">
            {!isAuthenticated && (
              <>
                <Nav.Link as={Link as any} to="/">Inicio</Nav.Link>
                <Nav.Link as={Link as any} to="/login">Iniciar Sesión</Nav.Link>
                <Nav.Link as={Link as any} to="/registro">Registrarse</Nav.Link>
              </>
            )}

            {isAuthenticated && usuario?.rol === 'DONANTE' && (
              <>
                <Nav.Link as={Link as any} to="/donar">Realizar Donación</Nav.Link>
                <Nav.Link as={Link as any} to="/mis-donaciones">Mis Donaciones</Nav.Link>
                <Nav.Link as={Link as any} to="/historial-acopio">Historial Acopio</Nav.Link>
              </>
            )}

            {isAuthenticated && usuario?.rol === 'LOGISTICA' && (
              <>
                <Nav.Link as={Link as any} to="/logistica">Panel Logístico</Nav.Link>
                <Nav.Link as={Link as any} to="/recepcion">Recepción Acopio</Nav.Link>
                <Nav.Link as={Link as any} to="/conductor">Panel Conductor</Nav.Link>
              </>
            )}

            {isAuthenticated && usuario?.rol === 'COORDINADOR' && (
              <>
                <Nav.Link as={Link as any} to="/dashboard">Dashboard Alertas</Nav.Link>
                <Nav.Link as={Link as any} to="/ingresar-necesidad">Ingresar Necesidad</Nav.Link>
              </>
            )}

            {isAuthenticated && usuario?.rol === 'ADMIN' && (
              <Nav.Link as={Link as any} to="/admin">Panel de Administrador</Nav.Link>
            )}
          </Nav>
          
          <Nav>
            {isAuthenticated && (
              <div className="d-flex align-items-center gap-3">
                <span className="text-light">
                  Hola, <strong>{usuario?.nombre}</strong> <span className="badge bg-secondary ms-1">{usuario?.rol}</span>
                </span>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </div>
            )}
            {!isAuthenticated && (
              <Link to="/donar" className="btn btn-primary rounded-pill px-4 fw-semibold">
                Quiero Donar
              </Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
