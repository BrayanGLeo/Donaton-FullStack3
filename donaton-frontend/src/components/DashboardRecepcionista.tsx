import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { listarDonaciones, type DonacionResponse } from '../services/donacionService';

const getBadgeColor = (estado: string) => {
  if (estado === 'PENDIENTE') return 'warning';
  if (estado === 'ACEPTADO') return 'success';
  if (estado === 'EN_CAMINO') return 'info';
  return 'secondary';
};

const DashboardRecepcionista: React.FC = () => {
  const { usuario } = useAuth();
  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonaciones = async () => {
      try {
        const data = await listarDonaciones();
        const misDonaciones = data.filter(d => 
          (d.modalidadEntrega === 'Acopio' && d.centroAcopioDestinoId === usuario?.centroAcopioId) ||
          (d.modalidadEntrega === 'Retiro' && d.regionRetiro === usuario?.region)
        );
        setDonaciones(misDonaciones);
      } catch (err) {
        console.error('Error al cargar donaciones:', err);
        setError('No se pudo cargar el historial de donaciones.');
      } finally {
        setLoading(false);
      }
    };

    fetchDonaciones();
  }, [usuario]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando donaciones...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold text-primary mb-0">Panel de Recepcionista</h2>
          <p className="text-muted mb-0">Gestión de donaciones asignadas a tu Centro de Acopio</p>
        </div>
        <div>
          <Badge bg="info" className="fs-6 py-2 px-3">
            📍 Región: {usuario?.region || 'No asignada'}
          </Badge>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4 border-0">ID</th>
                  <th className="py-3 px-4 border-0">Categoría</th>
                  <th className="py-3 px-4 border-0">Descripción</th>
                  <th className="py-3 px-4 border-0">Cantidad / Unidad</th>
                  <th className="py-3 px-4 border-0">Estado Artículo</th>
                  <th className="py-3 px-4 border-0">Entrega</th>
                  <th className="py-3 px-4 border-0">Estado Trámite</th>
                </tr>
              </thead>
              <tbody>
                {donaciones.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No hay donaciones registradas para este centro de acopio.
                    </td>
                  </tr>
                ) : (
                  donaciones.map((donacion) => (
                    <tr key={donacion.id}>
                      <td className="px-4">
                        <span className="fw-bold text-secondary">#{donacion.id}</span>
                      </td>
                      <td className="px-4 fw-semibold">{donacion.categoria || 'N/A'}</td>
                      <td className="px-4">
                        {donacion.descripcion || donacion.recurso || 'N/A'}
                      </td>
                      <td className="px-4">
                        {donacion.cantidad} {donacion.unidadMedida || 'Unidades'}
                      </td>
                      <td className="px-4">
                        <Badge bg={donacion.estadoArticulo === 'Nuevo' ? 'success' : 'secondary'}>
                          {donacion.estadoArticulo || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-4">
                        {donacion.modalidadEntrega === 'Acopio' ? (
                          <span className="text-primary"><i className="bi bi-box-arrow-in-right me-1"></i>Acopio</span>
                        ) : (
                          <span className="text-warning"><i className="bi bi-truck me-1"></i>Retiro</span>
                        )}
                      </td>
                      <td className="px-4">
                        <Badge bg={getBadgeColor(donacion.estado || '')}>
                          {donacion.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DashboardRecepcionista;
