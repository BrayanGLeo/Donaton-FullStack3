import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Modal, Container, Card, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  registrarDonacion,
  type DonacionPayload,
} from "../services/donacionService";
import { obtenerCentrosAcopio, type CentroAcopio } from "../services/logisticaService";
import { REGIONES_CHILE, COMUNAS_POR_REGION } from "../utils/chileData";
import { useAuth } from "../context/AuthContext";

interface Props {
  onSuccess?: () => void;
}

const validateStep1 = (formData: DonacionPayload) => {
  const newErrors: Record<string, string> = {};
  if (!formData.categoria) newErrors.categoria = "La categoría es requerida.";
  if (!formData.descripcion?.trim()) newErrors.descripcion = "La descripción es requerida.";
  if (!formData.estadoArticulo) newErrors.estadoArticulo = "El estado del artículo es requerido.";
  
  if ((formData.categoria === "Alimentos no perecibles" || formData.categoria === "Agua e Hidratación" || formData.categoria === "Insumos Médicos")) {
    if (formData.fechaVencimiento) {
      const selectedDate = new Date(formData.fechaVencimiento);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        newErrors.fechaVencimiento = "La fecha de vencimiento debe ser posterior a la fecha actual.";
      }
    } else {
      newErrors.fechaVencimiento = "La fecha de vencimiento es requerida para esta categoría.";
    }
  }

  if (!formData.cantidad || formData.cantidad <= 0) newErrors.cantidad = "La cantidad debe ser mayor a 0.";
  if (!formData.unidadMedida) newErrors.unidadMedida = "La unidad de medida es requerida.";
  
  return newErrors;
};

const validateStep2 = (formData: DonacionPayload) => {
  const newErrors: Record<string, string> = {};
  if (!formData.modalidadEntrega) newErrors.modalidadEntrega = "El método de entrega es requerido.";
  
  if (formData.modalidadEntrega === "Acopio" && (!formData.centroAcopioDestinoId || formData.centroAcopioDestinoId <= 0)) {
    newErrors.centroAcopioDestinoId = "Selecciona un centro de acopio.";
  }

  if (formData.modalidadEntrega === "Retiro") {
    if (!formData.regionRetiro) newErrors.regionRetiro = "La región es requerida.";
    if (!formData.comunaRetiro) newErrors.comunaRetiro = "La comuna es requerida.";
    if (!formData.direccionRetiro?.trim()) newErrors.direccionRetiro = "La dirección de retiro es requerida.";
    if (!formData.disponibilidadHoraria?.trim()) newErrors.disponibilidadHoraria = "Indica tu disponibilidad horaria.";
  }

  return newErrors;
};

