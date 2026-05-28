import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Badge, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { obtenerDespachos, confirmarEntrega, type DespachoItem } from '../services/logisticaService';

export const PanelConductor: React.FC = () => {
  const [despachos, setDespachos] = useState<DespachoItem[]>([]);
  const [entregasPendientes, setEntregasPendientes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'warning', text: string } | null>(null);

  const fetchDespachos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await obtenerDespachos();
      const enTransito = data.filter(d => d.estado === 'En tránsito');
      setDespachos(enTransito);
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al cargar los despachos asignados.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const pendientesLocal = localStorage.getItem('entregasPendientes');
    if (pendientesLocal) {
      setEntregasPendientes(JSON.parse(pendientesLocal));
      setSyncMessage({
        type: 'warning',
        text: 'Hay entregas guardadas localmente. Se sincronizarán cuando haya conexión.'
      });
    }

    fetchDespachos();

    globalThis.addEventListener('online', sincronizarEntregas);
    return () => {
      globalThis.removeEventListener('online', sincronizarEntregas);
    };
  }, []);

  const marcarEntregada = async (id: number) => {
    try {
      await confirmarEntrega(id);
      setDespachos(prev => prev.filter(d => d.id !== id));
      setSyncMessage({ type: 'success', text: `Despacho #${id} confirmado exitosamente.` });
    } catch (err: any) {
      if (!err.response || err.message === 'Network Error') {
        const nuevasPendientes = [...entregasPendientes, id];
        setEntregasPendientes(nuevasPendientes);
        localStorage.setItem('entregasPendientes', JSON.stringify(nuevasPendientes));
        
        setSyncMessage({
          type: 'warning',
          text: `Sin conexión. El despacho #${id} se guardó localmente y se enviará luego.`
        });
      } else {
        setError(`Error al confirmar la entrega del despacho #${id}`);
      }
    }
  };

  const sincronizarEntregas = async () => {
    const pendientesLocal = localStorage.getItem('entregasPendientes');
    if (!pendientesLocal) return;

    const pendientes: number[] = JSON.parse(pendientesLocal);
    if (pendientes.length === 0) return;

    let successCount = 0;
    const fallidas: number[] = [];

    for (const id of pendientes) {
      try {
        await confirmarEntrega(id);
        successCount++;
        setDespachos(prev => prev.filter(d => d.id !== id));
      } catch {
        fallidas.push(id);
      }
    }

    if (fallidas.length > 0) {
      setEntregasPendientes(fallidas);
      localStorage.setItem('entregasPendientes', JSON.stringify(fallidas));
      setSyncMessage({
        type: 'warning',
        text: `Se sincronizaron ${successCount} entregas, pero fallaron ${fallidas.length}.`
      });
    } else {
      setEntregasPendientes([]);
      localStorage.removeItem('entregasPendientes');
      if (successCount > 0) {
        setSyncMessage({
          type: 'success',
          text: `¡${successCount} entrega(s) sincronizada(s) exitosamente!`
        });
      }
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-secondary">Cargando rutas...</p>
        </div>
      );
    }
    
    if (despachos.length === 0) {
      return (
        <Alert variant="info" className="text-center py-4">
          <h5><i className="bi bi-check-circle me-2"></i>Todo listo</h5>
          No tienes despachos en tránsito asignados en este momento.
        </Alert>
      );
    }

    return (
      <Row xs={1} md={2} lg={3} className="g-4">
        {despachos.map(despacho => {
          const isLocalSaved = entregasPendientes.includes(despacho.id);
          return (
            <Col key={despacho.id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    <Badge bg="secondary" className="fs-6">Despacho #{despacho.id}</Badge>
                    <Badge bg="warning" className="text-dark">En tránsito</Badge>
                  </div>
                  
                  <div className="mb-3">
                    <p className="mb-1 text-muted small">Vehículo</p>
                    <p className="fw-bold mb-0">{despacho.vehiculo}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="mb-1 text-muted small">Cantidad</p>
                    <p className="fw-bold mb-0">{despacho.cantidadDespachada} unidades</p>
                  </div>

                  <Button 
                    variant={isLocalSaved ? "warning" : "success"}
                    className="w-100 fw-bold py-2"
                    onClick={() => !isLocalSaved && marcarEntregada(despacho.id)}
                    disabled={isLocalSaved}
                  >
                    {isLocalSaved ? (
                      <><i className="bi bi-cloud-arrow-up me-2"></i> Guardado localmente...</>
                    ) : (
                      <><i className="bi bi-box-seam me-2"></i> Marcar como Entregada</>
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <Container className="mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">Panel de Conductor</h2>
        <Button 
          variant="outline-primary" 
          onClick={sincronizarEntregas}
          disabled={entregasPendientes.length === 0}
        >
          <i className="bi bi-arrow-repeat me-2"></i> Sincronizar ahora
        </Button>
      </div>

      {syncMessage && (
        <Alert variant={syncMessage.type} onClose={() => setSyncMessage(null)} dismissible>
          {syncMessage.text}
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {renderContent()}
    </Container>
  );
};
