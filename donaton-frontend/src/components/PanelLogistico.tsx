import React, { useState, useEffect } from "react";
import { Tabs, Tab, Table, Button, Modal, Form, Alert } from "react-bootstrap";
import {
  type InventarioItem,
  type DespachoItem,
  type DespachoRequest,
  obtenerInventario,
  obtenerDespachos,
  asignarTransporte,
} from "../services/logisticaService";

const PanelLogistico: React.FC = () => {
  const [inventario, setInventario] = useState<InventarioItem[]>([]);
  const [despachos, setDespachos] = useState<DespachoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<InventarioItem | null>(null);

  const [cantidad, setCantidad] = useState<number | string>("");
  const [vehiculo, setVehiculo] = useState<string>("");

  const cargarDatos = async () => {
    setError(null);
    try {
      const [inv, desp] = await Promise.all([
        obtenerInventario(),
        obtenerDespachos(),
      ]);
      setInventario(inv);
      setDespachos(desp);
    } catch (err) {
      setError(
        "Error al cargar los datos de logística. Por favor, intente nuevamente.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleOpenModal = (item: InventarioItem) => {
    setSelectedItem(item);
    setCantidad("");
    setVehiculo("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedItem || !cantidad || !vehiculo) return;

    const request: DespachoRequest = {
      inventarioId: selectedItem.id,
      cantidad: Number(cantidad),
      vehiculo,
      horario: new Date().toISOString(),
    };

    const prevInventario = [...inventario];
    const prevDespachos = [...despachos];

    const cantidadNum = Number(cantidad);
    setInventario((prev) =>
      prev
        .map((item) => {
          if (item.id === selectedItem.id) {
            return { ...item, cantidadTotal: item.cantidadTotal - cantidadNum };
          }
          return item;
        })
        .filter((item) => item.cantidadTotal > 0),
    );

    const tempDespacho: DespachoItem = {
      id: Date.now(),
      inventarioId: selectedItem.id,
      cantidadDespachada: cantidadNum,
      vehiculo,
      estado: "Asignando...",
    };
    setDespachos((prev) => [...prev, tempDespacho]);

    handleCloseModal();
    setError(null);

    try {
      await asignarTransporte(request);
      await cargarDatos();
    } catch (err) {
      console.error(err);

      setInventario(prevInventario);
      setDespachos(prevDespachos);

      const errorObj = err as { response?: { data?: { message?: string } } };
      const apiError =
        errorObj.response?.data?.message ||
        "Error al asignar el transporte. La acción no pudo completarse.";
      setError(apiError);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Gestión de Despachos</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Tabs defaultActiveKey="pendientes" className="mb-4">
        <Tab eventKey="pendientes" title="Pendientes de Envío">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Recurso</th>
                <th>Cantidad Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventario.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.recurso}</td>
                  <td>{item.cantidadTotal}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenModal(item)}
                    >
                      Despachar
                    </Button>
                  </td>
                </tr>
              ))}
              {inventario.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center">
                    No hay inventario pendiente de envío.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="transito" title="En Tránsito">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID Despacho</th>
                <th>ID Inventario</th>
                <th>Cantidad Despachada</th>
                <th>Vehículo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {despachos.map((despacho) => (
                <tr key={despacho.id}>
                  <td>{despacho.id}</td>
                  <td>{despacho.inventarioId}</td>
                  <td>{despacho.cantidadDespachada}</td>
                  <td>{despacho.vehiculo}</td>
                  <td>{despacho.estado}</td>
                </tr>
              ))}
              {despachos.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center">
                    No hay despachos en tránsito actualmente.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Vehículo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedItem && (
            <Form onSubmit={handleSubmit} id="despachoForm">
              <p>
                <strong>Recurso:</strong> {selectedItem.recurso}
                <br />
                <strong>Disponible:</strong> {selectedItem.cantidadTotal}
              </p>

              <Form.Group className="mb-3" controlId="formCantidad">
                <Form.Label>Cantidad a despachar</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Ingrese cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  min="1"
                  max={selectedItem.cantidadTotal}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formVehiculo">
                <Form.Label>Vehículo</Form.Label>
                <Form.Select
                  value={vehiculo}
                  onChange={(e) => setVehiculo(e.target.value)}
                  required
                >
                  <option value="">Seleccione un vehículo...</option>
                  <option value="Camion-01">Camion-01</option>
                  <option value="Camion-02">Camion-02</option>
                  <option value="Furgon-01">Furgon-01</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" form="despachoForm">
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PanelLogistico;
