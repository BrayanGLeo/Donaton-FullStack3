import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import type { DonacionGlobalValues } from './DonacionSchemas';
import { getMaxYearsForSubcategory } from './DonacionSchemas';

const CATEGORIAS_DONACION = [
  "Alimentos",
  "Alimentos imperecederos",
  "Ropa y Calzado",
  "Agua e Hidratación",
  "Artículos de Higiene Personal",
  "Insumos Médicos",
  "Materiales de Construcción",
  "Herramientas",
  "Muebles y Enseres",
  "Alimentos para Mascotas",
  "Otro"
];

const UNIDADES_POR_CATEGORIA: Record<string, string[]> = {
  "Alimentos": ["Unidades", "Kilogramos", "Cajas", "Paquetes", "Pallets"],
  "Alimentos imperecederos": ["Unidades", "Kilogramos", "Cajas", "Paquetes", "Sacos", "Pallets"],
  "Ropa y Calzado": ["Unidades", "Cajas", "Paquetes", "Sacos"],
  "Agua e Hidratación": ["Unidades", "Litros", "Cajas", "Pallets"],
  "Artículos de Higiene Personal": ["Unidades", "Cajas", "Paquetes"],
  "Insumos Médicos": ["Unidades", "Cajas", "Paquetes"],
  "Materiales de Construcción": ["Unidades", "Kilogramos", "Sacos", "Pallets"],
  "Herramientas": ["Unidades", "Cajas"],
  "Muebles y Enseres": ["Unidades"],
  "Alimentos para Mascotas": ["Unidades", "Kilogramos", "Sacos", "Cajas", "Pallets"],
  "Otro": ["Unidades", "Kilogramos", "Litros", "Cajas", "Paquetes", "Sacos", "Pallets"]
};

const SUBCATEGORIAS: Record<string, string[]> = {
  "Alimentos": [
    "Frutas y Verduras",
    "Comida Preparada",
    "Lácteos/Refrigerados",
    "Panadería/Pastelería"
  ],
  "Alimentos imperecederos": [
    "Arroz",
    "Fideos/Pastas",
    "Legumbres",
    "Aceite",
    "Salsa de Tomate",
    "Atún/Jurel en Conserva",
    "Leche (Polvo/Caja larga vida)",
    "Harina",
    "Azúcar",
    "Sal",
    "Té/Café",
    "Avena/Cereales"
  ],
  "Ropa y Calzado": [
    "Poleras/Camisas",
    "Pantalones/Jeans",
    "Chaquetas/Abrigos",
    "Ropa Interior (Nueva)",
    "Zapatos/Zapatillas",
    "Ropa de Bebé/Niño",
    "Ropa de Cama"
  ],
  "Agua e Hidratación": [
    "Agua Embotellada (Bidón)",
    "Agua Embotellada (Individual)",
    "Bebidas Isotónicas",
    "Jugos en Caja"
  ],
  "Artículos de Higiene Personal": [
    "Jabón/Gel de Ducha",
    "Shampoo/Acondicionador",
    "Pasta y Cepillo Dental",
    "Papel Higiénico",
    "Toallas Higiénicas",
    "Pañales (Bebé/Adulto)",
    "Desodorante"
  ],
  "Insumos Médicos": [
    "Mascarillas",
    "Guantes de Látex/Nitrilo",
    "Alcohol/Alcohol Gel",
    "Gasas/Vendas",
    "Paracetamol/Ibuprofeno",
    "Suero",
    "Jeringas"
  ],
  "Materiales de Construcción": [
    "Madera/Tablas",
    "Clavos/Tornillos",
    "Cemento",
    "Zinc/Calaminas",
    "Pintura",
    "Cables Eléctricos"
  ],
  "Herramientas": [
    "Martillo/Serrucho",
    "Palas/Picos",
    "Taladro",
    "Destornilladores/Alicates"
  ],
  "Muebles y Enseres": [
    "Camas/Colchones",
    "Mesas/Sillas",
    "Cocina/Estufa",
    "Refrigerador",
    "Muebles de Guardado"
  ],
  "Alimentos para Mascotas": [
    "Comida para Perros (Seca)",
    "Comida para Perros (Húmeda)",
    "Comida para Gatos (Seca)",
    "Comida para Gatos (Húmeda)",
    "Arena para Gatos"
  ],
  "Otro": []
};

