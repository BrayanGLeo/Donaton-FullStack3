import React, { useState } from 'react';
import { Form, Row, Col, Button, Card, Table, Badge } from 'react-bootstrap';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Trash2, Plus } from 'lucide-react';
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
    "Frutas",
    "Verduras",
    "Comida Preparada",
    "Lácteos",
    "Refrigerados",
    "Panadería",
    "Pastelería"
  ],
  "Alimentos imperecederos": [
    "Arroz",
    "Fideos",
    "Pastas",
    "Legumbres",
    "Aceite",
    "Salsa de Tomate",
    "Atún en Conserva",
    "Jurel en Conserva",
    "Leche en Polvo",
    "Leche (Caja larga vida)",
    "Harina",
    "Azúcar",
    "Sal",
    "Té",
    "Café",
    "Avena",
    "Cereales"
  ],
  "Ropa y Calzado": [
    "Poleras",
    "Camisas",
    "Pantalones",
    "Jeans",
    "Chaquetas",
    "Abrigos",
    "Ropa Interior (Nueva)",
    "Zapatos",
    "Zapatillas",
    "Ropa de Bebé"
  ],
  "Agua e Hidratación": [
    "Agua Embotellada (Bidón)",
    "Agua Embotellada (Individual)",
    "Bebidas Isotónicas",
    "Jugos en Caja"
  ],
  "Artículos de Higiene Personal": [
    "Jabón",
    "Gel de Ducha",
    "Shampoo",
    "Acondicionador",
    "Pasta Dental",
    "Cepillo Dental",
    "Papel Higiénico",
    "Toallas Higiénicas",
    "Pañales (Bebé)",
    "Pañales (Adulto)",
    "Desodorante"
  ],
  "Insumos Médicos": [
    "Mascarillas",
    "Guantes de Látex",
    "Guantes de Nitrilo",
    "Alcohol",
    "Alcohol Gel",
    "Gasas",
    "Vendas",
    "Paracetamol",
    "Ibuprofeno",
    "Suero",
    "Jeringas"
  ],
  "Materiales de Construcción": [
    "Madera",
    "Tablas",
    "Clavos",
    "Tornillos",
    "Cemento",
    "Zinc",
    "Calaminas",
    "Pintura",
    "Cables Eléctricos",
    "Ladrillos",
    "Arena",
    "Grava",
    "Yeso",
    "Tubos de PVC",
    "Fierro/Acero",
    "Planchas OSB",
    "Aislante Térmico"
  ],
  "Herramientas": [
    "Martillo",
    "Serrucho",
    "Palas",
    "Picos",
    "Taladro",
    "Destornilladores",
    "Alicates",
    "Huincha de Medir",
    "Llave Inglesa",
    "Carretilla",
    "Esmeril",
    "Sierra Circular",
    "Hacha",
    "Brochas",
    "Rodillos"
  ],
  "Muebles y Enseres": [
    "Camas",
    "Colchones",
    "Mesas",
    "Sillas",
    "Cocina",
    "Estufa",
    "Refrigerador",
    "Muebles de Guardado",
    "Sillones",
    "Estantes",
    "Escritorios",
    "Lavadora",
    "Microondas",
    "Televisor",
    "Sábanas y Frazadas"
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

const INITIAL_TEMP_RECURSO = {
  categoria: '',
  subCategoria: '',
  estadoArticulo: '',
  unidadMedida: '',
  cantidad: '',
  pesoAproximado: '',
  fechaVencimiento: '',
  genero: '',
  talla: '',
  tamano: '',
  etapa: '',
  restriccionDietetica: ''
};

const validateFechaVencimiento = (tempRecurso: typeof INITIAL_TEMP_RECURSO, errs: Record<string, string>) => {
  const requiresDate = ["Alimentos", "Agua e Hidratación", "Insumos Médicos", "Alimentos para Mascotas"].includes(tempRecurso.categoria);
  
  if (!requiresDate) return;

  if (!tempRecurso.fechaVencimiento) {
    errs.fechaVencimiento = "La fecha de vencimiento es obligatoria para esta categoría";
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  if (tempRecurso.fechaVencimiento < today) {
    errs.fechaVencimiento = "La fecha de vencimiento no puede estar en el pasado";
    return;
  }

  const maxYears = getMaxYearsForSubcategory(tempRecurso.subCategoria);
  const maxD = new Date();
  maxD.setFullYear(maxD.getFullYear() + maxYears);
  const maxDate = maxD.toISOString().split('T')[0];
  
  if (tempRecurso.fechaVencimiento > maxDate) {
    errs.fechaVencimiento = `La fecha de vencimiento no puede exceder los próximos ${maxYears} años`;
  }
};

const validateRecursoLocal = (tempRecurso: typeof INITIAL_TEMP_RECURSO) => {
  const errs: Record<string, string> = {};

  if (!tempRecurso.categoria) errs.categoria = "La categoría es obligatoria";
  if (!tempRecurso.subCategoria) errs.subCategoria = "La subcategoría es obligatoria";
  
  const hideEstado = [
    "Agua e Hidratación",
    "Artículos de Higiene Personal",
    "Insumos Médicos"
  ].includes(tempRecurso.categoria) || tempRecurso.categoria.toLowerCase().includes("alimento");

  if (!hideEstado && !tempRecurso.estadoArticulo) {
    errs.estadoArticulo = "El estado del artículo es obligatorio";
  }

  if (!tempRecurso.unidadMedida) errs.unidadMedida = "La unidad de medida es obligatoria";
  
  const cantidadNum = Number(tempRecurso.cantidad);
  if (!tempRecurso.cantidad || Number.isNaN(cantidadNum) || cantidadNum <= 0) {
    errs.cantidad = "Debe ingresar una cantidad válida mayor a 0";
  }

  validateFechaVencimiento(tempRecurso, errs);

  if (tempRecurso.categoria === "Ropa y Calzado") {
    if (!tempRecurso.genero) errs.genero = "El género es obligatorio para ropa/calzado";
    if (!tempRecurso.talla) errs.talla = "La talla es obligatoria para ropa/calzado";
  }

  return { errs, hideEstado, cantidadNum };
};

const renderTallaOptions = (subCategoria: string) => {
  if (subCategoria === 'Ropa de Bebé') {
    return ["0-3 meses", "3-6 meses", "6-9 meses", "9-12 meses", "12-18 meses", "18-24 meses", "2-3 años"].map(t => (
      <option key={t} value={t}>{t}</option>
    ));
  }
  if (subCategoria === 'Zapatos' || subCategoria === 'Zapatillas') {
    return Array.from({length: 33}, (_, i) => i + 18).map(t => (
      <option key={t} value={t.toString()}>{t}</option>
    ));
  }
  if (subCategoria === 'Pañales (Bebé)') {
    return ["RN", "P", "M", "G", "XG", "XXG"].map(t => (
      <option key={t} value={t}>{t}</option>
    ));
  }
  if (subCategoria === 'Pañales (Adulto)' || subCategoria === 'Guantes de Látex' || subCategoria === 'Guantes de Nitrilo') {
    return ["S", "M", "L", "XL"].map(t => (
      <option key={t} value={t}>{t}</option>
    ));
  }
  return ["XS", "S", "M", "L", "XL", "XXL", "Única"].map(t => (
    <option key={t} value={t}>{t}</option>
  ));
};

export const DonacionStep1: React.FC = () => {
  const { register, control, watch, setValue, trigger, formState: { errors } } = useFormContext<DonacionGlobalValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "recursos"
  });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [tempRecurso, setTempRecurso] = useState(INITIAL_TEMP_RECURSO);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  const blockInvalidNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const watchFoto = watch('fotoBase64');
  const watchDescripcion = watch('descripcion') || "";

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

  const handleAgregarRecurso = async () => {
    const { errs, hideEstado, cantidadNum } = validateRecursoLocal(tempRecurso);

    if (Object.keys(errs).length > 0) {
      setLocalErrors(errs);
      return;
    }

    // Validacion correcta, agregar al fieldArray
    append({
      categoria: tempRecurso.categoria,
      subCategoria: tempRecurso.subCategoria,
      estadoArticulo: hideEstado ? 'Nuevo' : tempRecurso.estadoArticulo,
      unidadMedida: tempRecurso.unidadMedida,
      cantidad: cantidadNum,
      pesoAproximado: tempRecurso.pesoAproximado ? Number(tempRecurso.pesoAproximado) : undefined,
      fechaVencimiento: tempRecurso.fechaVencimiento || undefined
    });

    // Limpiar form temporal y errores
    setTempRecurso(INITIAL_TEMP_RECURSO);
    setLocalErrors({});
    
    // Limpiar error root de validación del schema si había uno
    trigger('recursos');
  };

  const unidadesDisponibles = tempRecurso.categoria ? (UNIDADES_POR_CATEGORIA[tempRecurso.categoria] || UNIDADES_POR_CATEGORIA["Otro"]) : [];
  const opcionesSubCategoria = tempRecurso.categoria ? [...(SUBCATEGORIAS[tempRecurso.categoria] || []), "Otro"] : [];
  
  const hideEstadoLocal = [
    "Agua e Hidratación",
    "Artículos de Higiene Personal",
    "Insumos Médicos"
  ].includes(tempRecurso.categoria) || tempRecurso.categoria.toLowerCase().includes("alimento");

  const requiresDateLocal = ["Alimentos", "Agua e Hidratación", "Insumos Médicos", "Alimentos para Mascotas"].includes(tempRecurso.categoria);

  const maxDateStrLocal = (() => {
    const maxYears = getMaxYearsForSubcategory(tempRecurso.subCategoria);
    const d = new Date();
    d.setFullYear(d.getFullYear() + maxYears);
    return d.toISOString().split('T')[0];
  })();

  return (
    <div>
      <h4 className="fw-bold text-primary mb-4 border-bottom pb-2">Detalles Generales de la Donación</h4>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Título de la Donación <span className="text-danger">*</span></Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Ej. Donación de ropa y alimentos, Kit de primeros auxilios, etc." 
              maxLength={100}
              {...register('nombreArticulo')} 
              isInvalid={!!errors.nombreArticulo} 
            />
            <Form.Control.Feedback type="invalid">{errors.nombreArticulo?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Descripción <span className="text-danger">*</span></Form.Label>
        <Form.Control 
          as="textarea" 
          rows={3} 
          maxLength={3000}
          placeholder="Describe la donación, marcas, modelos, características importantes..." 
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

      <h4 className="fw-bold text-primary mb-4 border-bottom pb-2 mt-5">Añadir Recurso a Donar</h4>
      {errors.recursos?.root && (
        <div className="alert alert-danger p-2 mb-4">
          {errors.recursos.root.message}
        </div>
      )}
      {fields.length === 0 && !errors.recursos?.root && (
        <div className="alert alert-warning p-2 mb-4 small">
          Debes añadir al menos un recurso a la donación.
        </div>
      )}

      {/* Formulario Local de Recurso */}
      <Card className="mb-4 shadow-sm border-0 bg-light">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Categoría <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  value={tempRecurso.categoria}
                  isInvalid={!!localErrors.categoria}
                  onChange={(e) => {
                    setTempRecurso({
                      ...tempRecurso,
                      categoria: e.target.value,
                      subCategoria: '',
                      unidadMedida: '',
                      estadoArticulo: ''
                    });
                    setLocalErrors({ ...localErrors, categoria: '' });
                  }}
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIAS_DONACION.map(c => <option key={c} value={c}>{c}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{localErrors.categoria}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {tempRecurso.categoria && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Subcategoría <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.subCategoria}
                    isInvalid={!!localErrors.subCategoria}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, subCategoria: e.target.value });
                      setLocalErrors({ ...localErrors, subCategoria: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {opcionesSubCategoria.map(a => <option key={a} value={a}>{a}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.subCategoria}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}

            {tempRecurso.categoria === "Ropa y Calzado" && (
              <>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Género <span className="text-danger">*</span></Form.Label>
                    <Form.Select 
                      value={tempRecurso.genero || ''}
                      isInvalid={!!localErrors.genero}
                      onChange={(e) => {
                        setTempRecurso({ ...tempRecurso, genero: e.target.value });
                        setLocalErrors({ ...localErrors, genero: '' });
                      }}
                    >
                      <option value="">Selecciona el género</option>
                      {tempRecurso.subCategoria === 'Ropa de Bebé' ? (
                        <>
                          <option value="Niño">Niño</option>
                          <option value="Niña">Niña</option>
                          <option value="Unisex">Unisex</option>
                        </>
                      ) : (
                        <>
                          <option value="Hombre">Hombre</option>
                          <option value="Mujer">Mujer</option>
                          <option value="Unisex">Unisex</option>
                          <option value="Niño">Niño</option>
                          <option value="Niña">Niña</option>
                        </>
                      )}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{localErrors.genero}</Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Talla <span className="text-danger">*</span></Form.Label>
                    <Form.Select 
                      value={tempRecurso.talla || ''}
                      isInvalid={!!localErrors.talla}
                      onChange={(e) => {
                        setTempRecurso({ ...tempRecurso, talla: e.target.value });
                        setLocalErrors({ ...localErrors, talla: '' });
                      }}
                    >
                      <option value="">Selecciona la talla</option>
                      {renderTallaOptions(tempRecurso.subCategoria)}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{localErrors.talla}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </>
            )}

            {(tempRecurso.subCategoria === "Pañales (Bebé)" || 
              tempRecurso.subCategoria === "Pañales (Adulto)" || 
              tempRecurso.subCategoria === "Guantes de Látex" || 
              tempRecurso.subCategoria === "Guantes de Nitrilo") && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Talla <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    size="sm"
                    value={tempRecurso.talla || ''}
                    isInvalid={!!localErrors.talla}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, talla: e.target.value });
                      setLocalErrors({ ...localErrors, talla: '' });
                    }}
                  >
                    <option value="">Selecciona la talla</option>
                    {renderTallaOptions(tempRecurso.subCategoria)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.talla}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}

            {(tempRecurso.subCategoria === "Camas" || 
              tempRecurso.subCategoria === "Colchones" || 
              tempRecurso.subCategoria === "Sábanas y Frazadas") && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Tamaño <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    size="sm"
                    value={tempRecurso.tamano || ''}
                    isInvalid={!!localErrors.tamano}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, tamano: e.target.value });
                      setLocalErrors({ ...localErrors, tamano: '' });
                    }}
                  >
                    <option value="">Selecciona el tamaño</option>
                    {["1 Plaza", "1.5 Plazas", "2 Plazas", "King", "Super King"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.tamano}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}

            {tempRecurso.categoria === "Alimentos para Mascotas" && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Etapa/Edad <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    size="sm"
                    value={tempRecurso.etapa || ''}
                    isInvalid={!!localErrors.etapa}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, etapa: e.target.value });
                      setLocalErrors({ ...localErrors, etapa: '' });
                    }}
                  >
                    <option value="">Selecciona la etapa</option>
                    {["Cachorro/Gatito", "Adulto", "Senior", "Todas las edades"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.etapa}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}

            {(tempRecurso.categoria === "Alimentos" || tempRecurso.categoria === "Alimentos imperecederos") && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small text-muted">Restricción Dietética (Opcional)</Form.Label>
                  <Form.Select 
                    size="sm"
                    value={tempRecurso.restriccionDietetica || ''}
                    onChange={(e) => setTempRecurso({ ...tempRecurso, restriccionDietetica: e.target.value })}
                  >
                    <option value="">Ninguna</option>
                    {["Sin Gluten", "Sin Lactosa", "Vegano/Vegetariano", "Para Diabéticos"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            {!hideEstadoLocal && tempRecurso.categoria && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Estado <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.estadoArticulo}
                    isInvalid={!!localErrors.estadoArticulo}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, estadoArticulo: e.target.value });
                      setLocalErrors({ ...localErrors, estadoArticulo: '' });
                    }}
                  >
                    <option value="">Selecciona el estado</option>
                    <option value="Nuevo">Nuevo (Sin abrir/Sin uso)</option>
                    <option value="Buen Estado">Buen Estado (Usado pero funcional)</option>
                    <option value="Para Reparar">Para Reparar (Requiere arreglos menores)</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.estadoArticulo}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Unidad de Medida <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  value={tempRecurso.unidadMedida}
                  isInvalid={!!localErrors.unidadMedida}
                  disabled={!tempRecurso.categoria}
                  onChange={(e) => {
                    setTempRecurso({ ...tempRecurso, unidadMedida: e.target.value });
                    setLocalErrors({ ...localErrors, unidadMedida: '' });
                  }}
                >
                  <option value="">Selecciona la unidad</option>
                  {unidadesDisponibles.map(u => <option key={u} value={u}>{u}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{localErrors.unidadMedida}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Cantidad <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="number" 
                  step="any" 
                  min="0.01" 
                  max="999999"
                  onKeyDown={blockInvalidNumberKeys}
                  value={tempRecurso.cantidad}
                  isInvalid={!!localErrors.cantidad}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (Number(val) > 999999) val = '999999';
                    setTempRecurso({ ...tempRecurso, cantidad: val });
                    setLocalErrors({ ...localErrors, cantidad: '' });
                  }}
                />
                <Form.Control.Feedback type="invalid">{localErrors.cantidad}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            {requiresDateLocal && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Fecha de Vencimiento <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="date" 
                    min={new Date().toISOString().split('T')[0]}
                    max={maxDateStrLocal} 
                    value={tempRecurso.fechaVencimiento}
                    isInvalid={!!localErrors.fechaVencimiento}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, fechaVencimiento: e.target.value });
                      setLocalErrors({ ...localErrors, fechaVencimiento: '' });
                    }}
                  />
                  <Form.Control.Feedback type="invalid">{localErrors.fechaVencimiento}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
            <Col md={requiresDateLocal ? 6 : 12}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Peso Aproximado (kg) <span className="text-muted">(Opcional)</span></Form.Label>
                <Form.Control 
                  type="number" 
                  step="any" 
                  min="0.01" 
                  max="99999"
                  onKeyDown={blockInvalidNumberKeys}
                  value={tempRecurso.pesoAproximado}
                  isInvalid={!!localErrors.pesoAproximado}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (Number(val) > 99999) val = '99999';
                    setTempRecurso({ ...tempRecurso, pesoAproximado: val });
                    setLocalErrors({ ...localErrors, pesoAproximado: '' });
                  }}
                />
                <Form.Control.Feedback type="invalid">{localErrors.pesoAproximado}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="text-end mt-3">
            <Button variant="primary" className="fw-semibold px-4" onClick={handleAgregarRecurso}>
              <Plus size={18} className="me-2" />
              Añadir a la lista
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Tabla de Recursos Añadidos */}
      {fields.length > 0 && (() => {
        const totalPages = Math.ceil(fields.length / ITEMS_PER_PAGE);
        // Asegurar que la página actual sea válida si se eliminan elementos
        if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
        const paginatedFields = fields.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

        return (
          <div className="mb-5">
            <h6 className="fw-bold mb-3">Recursos en esta donación ({fields.length}):</h6>
            <div className="table-responsive bg-white rounded shadow-sm" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <Table hover className="align-middle mb-0" style={{ minWidth: '600px' }}>
                <thead className="bg-light sticky-top">
                  <tr>
                    <th className="py-3 px-3">Categoría</th>
                    <th className="py-3 px-3">Recurso</th>
                    <th className="py-3 px-3">Cant.</th>
                    <th className="py-3 px-3 text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFields.map((item, localIndex) => {
                    const absoluteIndex = (currentPage - 1) * ITEMS_PER_PAGE + localIndex;
                    return (
                      <tr key={item.id}>
                        <td className="px-3">
                          <div className="fw-semibold text-dark">{item.categoria}</div>
                          {item.estadoArticulo && <Badge bg="secondary" className="fw-normal">{item.estadoArticulo}</Badge>}
                        </td>
                        <td className="px-3">
                          <div>{item.subCategoria}</div>
                          {item.fechaVencimiento && (
                            <small className="text-muted d-block">Vence: {new Date(item.fechaVencimiento).toLocaleDateString()}</small>
                          )}
                        </td>
                        <td className="px-3">
                          <span className="fw-bold">{item.cantidad}</span> <span className="text-muted small">{item.unidadMedida}</span>
                          {item.pesoAproximado && <div className="text-muted small">Peso: {item.pesoAproximado} kg</div>}
                        </td>
                        <td className="text-end px-3">
                          <Button variant="outline-danger" size="sm" onClick={() => remove(absoluteIndex)} title="Eliminar recurso">
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-3">
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Anterior
                </Button>
                <span className="mx-3 align-self-center small text-muted">
                  Página {currentPage} de {totalPages}
                </span>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        );
      })()}

      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Fotografía General <span className="text-muted">(Opcional)</span></Form.Label>
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
