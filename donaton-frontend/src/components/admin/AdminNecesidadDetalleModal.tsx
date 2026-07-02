import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { MapPin } from 'lucide-react';
import type { Necesidad } from '../../services/bffService';
import type { CentroAcopio } from '../../services/logisticaService';
import { RecursosDetalleTable } from '../common/RecursosDetalleTable';
import { formatEstado } from '../../utils/adminDashboardUtils';

interface AdminNecesidadDetalleModalProps {
  show: boolean;
  onHide: () => void;
  necesidadDetalle: Necesidad | null;
  centros: CentroAcopio[];
}

export const AdminNecesidadDetalleModal: React.FC<AdminNecesidadDetalleModalProps> = ({
  show,
  onHide,
  necesidadDetalle,
  centros
}) => {
  if (!necesidadDetalle) return null;

  let badgeColor = 'warning';
  const estadoFormateado = formatEstado(necesidadDetalle.estado);
  if (estadoFormateado === 'Cubierta') badgeColor = 'success';
  else if (estadoFormateado === 'En tránsito' || estadoFormateado === 'En progreso') badgeColor = 'primary';

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold" style={{ color: '#1a1a2e' }}>
          🚨 Detalles de la Necesidad
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="d-flex flex-column gap-3">
          <Row>
            <Col md={6}>
              <strong className="text-primary d-block mb-1">ID y Seguimiento</strong>
              <div className="bg-light p-2 rounded">
                <div><strong>ID:</strong> #{necesidadDetalle.id}</div>
                {necesidadDetalle.fechaReporte && <div><strong>Fecha Reporte:</strong> {new Date(necesidadDetalle.fechaReporte).toLocaleDateString()}</div>}
              </div>
            </Col>
            <Col md={6}>
              <strong className="text-primary d-block mb-1">Estado Actual</strong>
              <div className="bg-light p-2 rounded d-flex align-items-center">
                <Badge 
                  bg={badgeColor} 
                  className="fs-6 px-3 py-2" 
                  style={{ borderRadius: '10px' }}
                >
                  {estadoFormateado}
                </Badge>
              </div>
            </Col>
          </Row>

          <div>
            <strong className="text-primary d-block mb-1">Tipo de Emergencia</strong>
            <div className="bg-light p-2 rounded">
              {necesidadDetalle.tipoEmergencia || 'General'}
            </div>
          </div>

          <div>
            <strong className="text-primary d-block mb-1">Recursos Solicitados</strong>
            <div className="bg-light p-2 rounded">
              <RecursosDetalleTable recursos={necesidadDetalle.recursos || '[]'} />
            </div>
          </div>

          <div>
            <strong className="text-primary d-block mb-1">Ubicación y Logística</strong>
            <div className="bg-light p-2 rounded">
              <Row>
                <Col sm={6} className="mb-2 mb-sm-0">
                  <MapPin size={16} className="me-2 text-muted" />
                  <strong>Región:</strong> {necesidadDetalle.region || 'N/A'}<br/>
                  <span className="ms-4"><strong>Comuna:</strong> {necesidadDetalle.comuna || 'N/A'}</span>
                </Col>
                <Col sm={6}>
                  <strong>Centro de Acopio Asignado:</strong> {necesidadDetalle.centroAcopioId ? centros.find(c => c.id === necesidadDetalle.centroAcopioId)?.nombre || `ID: ${necesidadDetalle.centroAcopioId}` : 'No asignado'}
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="secondary" onClick={onHide} style={{ borderRadius: '10px' }}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};