export const DonacionStep1: React.FC = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<DonacionGlobalValues>();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const blockInvalidNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const watchCategoria = watch('categoria');
  const watchSubCategoria = watch('subCategoria');
  const watchFoto = watch('fotoBase64');
  const watchDescripcion = watch('descripcion') || "";
  
  const maxDateStr = React.useMemo(() => {
    const maxYears = getMaxYearsForSubcategory(watchSubCategoria);
    const d = new Date();
    d.setFullYear(d.getFullYear() + maxYears);
    return d.toISOString().split('T')[0];
  }, [watchSubCategoria]);
  
  const requiresDate = ["Alimentos", "Agua e Hidratación", "Insumos Médicos", "Alimentos para Mascotas"].includes(watchCategoria);
  
  const hideEstado = [
    "Agua e Hidratación",
    "Artículos de Higiene Personal",
    "Insumos Médicos"
  ].includes(watchCategoria) || watchCategoria?.toLowerCase().includes("alimento");

  const unidadesDisponibles = watchCategoria ? (UNIDADES_POR_CATEGORIA[watchCategoria] || UNIDADES_POR_CATEGORIA["Otro"]) : [];

  React.useEffect(() => {
    if (hideEstado) {
      setValue('estadoArticulo', 'Nuevo', { shouldValidate: true });
    }
  }, [hideEstado, setValue]);

  React.useEffect(() => {
    const unidadActual = watch('unidadMedida');
    if (unidadActual && watchCategoria && !unidadesDisponibles.includes(unidadActual)) {
      setValue('unidadMedida', '', { shouldValidate: true });
    }
  }, [watchCategoria, unidadesDisponibles, setValue, watch]);

  React.useEffect(() => {
    if (watchSubCategoria && watchSubCategoria !== 'Otro') {
      setValue('nombreArticulo', watchSubCategoria, { shouldValidate: true });
    } else if (watchSubCategoria === 'Otro') {
      setValue('nombreArticulo', '', { shouldValidate: true });
    }
  }, [watchSubCategoria, setValue]);

  const opcionesSubCategoria = watchCategoria ? [...(SUBCATEGORIAS[watchCategoria] || []), "Otro"] : [];
  const showNombreInput = watchSubCategoria === 'Otro' || watchCategoria === 'Otro';

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
            <Form.Select 
              {...register('categoria')} 
              isInvalid={!!errors.categoria}
              onChange={(e) => {
                setValue('categoria', e.target.value, { shouldValidate: true });
                setValue('subCategoria', '', { shouldValidate: true });
              }}
            >
              <option value="">Selecciona una categoría</option>
              {CATEGORIAS_DONACION.map(c => <option key={c} value={c}>{c}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.categoria?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>

        {watchCategoria && (
          <Col md={6}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Subcategoría (Tipo de Artículo) <span className="text-danger">*</span></Form.Label>
              <Form.Select {...register('subCategoria')} isInvalid={!!errors.subCategoria}>
                <option value="">Selecciona una opción</option>
                {opcionesSubCategoria.map(a => <option key={a} value={a}>{a}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.subCategoria?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}

        {showNombreInput && (
          <Col md={12}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Especifique el Nombre del Artículo <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Ej. Paracetamol 500mg, Fideos Carozzi 400g, etc." 
                maxLength={100}
                {...register('nombreArticulo')} 
                isInvalid={!!errors.nombreArticulo} 
              />
              <Form.Control.Feedback type="invalid">{errors.nombreArticulo?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}

        {!hideEstado && (
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
        )}
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Unidad de Medida <span className="text-danger">*</span></Form.Label>
            <Form.Select {...register('unidadMedida')} isInvalid={!!errors.unidadMedida} disabled={!watchCategoria}>
              <option value="">Selecciona la unidad</option>
              {unidadesDisponibles.map(u => <option key={u} value={u}>{u}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.unidadMedida?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Cantidad <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="number" 
              step="any" 
              min="0.01" 
              max="999999"
              onKeyDown={blockInvalidNumberKeys}
              onInput={(e) => {
                if (Number(e.currentTarget.value) > 999999) {
                  e.currentTarget.value = '999999';
                }
              }}
              {...register('cantidad', { valueAsNumber: true })} 
              isInvalid={!!errors.cantidad} 
            />
            <Form.Control.Feedback type="invalid">{errors.cantidad?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        {requiresDate && (
          <Col md={6}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Fecha de Vencimiento <span className="text-danger">*</span></Form.Label>
              <Form.Control type="date" max={maxDateStr} {...register('fechaVencimiento')} isInvalid={!!errors.fechaVencimiento} />
              <Form.Control.Feedback type="invalid">{errors.fechaVencimiento?.message}</Form.Control.Feedback>
              <Form.Text className="text-muted">Requerido para alimentos o insumos médicos.</Form.Text>
            </Form.Group>
          </Col>
        )}
        <Col md={requiresDate ? 6 : 12}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Peso Aproximado (kg) <span className="text-muted">(Opcional)</span></Form.Label>
            <Form.Control 
              type="number" 
              step="any" 
              min="0.01" 
              max="99999"
              onKeyDown={blockInvalidNumberKeys}
              onInput={(e) => {
                if (Number(e.currentTarget.value) > 99999) {
                  e.currentTarget.value = '99999';
                }
              }}
              {...register('pesoAproximado', { valueAsNumber: true })} 
              isInvalid={!!errors.pesoAproximado} 
            />
            <Form.Control.Feedback type="invalid">{errors.pesoAproximado?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Descripción <span className="text-danger">*</span></Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          maxLength={3000}
          placeholder="Describe el artículo, marca, modelo, características..." 
          {...register('descripcion')} 
          isInvalid={!!errors.descripcion} 
        />
        <div className="d-flex justify-content-between mt-1">
          <Form.Control.Feedback type="invalid" className="d-block m-0">
            {errors.descripcion?.message}
          </Form.Control.Feedback>
          <small className="text-muted ms-auto">
            {watchDescripcion.length}/3000 caracteres
          </small>
        </div>
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

      <div className="p-4 bg-light rounded-3 border mb-4">
        <h5 className="fw-semibold mb-3">Visibilidad de la Donación</h5>
        <div className="d-flex flex-column gap-3">
          <Form.Check 
            type="radio" 
            id="visibilidad-publica"
            label={
              <div>
                <strong>Pública</strong>
                <p className="text-muted small mb-0">Tu donación y tu nombre aparecerán en el Muro Solidario para motivar a otros.</p>
              </div>
            }
            value="Publica"
            isInvalid={!!errors.visibilidad}
            {...register('visibilidad')}
          />
          <Form.Check 
            type="radio" 
            id="visibilidad-privada"
            label={
              <div>
                <strong>Anónima / Privada</strong>
                <p className="text-muted small mb-0">Solo los centros de acopio y organizaciones verán los detalles. Tu nombre no será público.</p>
              </div>
            }
            value="Privada"
            isInvalid={!!errors.visibilidad}
            {...register('visibilidad')}
          />
        </div>
        {errors.visibilidad && (
          <div className="text-danger small mt-2">
            {errors.visibilidad.message}
          </div>
        )}
      </div>
    </div>
  );
};



