import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Truck, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { obtenerNecesidades, actualizarEstadoNecesidad, consumirInventario, type Necesidad } from '../../services/bffService';

const PanelEntregasCoordinador: React.FC = () => {
  const { usuario } = useAuth();
  const [necesidades, setNecesidades] = useState<Necesidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);


  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await obtenerNecesidades();
      
      const misNecesidades = data.filter(n => n.coordinadorId === Number(usuario?.id));
      
      setNecesidades(misNecesidades);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error al cargar las entregas en tránsito.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEntregado = async (necesidadId: number) => {
    try {
      setActionLoading(necesidadId);
      
      const necesidad = necesidades.find(n => n.id === necesidadId);
      if (necesidad?.recursos) {
        try {
          const recursosParseados = JSON.parse(necesidad.recursos);
          if (Array.isArray(recursosParseados)) {
            for (const rec of recursosParseados) {
              if (rec.categoria && rec.cantidad) {
                await consumirInventario(rec.categoria, Number.parseFloat(rec.cantidad));
              }
            }
          }
        } catch (e) {
          console.error('Error al descontar inventario:', e);
        }
      }

      await actualizarEstadoNecesidad(necesidadId, 'Cubierta');

      toast.success('¡Entrega confirmada y recursos descontados del inventario!');
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error al confirmar la entrega.');
    } finally {
      setActionLoading(null);
    }
  };

  const enTransito = necesidades.filter(n => ['EN_TRANSITO', 'EN TRÁNSITO'].includes(n.estado?.toUpperCase() || ''));
  const completadas = necesidades.filter(n => ['CUBIERTA', 'ENTREGADO'].includes(n.estado?.toUpperCase() || ''));

  if (loading && necesidades.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando entregas...</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
          <Truck size={28} className="text-primary" />
        </div>
        <div>
          <h4 className="fw-bold mb-0">Entregas en Tránsito</h4>
          <p className="text-muted mb-0">Confirma la llegada de los recursos a las zonas de necesidad</p>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="bg-light p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold text-primary">En Camino ({enTransito.length})</h6>
        </div>
        
        {enTransito.length === 0 ? (
          <div className="text-center py-5">
            <Truck size={48} className="text-muted opacity-25 mb-3" />
            <p className="text-muted mb-0">No hay recursos en tránsito en este momento.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4">Alerta / Destino</th>
                  <th className="py-3">Recurso</th>
                  <th className="py-3">Cantidad</th>
                  <th className="py-3">Comuna</th>
                  <th className="py-3">Conductor</th>
                  <th className="py-3 text-end px-4">Acción</th>
                </tr>
              </thead>
              <tbody>
                {enTransito.map(n => {
                  let recCat = 'Alerta General';
                  let recCant = '';
                  try {
                    if (n.recursos) {
                      const parsed = JSON.parse(n.recursos);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        recCat = parsed[0].categoria || recCat;
                        recCant = `${parsed[0].cantidad || ''} ${parsed[0].unidad || ''}`;
                      }
                    }
                  } catch(e) {
                    console.error('Error parseando recursos:', e);
                  }
                  
                  return (
                  <tr key={n.id}>
                    <td className="px-4 fw-semibold text-primary">Necesidad #{n.id}</td>
                    <td>{recCat}</td>
                    <td>{recCant || '-'}</td>
                    <td>{n.comuna || n.region || 'N/A'}</td>
                    <td>Conductor #{n.conductorId}</td>
                    <td className="text-end px-4">
                      <Button 
                        variant="success" 
                        size="sm" 
                        disabled={actionLoading === n.id}
                        onClick={() => handleEntregado(n.id)}
                        className="d-flex align-items-center ms-auto shadow-sm"
                      >
                        {actionLoading === n.id ? (
                          <Spinner size="sm" animation="border" className="me-2" />
                        ) : (
                          <CheckCircle size={16} className="me-2" />
                        )}
                        Confirmar Entrega
                      </Button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      <Card className="shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="bg-light p-3 border-bottom">
          <h6 className="mb-0 fw-bold text-success">Historial de Entregas ({completadas.length})</h6>
        </div>
        
        {completadas.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted mb-0">Aún no hay entregas confirmadas.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4">Alerta / Destino</th>
                  <th className="py-3">Recurso</th>
                  <th className="py-3">Cantidad</th>
                  <th className="py-3">Comuna</th>
                  <th className="py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {completadas.slice(0, 10).map(n => {
                  let recCat = 'Alerta General';
                  let recCant = '';
                  try {
                    if (n.recursos) {
                      const parsed = JSON.parse(n.recursos);
                      if (Array.isArray(parsed) && parsed.length > 0) {
                        recCat = parsed[0].categoria || recCat;
                        recCant = `${parsed[0].cantidad || ''} ${parsed[0].unidad || ''}`;
                      }
                    }
                  } catch(e) {
                    console.error('Error parseando recursos:', e);
                  }

                  return (
                  <tr key={n.id}>
                    <td className="px-4 text-muted">Necesidad #{n.id}</td>
                    <td className="text-muted">{recCat}</td>
                    <td className="text-muted">{recCant || '-'}</td>
                    <td className="text-muted">{n.comuna || n.region || 'N/A'}</td>
                    <td><Badge bg="success">Entregado</Badge></td>
                  </tr>
                  );
                })}
              </tbody>
            </Table>
            {completadas.length > 10 && (
              <div className="text-center p-2 border-top bg-light">
                <small className="text-muted">Mostrando las últimas 10 entregas.</small>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default PanelEntregasCoordinador;

