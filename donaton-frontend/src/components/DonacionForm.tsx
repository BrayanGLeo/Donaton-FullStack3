import React, { useState } from "react";
import { Form, Button, Spinner, Modal, Container, Card } from "react-bootstrap";
import {
  registrarDonacion,
  type DonacionPayload,
} from "../services/donacionService";

interface Props {
  onSuccess?: () => void;
}

export const DonacionForm: React.FC<Props> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<DonacionPayload>({
    recurso: "",
    cantidad: 0,
    origen: "",
  });

  const [errors, setErrors] = useState<{
    recurso?: string;
    cantidad?: string;
    origen?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }

    let parsedValue: string | number = value;
    if (name === "cantidad") {
      parsedValue = value === "" ? 0 : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const validate = () => {
    const newErrors: { recurso?: string; cantidad?: string; origen?: string } =
      {};
    if (!formData.recurso.trim()) {
      newErrors.recurso = "El tipo de recurso es requerido.";
    }
    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0.";
    }
    if (!formData.origen.trim()) {
      newErrors.origen = "El centro de origen es requerido.";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await registrarDonacion(formData);
      setCreatedId(response.id);
      setTrackingId(response.trackingId || null);
      setShowModal(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error al registrar la donación", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCreatedId(null);
    setTrackingId(null);
    setFormData({ recurso: "", cantidad: 0, origen: "" });
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "600px" }}>
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4 p-md-5">
          <Card.Title className="text-center mb-4 fw-bold fs-2 text-primary">
            Nueva Donación
          </Card.Title>
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-4" controlId="formRecurso">
              <Form.Label className="fw-semibold">Tipo de Recurso</Form.Label>
              <Form.Control
                type="text"
                name="recurso"
                placeholder="Ej. Medicamentos, Ropa, Alimentos"
                value={formData.recurso}
                onChange={handleChange}
                isInvalid={!!errors.recurso}
                disabled={isLoading}
                className="py-2"
              />
              <Form.Control.Feedback type="invalid">
                {errors.recurso}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="formCantidad">
              <Form.Label className="fw-semibold">Cantidad</Form.Label>
              <Form.Control
                type="number"
                name="cantidad"
                placeholder="Ej. 10"
                value={formData.cantidad || ""}
                onChange={handleChange}
                isInvalid={!!errors.cantidad}
                disabled={isLoading}
                className="py-2"
              />
              <Form.Control.Feedback type="invalid">
                {errors.cantidad}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-5" controlId="formOrigen">
              <Form.Label className="fw-semibold">Centro de Origen</Form.Label>
              <Form.Control
                type="text"
                name="origen"
                placeholder="Ej. Sede Central"
                value={formData.origen}
                onChange={handleChange}
                isInvalid={!!errors.origen}
                disabled={isLoading}
                className="py-2"
              />
              <Form.Control.Feedback type="invalid">
                {errors.origen}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid">
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                size="lg"
                className="py-3 fw-bold rounded-3"
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Procesando...
                  </>
                ) : (
                  "Registrar Donación"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        backdrop="static"
      >
        <Modal.Header className="bg-success text-white border-0 justify-content-center">
          <Modal.Title className="fs-3 fw-bold">
            ¡Donación Registrada!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-4">
            <h5 className="text-muted mb-2 text-uppercase tracking-wider">
              ID de Base de Datos
            </h5>
            <h3 className="fw-bolder text-secondary mb-0">{createdId}</h3>
          </div>
          <div className="p-3 bg-light rounded-3 border">
            <h5 className="text-primary mb-2 text-uppercase tracking-wider fw-bold">
              ID de Seguimiento
            </h5>
            <h2 className="display-5 fw-bolder text-primary mb-0 font-monospace">
              {trackingId}
            </h2>
            <p className="text-muted mt-2 mb-0 small">
              Guarda este ID para consultar el estado de tu donación
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pb-4 px-4">
          <Button
            variant="success"
            onClick={handleCloseModal}
            className="w-100 py-3 fw-bold rounded-3 fs-5"
          >
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
