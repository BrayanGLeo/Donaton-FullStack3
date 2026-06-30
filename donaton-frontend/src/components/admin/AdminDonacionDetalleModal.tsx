import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Truck } from 'lucide-react';
import type { DonacionResponse } from '../../services/donacionService';
import type { CentroAcopio } from '../../services/logisticaService';
import { getEstadoBadgeColor } from '../../utils/adminDashboardUtils';
import { RecursosDetalleTable } from '../common/RecursosDetalleTable';

interface AdminDonacionDetalleModalProps {
  show: boolean;
  onHide: () => void;
  donacionDetalle: DonacionResponse | null;
  centros: CentroAcopio[];
}

export const AdminDonacionDetalleModal: React.FC<AdminDonacionDetalleModalProps> = ({
  show,
  onHide,
  donacionDetalle,
  centros
}) => {
  if (!donacionDetalle) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold" style={{ color: '#1a1a2e' }}>
          📦 Detalles de la Donación
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="d-flex flex-column gap-3">
          <Row>
            <Col md={6}>
              <strong className="text-primary d-block mb-1">ID y Seguimiento</strong>
              <div className="bg-light p-2 rounded">
                <div><strong>ID:</strong> #{donacionDetalle.id}</div>
                {donacionDetalle.trackingId && <div><strong>Tracking:</strong> {donacionDetalle.trackingId}</div>}
                {donacionDetalle.fechaRegistro && <div><strong>Fecha:</strong> {new Date(donacionDetalle.fechaRegistro).toLocaleDateString()}</div>}
              </div>
            </Col>
            <Col md={6}>
              <strong className="text-primary d-block mb-1">Estado Actual</strong>
              <div className="bg-light p-2 rounded d-flex align-items-center">
                <Badge bg={getEstadoBadgeColor(donacionDetalle.estado || '')} className="fs-6 px-3 py-2" style={{ borderRadius: '10px' }}>
                  {donacionDetalle.estado}
                </Badge>
              </div>
            </Col>
          </Row>

          <div>
            <strong className="text-primary d-block mb-1">Título de la Donación</strong>
            <div className="bg-light p-2 rounded">
              {donacionDetalle.nombreArticulo || 'Sin título'}
            </div>
          </div>

          <div>
            <strong className="text-primary d-block mb-1">Recursos Donados</strong>
            <div className="bg-light p-2 rounded">
              <RecursosDetalleTable recursos={donacionDetalle.recursos || '[]'} />
            </div>
          </div>

          <div>
            <strong className="text-primary d-block mb-1">Descripción</strong>
            <div className="bg-light p-2 rounded">{donacionDetalle.descripcion || 'Sin descripción detallada.'}</div>
          </div>

          <Row>
            <Col md={12}>
              <strong className="text-primary d-block mb-1">Visibilidad</strong>
              <div className="bg-light p-2 rounded">{donacionDetalle.visibilidad || 'Pública'}</div>
            </Col>
          </Row>

          <div>
            <strong className="text-primary d-block mb-1">Logística de Entrega</strong>
            <div className="bg-light p-2 rounded">
              <Row>
                <Col sm={6} className="mb-2 mb-sm-0">
                  <strong>Origen:</strong> {donacionDetalle.origen || 'N/A'}<br/>
                  <strong>Modalidad:</strong> {donacionDetalle.modalidadEntrega || 'N/A'}
                </Col>
                <Col sm={6}>
                  <strong>Centro de Acopio Destino:</strong> {donacionDetalle.centroAcopioDestinoId ? centros.find(c => c.id === donacionDetalle.centroAcopioDestinoId)?.nombre || `ID: ${donacionDetalle.centroAcopioDestinoId}` : 'N/A'}<br/>
                  <strong>Horario preferido:</strong> {donacionDetalle.disponibilidadHoraria || 'Cualquiera'}
                </Col>
              </Row>
            </div>
          </div>

          <div>
            <strong className="text-primary d-block mb-1">Dirección Exacta de Retiro</strong>
            <div className="bg-light p-2 rounded">
              <Truck size={16} className="me-2 text-muted" />
              {donacionDetalle.direccionRetiro || (donacionDetalle.direccionRetiroCalle + ' ' + (donacionDetalle.direccionRetiroNumero ? '#' + donacionDetalle.direccionRetiroNumero : '')).trim()}, {donacionDetalle.comunaRetiro}, {donacionDetalle.regionRetiro}
            </div>
          </div>

          {Boolean(donacionDetalle.transporteEspecial) && (
            <div className="bg-warning bg-opacity-25 text-warning-emphasis p-2 rounded fw-semibold">
              ⚠️ Requiere transporte especial
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="secondary" onClick={onHide} style={{ borderRadius: '10px' }}>Cerrar</Button>
      </Modal.Footer>
    </Modal>
  );
};

