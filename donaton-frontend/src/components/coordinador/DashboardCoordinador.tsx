import React, { useState } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import MapaNecesidades from './MapaNecesidades';
import PanelEntregasCoordinador from './PanelEntregasCoordinador';
import { CoordinadorOverview } from './CoordinadorOverview';

type CoordinadorSection = 'resumen' | 'alertas' | 'entregas';

const DashboardCoordinador: React.FC = () => {
  const [activeSection, setActiveSection] = useState<CoordinadorSection>('resumen');

  const getNavStyle = (section: CoordinadorSection) => ({
    color: activeSection === section ? '#fff' : 'rgba(255,255,255,0.6)',
    backgroundColor: activeSection === section ? 'rgba(108, 99, 255, 0.3)' : 'transparent',
    border: activeSection === section ? '1px solid rgba(108, 99, 255, 0.5)' : '1px solid transparent',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    fontWeight: activeSection === section ? 600 : 400,
  });

  return (
    <Container fluid className="px-0" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <Row className="g-0">
        <Col md={3} lg={2} style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          minHeight: 'calc(100vh - 120px)',
        }}>
          <div className="p-4">
            <div className="text-center mb-4">
              <div style={{ fontSize: '2.5rem' }}>🧑‍🏫</div>
              <h5 className="text-white fw-bold mt-2 mb-0">Coordinador</h5>
              <small className="text-white-50">Sistema Donatón</small>
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Nav className="flex-column gap-2">
              <Nav.Link
                onClick={() => setActiveSection('resumen')}
                className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                style={getNavStyle('resumen')}
              >
                <span style={{ fontSize: '1.3rem' }}>📊</span>
                <span>Resumen General</span>
              </Nav.Link>

              <Nav.Link
                onClick={() => setActiveSection('alertas')}
                className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                style={getNavStyle('alertas')}
              >
                <span style={{ fontSize: '1.3rem' }}>🗺️</span>
                <span>Gestión de Alertas</span>
              </Nav.Link>

              <Nav.Link
                onClick={() => setActiveSection('entregas')}
                className="d-flex align-items-center gap-3 px-3 py-3 rounded-3"
                style={getNavStyle('entregas')}
              >
                <span style={{ fontSize: '1.3rem' }}>🚚</span>
                <span>Entregas en Tránsito</span>
              </Nav.Link>
            </Nav>

            <hr style={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <div className="text-center mt-4">
              <small className="text-white-50" style={{ fontSize: '0.75rem' }}>
                Panel v2.0 · Donatón
              </small>
            </div>
          </div>
        </Col>

        <Col md={9} lg={10} className="p-4" style={{ backgroundColor: '#f5f6fa', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
          {activeSection === 'resumen' && (
            <CoordinadorOverview />
          )}
          {activeSection === 'alertas' && (
            <div className="bg-white p-4 shadow-sm" style={{ borderRadius: '16px' }}>
              <MapaNecesidades />
            </div>
          )}
          {activeSection === 'entregas' && (
            <div className="bg-white p-4 shadow-sm" style={{ borderRadius: '16px' }}>
              <PanelEntregasCoordinador />
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardCoordinador;
