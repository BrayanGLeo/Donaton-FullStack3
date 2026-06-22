import React, { useRef } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import type { DonacionGlobalValues } from './DonacionSchemas';

const CATEGORIAS_DONACION = [
  "Alimentos no perecibles",
  "Agua e Hidratación",
  "Ropa y Calzado",
  "Artículos de Aseo e Higiene",
  "Insumos Médicos",
  "Materiales de Construcción",
  "Herramientas",
  "Muebles y Enseres",
  "Alimentos para Mascotas",
  "Otro"
];

const UNIDADES_MEDIDA = [
  "Unidades",
  "Kilogramos",
  "Litros",
  "Cajas",
  "Paquetes",
  "Sacos",
  "Pallets"
];

export const DonacionStep1: React.FC = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<DonacionGlobalValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const watchCategoria = watch('categoria');
  const watchFoto = watch('fotoBase64');
  
  const requiresDate = ["Alimentos no perecibles", "Agua e Hidratación", "Insumos Médicos"].includes(watchCategoria);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande. Máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('fotoBase64', reader.result as string, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setValue('fotoBase64', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <h4 className="fw-bold text-primary mb-4 border-bottom pb-2">Detalles del Artículo</h4>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Categoría <span className="text-danger">*</span></Form.Label>
            <Form.Select {...register('categoria')} isInvalid={!!errors.categoria}>
              <option value="">Selecciona una categoría</option>
              {CATEGORIAS_DONACION.map(c => <option key={c} value={c}>{c}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.categoria?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Estado del Artículo <span className="text-danger">*</span></Form.Label>
            <Form.Select {...register('estadoArticulo')} isInvalid={!!errors.estadoArticulo}>
              <option value="">Selecciona el estado</option>
              <option value="Nuevo">Nuevo (Sin abrir/Sin uso)</option>
              <option value="Buen Estado">Buen Estado (Usado pero funcional)</option>
              <option value="Para Reparar">Para Reparar (Requiere arreglos menores)</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.estadoArticulo?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Unidad de Medida <span className="text-danger">*</span></Form.Label>
            <Form.Select {...register('unidadMedida')} isInvalid={!!errors.unidadMedida}>
              <option value="">Selecciona la unidad</option>
              {UNIDADES_MEDIDA.map(u => <option key={u} value={u}>{u}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.unidadMedida?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Cantidad <span className="text-danger">*</span></Form.Label>
            <Form.Control type="number" min="1" {...register('cantidad', { valueAsNumber: true })} isInvalid={!!errors.cantidad} />
            <Form.Control.Feedback type="invalid">{errors.cantidad?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        {requiresDate && (
          <Col md={6}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Fecha de Vencimiento <span className="text-danger">*</span></Form.Label>
              <Form.Control type="date" {...register('fechaVencimiento')} isInvalid={!!errors.fechaVencimiento} />
              <Form.Control.Feedback type="invalid">{errors.fechaVencimiento?.message}</Form.Control.Feedback>
              <Form.Text className="text-muted">Requerido para alimentos o insumos médicos.</Form.Text>
            </Form.Group>
          </Col>
        )}
        <Col md={requiresDate ? 6 : 12}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Peso Aproximado (kg) <span className="text-muted">(Opcional)</span></Form.Label>
            <Form.Control type="number" step="0.1" min="0" {...register('pesoAproximado', { valueAsNumber: true })} isInvalid={!!errors.pesoAproximado} />
            <Form.Control.Feedback type="invalid">{errors.pesoAproximado?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Descripción <span className="text-danger">*</span></Form.Label>
        <Form.Control as="textarea" rows={3} placeholder="Describe el artículo, marca, modelo, características..." {...register('descripcion')} isInvalid={!!errors.descripcion} />
        <Form.Control.Feedback type="invalid">{errors.descripcion?.message}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Fotografía del Artículo <span className="text-muted">(Opcional)</span></Form.Label>
        {watchFoto ? (
          <div className="position-relative d-inline-block">
            <img src={watchFoto} alt="Preview" className="img-thumbnail" style={{ maxHeight: '200px' }} />
            <button type="button" className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" onClick={removeImage}>X</button>
          </div>
        ) : (
          <Form.Control type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
        )}
      </Form.Group>
    </div>
  );
};
