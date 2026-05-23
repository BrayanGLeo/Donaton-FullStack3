import React, { useEffect, useState } from 'react';
import { Card, Table, Spinner, Badge, Alert } from 'react-bootstrap';
import { listarDonaciones, type DonacionResponse } from '../services/donacionService';

interface Props {
  refreshTrigger: number;
}

export const DonacionList: React.FC<Props> = ({ refreshTrigger }) => {
  const [donaciones, setDonaciones] = useState<DonacionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonaciones = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listarDonaciones();
        setDonaciones(data);
      } catch (err) {
        setError('Ocurrió un error al cargar las donaciones.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonaciones();
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-secondary">Cargando donaciones...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card className="shadow-sm border-0 mt-5 mb-5">
      <Card.Header className="bg-white border-0 pt-4 pb-0">
        <Card.Title className="fw-bold fs-4 text-primary">Historial de Donaciones</Card.Title>
      </Card.Header>
      <Card.Body>
        {donaciones.length === 0 ? (
          <Alert variant="info" className="text-center">
            Aún no hay donaciones registradas en el sistema.
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Recurso</th>
                  <th>Cantidad</th>
                  <th>Origen</th>
                  <th>Estado</th>
                  <th>Fecha de Registro</th>
                </tr>
              </thead>
              <tbody>
                {donaciones.map((donacion) => (
                  <tr key={donacion.id}>
                    <td className="fw-bold text-secondary">#{donacion.id}</td>
                    <td>{donacion.recurso}</td>
                    <td>{donacion.cantidad}</td>
                    <td>{donacion.origen}</td>
                    <td>
                      <Badge bg={donacion.estado === 'PENDIENTE' ? 'warning' : 'success'}>
                        {donacion.estado || 'REGISTRADA'}
                      </Badge>
                    </td>
                    <td>
                      {donacion.fechaRegistro 
                        ? new Date(donacion.fechaRegistro).toLocaleString() 
                        : 'Reciente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