export const DonacionForm: React.FC<Props> = ({ onSuccess }) => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<DonacionPayload>({
    categoria: "",
    descripcion: "",
    estadoArticulo: "",
    fechaVencimiento: "",
    cantidad: 0,
    unidadMedida: "Unidades",
    pesoAproximado: 0,
    fotoBase64: "",
    modalidadEntrega: "Acopio",
    centroAcopioDestinoId: 0,
    direccionRetiro: "",
    disponibilidadHoraria: "",
    transporteEspecial: false,
    origen: "Portal Web",
    regionRetiro: "",
    comunaRetiro: "",
  });

  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>([]);
  const [regionAcopio, setRegionAcopio] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  const [diaDisponibilidad, setDiaDisponibilidad] = useState("");
  const [horaDesde, setHoraDesde] = useState("");
  const [horaHasta, setHoraHasta] = useState("");

  useEffect(() => {
    if (diaDisponibilidad || horaDesde || horaHasta) {
      setFormData(prev => ({
        ...prev,
        disponibilidadHoraria: `${diaDisponibilidad}, desde ${horaDesde} hasta ${horaHasta}`
      }));
    }
  }, [diaDisponibilidad, horaDesde, horaHasta]);

  useEffect(() => {
    const fetchCentros = async () => {
      try {
        const data = await obtenerCentrosAcopio();
        setCentrosAcopio(data);
      } catch (err) {
        console.error("Error cargando centros de acopio", err);
      }
    };
    fetchCentros();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    let parsedValue: any = value;
    if (type === "number") {
      parsedValue = value === "" ? 0 : Number(value);
    } else if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, fotoBase64: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    const validationErrors = validateStep1(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStep(2);
  };

  const prevStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const validationErrors = validateStep2(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const donanteId = usuario?.id != null ? Number(usuario.id) : undefined;
      console.log('[DonacionForm] usuario desde AuthContext:', usuario);
      console.log('[DonacionForm] donanteId que se enviará:', donanteId);
      
      const payload: DonacionPayload = {
        ...formData,
        recurso: formData.descripcion,
        donanteId
      };

      console.log('[DonacionForm] payload completo:', payload);
      const response = await registrarDonacion(payload);
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
    setStep(1);
    setFormData({
      categoria: "", descripcion: "", estadoArticulo: "", fechaVencimiento: "",
      cantidad: 0, unidadMedida: "Unidades", pesoAproximado: 0, fotoBase64: "",
      modalidadEntrega: "Acopio", centroAcopioDestinoId: 0, direccionRetiro: "",
      disponibilidadHoraria: "", transporteEspecial: false, origen: "Portal Web",
      regionRetiro: "", comunaRetiro: ""
    });
    setDiaDisponibilidad("");
    setHoraDesde("");
    setHoraHasta("");
    navigate('/mis-donaciones');
  };

  return (
    <Container className="mt-5" style={{ maxWidth: "800px" }}>
      <Card className="shadow-lg border-0 rounded-4">
        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
          <div className="d-flex justify-content-between position-relative px-4">
            <div className="position-absolute top-50 start-0 end-0 translate-middle-y mx-5" style={{ height: '4px', backgroundColor: '#e9ecef', zIndex: 0 }}></div>
            <div className="position-absolute top-50 start-0 translate-middle-y ms-5" style={{ height: '4px', backgroundColor: '#0d6efd', zIndex: 1, width: step === 2 ? 'calc(100% - 6rem)' : '0%', transition: 'width 0.4s ease' }}></div>
            
            <div className="text-center position-relative z-1">
              <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm text-white ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '40px', height: '40px', transition: 'all 0.3s' }}>
                1
              </div>
              <span className={`fw-bold ${step >= 1 ? 'text-primary' : 'text-muted'}`}>Detalles</span>
            </div>
            
            <div className="text-center position-relative z-1">
              <div className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 shadow-sm text-white ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: '40px', height: '40px', transition: 'all 0.3s' }}>
                2
              </div>
              <span className={`fw-bold ${step >= 2 ? 'text-primary' : 'text-muted'}`}>Entrega</span>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-4 p-md-5">
          <Card.Title className="text-center mb-4 fw-bold fs-2 text-dark">
            {step === 1 ? "Clasificación y Detalles" : "Método de Entrega"}
          </Card.Title>
          <Form onSubmit={step === 1 ? (e) => { e.preventDefault(); nextStep(); } : handleSubmit} noValidate>
            {/* --- PASO 1 --- */}
            {step === 1 && (
              <Step1Form 
                formData={formData} 
                errors={errors} 
                handleChange={handleChange} 
                handleImageChange={handleImageChange} 
                nextStep={nextStep}
              />
            )}

            {/* --- PASO 2 --- */}
            {step === 2 && (
              <Step2Form 
                formData={formData} 
                errors={errors} 
                handleChange={handleChange} 
                centrosAcopio={centrosAcopio} 
                regionAcopio={regionAcopio}
                setRegionAcopio={setRegionAcopio}
                prevStep={prevStep} 
                isLoading={isLoading} 
                diaDisponibilidad={diaDisponibilidad}
                setDiaDisponibilidad={setDiaDisponibilidad}
                horaDesde={horaDesde}
                setHoraDesde={setHoraDesde}
                horaHasta={horaHasta}
                setHoraHasta={setHoraHasta}
              />
            )}
          </Form>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
        <Modal.Header className="bg-success text-white border-0 justify-content-center py-4">
          <Modal.Title className="fs-2 fw-bold text-center w-100">
            <i className="bi bi-heart-fill me-2 text-danger"></i> ¡Gracias por Donar!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <div className="mb-4">
            <h5 className="text-muted mb-2 text-uppercase fw-bold" style={{ letterSpacing: '2px' }}>
              ID de Registro
            </h5>
            <h3 className="fw-bolder text-dark mb-3 fs-1">#{createdId}</h3>
            {trackingId && (
              <>
                <h5 className="text-muted mb-2 text-uppercase fw-bold" style={{ letterSpacing: '2px' }}>
                  ID de Seguimiento
                </h5>
                <h4 className="fw-bolder text-primary mb-0 font-monospace">{trackingId}</h4>
              </>
            )}
          </div>
          {formData.modalidadEntrega === "Retiro" && (
            <Alert variant="info" className="mt-4 text-start shadow-sm border-0">
              <i className="bi bi-info-circle-fill me-2"></i>
              <strong>Próximos pasos:</strong> Un conductor se pondrá en contacto contigo pronto para coordinar el retiro en el horario indicado.
            </Alert>
          )}
          {formData.modalidadEntrega === "Acopio" && (
            <Alert variant="info" className="mt-4 text-start shadow-sm border-0">
              <i className="bi bi-info-circle-fill me-2"></i>
              <strong>Próximos pasos:</strong> Por favor acércate al centro de acopio seleccionado para hacer entrega de tu donación e indica tu ID de registro.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pb-4 px-4 bg-light">
          <Button variant="success" onClick={handleCloseModal} className="w-100 py-3 fw-bold rounded-pill fs-5 shadow-sm">
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const Step1Form = ({ formData, errors, handleChange, handleImageChange, nextStep }: any) => (
  <div className="animate__animated animate__fadeIn">
    <Row>
      <Col md={6}>
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Categoría Principal</Form.Label>
          <Form.Select name="categoria" value={formData.categoria} onChange={handleChange} isInvalid={!!errors.categoria} className="py-2">
            <option value="">Selecciona una categoría...</option>
            <option value="Alimentos no perecibles">Alimentos no perecibles</option>
            <option value="Agua e Hidratación">Agua e Hidratación</option>
            <option value="Ropa y Abrigo">Ropa y Abrigo</option>
            <option value="Insumos Médicos">Insumos Médicos</option>
            <option value="Herramientas de Rescate">Herramientas de Rescate</option>
            <option value="Artículos de Aseo">Artículos de Aseo</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.categoria}</Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Estado del Artículo</Form.Label>
          <Form.Select name="estadoArticulo" value={formData.estadoArticulo} onChange={handleChange} isInvalid={!!errors.estadoArticulo} className="py-2">
            <option value="">Selecciona el estado...</option>
            <option value="Nuevo">Nuevo / Sellado</option>
            <option value="Usado (Buen Estado)">Usado (Buen Estado)</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.estadoArticulo}</Form.Control.Feedback>
        </Form.Group>
      </Col>
    </Row>

    <Form.Group className="mb-4">
      <Form.Label className="fw-semibold">Descripción Detallada</Form.Label>
      <Form.Control as="textarea" rows={2} name="descripcion" placeholder="Ej. 5 latas de atún, 2 paquetes de fideos, etc." value={formData.descripcion} onChange={handleChange} isInvalid={!!errors.descripcion} />
      <Form.Control.Feedback type="invalid">{errors.descripcion}</Form.Control.Feedback>
    </Form.Group>

    {(formData.categoria === "Alimentos no perecibles" || formData.categoria === "Agua e Hidratación" || formData.categoria === "Insumos Médicos") && (
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold text-danger">Fecha de Vencimiento</Form.Label>
        <Form.Control type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} isInvalid={!!errors.fechaVencimiento} className="py-2" />
        <Form.Control.Feedback type="invalid">{errors.fechaVencimiento}</Form.Control.Feedback>
      </Form.Group>
    )}

    <hr className="my-4 text-muted" />
    <h5 className="fw-bold mb-3">Cuantificación</h5>
    
    <Row>
      <Col md={4}>
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Cantidad</Form.Label>
          <Form.Control type="number" name="cantidad" value={formData.cantidad || ""} onChange={handleChange} isInvalid={!!errors.cantidad} className="py-2" />
          <Form.Control.Feedback type="invalid">{errors.cantidad}</Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Unidad de Medida</Form.Label>
          <Form.Select name="unidadMedida" value={formData.unidadMedida} onChange={handleChange} isInvalid={!!errors.unidadMedida} className="py-2">
            <option value="Unidades">Unidades</option>
            <option value="Kilos">Kilos</option>
            <option value="Litros">Litros</option>
            <option value="Cajas">Cajas</option>
            <option value="Pallets">Pallets</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.unidadMedida}</Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group className="mb-4">
          <Form.Label className="fw-semibold">Peso (Kg) <small className="text-muted">(Opcional)</small></Form.Label>
          <Form.Control type="number" name="pesoAproximado" value={formData.pesoAproximado || ""} onChange={handleChange} className="py-2" />
        </Form.Group>
      </Col>
    </Row>

    <Form.Group className="mb-4">
      <Form.Label className="fw-semibold">Fotografía Referencial <small className="text-muted">(Opcional)</small></Form.Label>
      <Form.Control type="file" accept="image/*" onChange={handleImageChange} className="py-2" />
      {formData.fotoBase64 && (
        <div className="mt-2 text-success small"><i className="bi bi-check-circle-fill me-1"></i>Imagen cargada correctamente</div>
      )}
    </Form.Group>

    <div className="d-flex justify-content-end mt-4">
      <Button variant="primary" type="button" onClick={nextStep} size="lg" className="px-5 rounded-pill fw-bold shadow-sm">
        Siguiente <i className="bi bi-arrow-right ms-2"></i>
      </Button>
    </div>
  </div>
);

const Step2Form = ({ formData, errors, handleChange, centrosAcopio, regionAcopio, setRegionAcopio, prevStep, isLoading, diaDisponibilidad, setDiaDisponibilidad, horaDesde, setHoraDesde, horaHasta, setHoraHasta }: any) => {
  const centrosFiltrados = regionAcopio ? centrosAcopio.filter((c: any) => c.region === regionAcopio) : [];
  
  return (
  <div className="animate__animated animate__fadeIn">
    <Form.Group className="mb-4">
      <Form.Label className="fw-bold fs-5">¿Cómo entregarás tu donación?</Form.Label>
      <div className="d-flex gap-3 mt-2">
        <Card 
          className={`flex-fill cursor-pointer transition-all ${formData.modalidadEntrega === 'Acopio' ? 'border-primary bg-primary text-white shadow' : 'border-secondary'}`}
          onClick={() => handleChange({ target: { name: "modalidadEntrega", value: "Acopio", type: "text" } } as any)}
          style={{ cursor: 'pointer' }}
        >
          <Card.Body className="text-center py-4">
            <h1 className="mb-3"><i className="bi bi-building"></i></h1>
            <h5 className="fw-bold">Llevar a Centro de Acopio</h5>
            <small className={formData.modalidadEntrega === 'Acopio' ? 'text-white-50' : 'text-muted'}>Yo mismo la transportaré</small>
          </Card.Body>
        </Card>

        <Card 
          className={`flex-fill cursor-pointer transition-all ${formData.modalidadEntrega === 'Retiro' ? 'border-primary bg-primary text-white shadow' : 'border-secondary'}`}
          onClick={() => handleChange({ target: { name: "modalidadEntrega", value: "Retiro", type: "text" } } as any)}
          style={{ cursor: 'pointer' }}
        >
          <Card.Body className="text-center py-4">
            <h1 className="mb-3"><i className="bi bi-truck"></i></h1>
            <h5 className="fw-bold">Solicitar Retiro</h5>
            <small className={formData.modalidadEntrega === 'Retiro' ? 'text-white-50' : 'text-muted'}>Que un conductor la busque</small>
          </Card.Body>
        </Card>
      </div>
      {errors.modalidadEntrega && <div className="text-danger mt-2 small">{errors.modalidadEntrega}</div>}
    </Form.Group>

    {formData.modalidadEntrega === "Acopio" && (
      <div className="p-4 bg-light rounded-3 border mb-4 animate__animated animate__fadeIn">
        <h5 className="fw-bold mb-3">Selecciona el Centro de Acopio Destino</h5>
        
        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Región</Form.Label>
          <Form.Select
            value={regionAcopio}
            onChange={(e) => {
              setRegionAcopio(e.target.value);
              // Reiniciar el centro seleccionado si cambia la región
              handleChange({ target: { name: "centroAcopioDestinoId", value: 0, type: "number" } } as any);
            }}
            size="lg"
          >
            <option value="">Selecciona una región...</option>
            {REGIONES_CHILE.map((region: string) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label className="fw-semibold">Centro de Acopio de Destino</Form.Label>
          <Form.Select
            name="centroAcopioDestinoId"
            value={formData.centroAcopioDestinoId}
            onChange={handleChange}
            isInvalid={!!errors.centroAcopioDestinoId}
            size="lg"
            disabled={!regionAcopio}
          >
            <option value={0}>Seleccione un centro...</option>
            {centrosFiltrados.map((centro: any) => (
              <option key={centro.id} value={centro.id}>
                {centro.nombre} - {centro.comuna}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.centroAcopioDestinoId}</Form.Control.Feedback>
          {formData.centroAcopioDestinoId > 0 && (
            <div className="mt-2 text-muted small">
              <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
              <strong>Dirección:</strong> {centrosAcopio.find((c: any) => c.id === Number(formData.centroAcopioDestinoId))?.direccion}
            </div>
          )}
        </Form.Group>
      </div>
    )}

    {formData.modalidadEntrega === "Retiro" && (
      <div className="p-4 bg-light rounded-3 border mb-4 animate__animated animate__fadeIn">
        <h5 className="fw-bold mb-3">Datos de Retiro a Domicilio</h5>
        
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Región</Form.Label>
              <Form.Select
                name="regionRetiro"
                value={formData.regionRetiro || ""}
                onChange={(e) => {
                  handleChange(e);
                  handleChange({ target: { name: "comunaRetiro", value: "", type: "text" } } as any);
                }}
                isInvalid={!!errors.regionRetiro}
              >
                <option value="">Selecciona una región...</option>
                {REGIONES_CHILE.map((region: string) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.regionRetiro}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Comuna</Form.Label>
              <Form.Select
                name="comunaRetiro"
                value={formData.comunaRetiro || ""}
                onChange={handleChange}
                isInvalid={!!errors.comunaRetiro}
                disabled={!formData.regionRetiro}
              >
                <option value="">Selecciona una comuna...</option>
                {formData.regionRetiro && COMUNAS_POR_REGION[formData.regionRetiro]?.map((comuna: string) => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.comunaRetiro}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">Dirección de Retiro</Form.Label>
          <Form.Control
            type="text"
            name="direccionRetiro"
            placeholder="Calle, Número, Depto, Comuna"
            value={formData.direccionRetiro}
            onChange={handleChange}
            isInvalid={!!errors.direccionRetiro}
          />
          <Form.Control.Feedback type="invalid">{errors.direccionRetiro}</Form.Control.Feedback>
        </Form.Group>

        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Día Disponible</Form.Label>
              <Form.Select
                value={diaDisponibilidad}
                onChange={(e) => setDiaDisponibilidad(e.target.value)}
                isInvalid={!!errors.disponibilidadHoraria}
              >
                <option value="">Selecciona un día...</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.disponibilidadHoraria}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Desde</Form.Label>
              <Form.Control
                type="time"
                value={horaDesde}
                onChange={(e) => setHoraDesde(e.target.value)}
                isInvalid={!!errors.disponibilidadHoraria}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Hasta</Form.Label>
              <Form.Control
                type="time"
                value={horaHasta}
                onChange={(e) => setHoraHasta(e.target.value)}
                isInvalid={!!errors.disponibilidadHoraria}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mt-4">
          <Form.Check
            type="switch"
            id="transporteEspecial"
            name="transporteEspecial"
            label={<span className="fw-semibold">Requiere transporte especial (Frío, gran volumen, materiales peligrosos)</span>}
            checked={formData.transporteEspecial}
            onChange={handleChange}
          />
        </Form.Group>
      </div>
    )}

    <div className="d-flex justify-content-between mt-5">
      <Button variant="outline-secondary" type="button" onClick={prevStep} size="lg" className="px-4 rounded-pill fw-bold">
        <i className="bi bi-arrow-left me-2"></i> Volver
      </Button>
      <Button
        variant="success"
        type="submit"
        disabled={isLoading}
        size="lg"
        className="px-5 rounded-pill fw-bold shadow-sm"
      >
        {isLoading ? (
          <><Spinner as="span" animation="border" size="sm" className="me-2"/>Procesando...</>
        ) : (
          <><i className="bi bi-check-circle me-2"></i> Confirmar Donación</>
        )}
      </Button>
    </div>
  </div>
  );
};
