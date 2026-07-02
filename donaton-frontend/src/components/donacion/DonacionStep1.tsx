import React, { useState } from 'react';
import { Form, Row, Col, Button, Card, Table, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Trash2, Plus, Info } from 'lucide-react';
import type { DonacionGlobalValues } from './DonacionSchemas';
import { getMaxYearsForSubcategory } from './DonacionSchemas';
import { SUBCATEGORIAS, getUnidadesDisponibles, FORMATOS_ABARROTES, TIPOS_LECHE, TIPOS_YOGUR, getEnvasesPallet, FORMATOS_QUESO, PESOS_QUESO, FORMATOS_TE, FORMATOS_CAFE, FORMATOS_ACEITE, FORMATOS_CONSERVA, FORMATOS_SALSA, FORMATOS_MANTEQUILLA, FORMATOS_FIAMBRE, FORMATOS_MASCOTAS } from '../../utils/unidadesLogic';

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
  restriccionDietetica: '',
  dimensiones: '',
  litros: '',
  unidadesPorEnvase: '',
  pesoPorSaco: '',
  unidadesPorSaco: '',
  tipoEnvaseCaja: '',
  pesoPorCaja: '',
  tipoEnvasePallet: '',
  cantidadEnvasePallet: '',
  pesoPorEnvasePallet: '',
  unidadesPorEnvasePallet: '',
  unidadesPorPaquete: '',
  tipoEnvaseCajaPallet: '',
  unidadesPorPaquetePallet: '',
  formatoSupermercado: '',
  tipoLeche: '',
  tipoYogur: '',
  capacidadBandeja: '',
  formatoQueso: '',
  pesoQueso: '',
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

const checkCategoriaSubCategoria = (tempRecurso: typeof INITIAL_TEMP_RECURSO, errs: Record<string, string>) => {
  if (!tempRecurso.categoria) errs.categoria = "La categoría es obligatoria";
  if (!tempRecurso.subCategoria) errs.subCategoria = "La subcategoría es obligatoria";
};

const isUnidadBaseFn = (tempRecurso: typeof INITIAL_TEMP_RECURSO) => {
  return tempRecurso.unidadMedida === 'Unidades' || 
    tempRecurso.unidadMedida === 'Paquetes' ||
    (tempRecurso.unidadMedida === 'Cajas' && ['Unidades', 'Paquetes'].includes(tempRecurso.tipoEnvaseCaja)) ||
    (tempRecurso.unidadMedida === 'Pallets' && (
      ['Unidades', 'Paquetes'].includes(tempRecurso.tipoEnvasePallet) ||
      (tempRecurso.tipoEnvasePallet === 'Cajas' && ['Unidades', 'Paquetes'].includes(tempRecurso.tipoEnvaseCajaPallet))
    ));
};

const isBandejaBaseFn = (tempRecurso: typeof INITIAL_TEMP_RECURSO) => {
  if (tempRecurso.subCategoria !== 'Huevos') return false;
  return tempRecurso.unidadMedida === 'Bandejas' || 
    tempRecurso.unidadMedida === 'Paquetes' ||
    (tempRecurso.unidadMedida === 'Cajas' && ['Bandejas', 'Paquetes'].includes(tempRecurso.tipoEnvaseCaja)) ||
    (tempRecurso.unidadMedida === 'Pallets' && (
      ['Bandejas', 'Paquetes'].includes(tempRecurso.tipoEnvasePallet) ||
      (tempRecurso.tipoEnvasePallet === 'Cajas' && ['Bandejas', 'Paquetes'].includes(tempRecurso.tipoEnvaseCajaPallet))
    ));
};

const checkCantidadBase = (tempRecurso: typeof INITIAL_TEMP_RECURSO, errs: Record<string, string>) => {
  const cantidadNum = Number(tempRecurso.cantidad);
  if (!tempRecurso.cantidad || Number.isNaN(cantidadNum) || cantidadNum <= 0) {
    if (!tempRecurso.cantidad) errs.cantidad = "La cantidad es obligatoria";
    else if (cantidadNum <= 0) errs.cantidad = "La cantidad debe ser mayor a 0";
  }
};

const checkFormatosEspeciales = (tempRecurso: typeof INITIAL_TEMP_RECURSO, errs: Record<string, string>) => {
  if (['Quesos', 'Mantequilla/Margarina', 'Fiambres y Embutidos'].includes(tempRecurso.subCategoria) && isUnidadBaseFn(tempRecurso)) {
    if (!tempRecurso.formatoQueso) errs.formatoQueso = "Indique el formato del producto";
    if (!tempRecurso.pesoQueso) errs.pesoQueso = "Indique el peso por unidad";
  }

  if (isBandejaBaseFn(tempRecurso) && !tempRecurso.capacidadBandeja) {
    errs.capacidadBandeja = "Indique la capacidad de la bandeja";
  }
};

const validateCajasPaquetes = (tempRecurso: typeof INITIAL_TEMP_RECURSO, errs: Record<string, string>) => {
  if (['Frutas', 'Verduras', 'Panadería'].includes(tempRecurso.subCategoria) || tempRecurso.tipoEnvaseCaja === 'Kilogramos') {
    if (!tempRecurso.pesoPorCaja) errs.pesoPorCaja = "Indique los Kg por Caja/Paquete";
  } else {
    if (!tempRecurso.tipoEnvaseCaja) errs.tipoEnvaseCaja = "Seleccione el tipo de envase";
    if (['Unidades', 'Paquetes', 'Bandejas'].includes(tempRecurso.tipoEnvaseCaja || '') && !tempRecurso.unidadesPorEnvase) {
      errs.unidadesPorEnvase = "Indique la cantidad de unidades por envase";
    }
  }
};

const validatePallets = (tempRecurso: typeof INITIAL_TEMP_RECURSO, errs: Record<string, string>) => {
  if (!tempRecurso.tipoEnvasePallet) errs.tipoEnvasePallet = "Seleccione qué contiene el pallet";
  if (!tempRecurso.cantidadEnvasePallet) errs.cantidadEnvasePallet = "Indique la cantidad";
};

const checkUnidadCantidad = (tempRecurso: typeof INITIAL_TEMP_RECURSO, errs: Record<string, string>) => {
  if (!tempRecurso.unidadMedida) errs.unidadMedida = "El formato de entrega es obligatorio";
  
  checkCantidadBase(tempRecurso, errs);

  if (['Cajas', 'Paquetes'].includes(tempRecurso.unidadMedida)) {
    validateCajasPaquetes(tempRecurso, errs);
  }

  if (tempRecurso.unidadMedida === 'Pallets') {
    validatePallets(tempRecurso, errs);
  }

  if (tempRecurso.unidadMedida === 'Sacos') {
    const isSacoKg = ["Alimentos", "Alimentos imperecederos", "Materiales de Construcción", "Alimentos para Mascotas", "Insumos Agrícolas"].includes(tempRecurso.categoria) || ["Frutas", "Verduras", "Panadería"].includes(tempRecurso.subCategoria);
    if (isSacoKg && !tempRecurso.pesoPorSaco) {
      errs.pesoPorSaco = "Indique el peso aproximado de cada saco (en kg)";
    } else if (!isSacoKg && !tempRecurso.unidadesPorSaco) {
      errs.unidadesPorSaco = "Indique la cantidad de unidades por saco";
    }
  }

  checkFormatosEspeciales(tempRecurso, errs);
};

const checkRopaCalzado = (tempRecurso: typeof INITIAL_TEMP_RECURSO, errs: Record<string, string>) => {
  if (tempRecurso.categoria === "Ropa y Calzado") {
    if (!tempRecurso.genero) errs.genero = "El género es obligatorio para ropa/calzado";
    if (!tempRecurso.talla) errs.talla = "La talla es obligatoria para ropa/calzado";
  }
};

const validateRecursoLocal = (tempRecurso: typeof INITIAL_TEMP_RECURSO) => {
  const errs: Record<string, string> = {};

  checkCategoriaSubCategoria(tempRecurso, errs);
  
  const hideEstado = [
    "Agua e Hidratación",
    "Artículos de Higiene Personal",
    "Insumos Médicos"
  ].includes(tempRecurso.categoria) || tempRecurso.categoria.toLowerCase().includes("alimento");

  if (!hideEstado && !tempRecurso.estadoArticulo) {
    errs.estadoArticulo = "El estado del artículo es obligatorio";
  }

  checkUnidadCantidad(tempRecurso, errs);
  validateFechaVencimiento(tempRecurso, errs);
  checkRopaCalzado(tempRecurso, errs);

  return { errs, hideEstado, cantidadNum: Number(tempRecurso.cantidad) };
};

const renderTallaOptions = (subCategoria: string) => {
  if (subCategoria === 'Ropa de Bebé') {
    return ["0-3 meses", "3-6 meses", "6-9 meses", "9-12 meses", "12-18 meses", "18-24 meses", "2-3 años"].map(t => (
      <option key={t} value={t}>{t}</option>
    ));
  }
  if (subCategoria === 'Pantalones' || subCategoria === 'Jeans') {
    return Array.from({length: 22}, (_, i) => 24 + i * 2).map(t => (
      <option key={t} value={t.toString()}>{t}</option>
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

// eslint-disable-next-line sonarjs/cognitive-complexity
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

    append({
      categoria: tempRecurso.categoria,
      subCategoria: tempRecurso.subCategoria,
      estadoArticulo: hideEstado ? 'Nuevo' : tempRecurso.estadoArticulo,
      unidadMedida: tempRecurso.unidadMedida,
      cantidad: cantidadNum,
      pesoAproximado: tempRecurso.pesoAproximado ? Number(tempRecurso.pesoAproximado) : undefined,
      fechaVencimiento: tempRecurso.fechaVencimiento || undefined,
      formatoSupermercado: tempRecurso.formatoSupermercado || undefined,
      tipoLeche: tempRecurso.tipoLeche || undefined,
      tipoYogur: tempRecurso.tipoYogur || undefined,
      formatoQueso: tempRecurso.formatoQueso || undefined,
      pesoQueso: tempRecurso.pesoQueso || undefined,
      genero: tempRecurso.genero || undefined,
      talla: tempRecurso.talla || undefined,
      tamano: tempRecurso.tamano || undefined,
      etapa: tempRecurso.etapa || undefined,
      restriccionDietetica: tempRecurso.restriccionDietetica || undefined,
      dimensiones: tempRecurso.dimensiones || undefined,
      litros: tempRecurso.litros || undefined,
      unidadesPorEnvase: tempRecurso.unidadesPorEnvase ? Number(tempRecurso.unidadesPorEnvase) : undefined,
      pesoPorSaco: tempRecurso.pesoPorSaco ? Number(tempRecurso.pesoPorSaco) : undefined,
      unidadesPorSaco: tempRecurso.unidadesPorSaco ? Number(tempRecurso.unidadesPorSaco) : undefined,
      tipoEnvaseCaja: tempRecurso.tipoEnvaseCaja || undefined,
      pesoPorCaja: tempRecurso.pesoPorCaja ? Number(tempRecurso.pesoPorCaja) : undefined,
      tipoEnvasePallet: tempRecurso.tipoEnvasePallet || undefined,
      cantidadEnvasePallet: tempRecurso.cantidadEnvasePallet ? Number(tempRecurso.cantidadEnvasePallet) : undefined,
      pesoPorEnvasePallet: tempRecurso.pesoPorEnvasePallet ? Number(tempRecurso.pesoPorEnvasePallet) : undefined,
      unidadesPorEnvasePallet: tempRecurso.unidadesPorEnvasePallet ? Number(tempRecurso.unidadesPorEnvasePallet) : undefined,
      unidadesPorPaquete: tempRecurso.unidadesPorPaquete ? Number(tempRecurso.unidadesPorPaquete) : undefined,
      tipoEnvaseCajaPallet: tempRecurso.tipoEnvaseCajaPallet || undefined,
      unidadesPorPaquetePallet: tempRecurso.unidadesPorPaquetePallet ? Number(tempRecurso.unidadesPorPaquetePallet) : undefined,
    });

    setTempRecurso(INITIAL_TEMP_RECURSO);
    setLocalErrors({});
    trigger('recursos');
  };

  const unidadesDisponibles = getUnidadesDisponibles(tempRecurso.categoria, tempRecurso.subCategoria);
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
                  <option value="">Selecciona una opción</option>
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
                    // eslint-disable-next-line sonarjs/cognitive-complexity
                    onChange={(e) => {
                      const newSub = e.target.value;
                      const updates: any = { subCategoria: newSub };
                      
                      if (tempRecurso.unidadMedida === 'Pallets') {
                        const envases = getEnvasesPallet(tempRecurso.categoria, newSub);
                        if (envases.length === 1) {
                          updates.tipoEnvasePallet = envases[0];
                          if (envases[0] === 'Cajas' && newSub === 'Comida Preparada') {
                            updates.tipoEnvaseCajaPallet = 'Unidades';
                          }
                        } else if (tempRecurso.tipoEnvasePallet && !envases.includes(tempRecurso.tipoEnvasePallet)) {
                          updates.tipoEnvasePallet = '';
                        } else if (tempRecurso.tipoEnvasePallet === 'Cajas' && newSub === 'Comida Preparada') {
                          updates.tipoEnvaseCajaPallet = 'Unidades';
                        }
                      }
                      
                      if (['Cajas', 'Paquetes'].includes(tempRecurso.unidadMedida) && !['Frutas', 'Verduras'].includes(newSub)) {
                        const hasKg = ['Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Clavos', 'Tornillos'].includes(newSub);
                        if ((tempRecurso.unidadMedida === 'Paquetes' && !hasKg) || (tempRecurso.unidadMedida === 'Cajas' && newSub === 'Comida Preparada')) {
                          updates.tipoEnvaseCaja = 'Unidades';
                        }
                      }
                      
                      setTempRecurso({ ...tempRecurso, ...updates });
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
                      <option value="">Selecciona una opción</option>
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
                      <option value="">Selecciona una opción</option>
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
                    <option value="">Selecciona una opción</option>
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
                    <option value="">Selecciona una opción</option>
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
                    <option value="">Selecciona una opción</option>
                    {["Cachorro/Gatito", "Adulto", "Senior", "Todas las edades"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.etapa}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}

            {[
              "Comida Preparada", "Lácteos", "Refrigerados", "Panadería", "Pastelería", 
              "Fideos", "Pastas", "Leche en Polvo", "Leche (Caja larga vida)", 
              "Harina", "Avena", "Cereales"
            ].includes(tempRecurso.subCategoria) && (
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

            {tempRecurso.categoria === "Materiales de Construcción" && 
              !["Cemento", "Pintura", "Arena", "Grava", "Yeso"].includes(tempRecurso.subCategoria) && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Dimensiones/Medidas <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    placeholder="Ej: 2x4 pulgadas, 3 metros..."
                    value={tempRecurso.dimensiones || ''}
                    isInvalid={!!localErrors.dimensiones}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, dimensiones: e.target.value });
                      setLocalErrors({ ...localErrors, dimensiones: '' });
                    }}
                  />
                  <Form.Control.Feedback type="invalid">{localErrors.dimensiones}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}

            {tempRecurso.categoria === "Agua e Hidratación" && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Litros (Capacidad) <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    size="sm"
                    value={tempRecurso.litros || ''}
                    isInvalid={!!localErrors.litros}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, litros: e.target.value });
                      setLocalErrors({ ...localErrors, litros: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {(tempRecurso.subCategoria === "Agua Embotellada (Bidón)"
                      ? ["Bidón 5 Litros", "Bidón 10 Litros", "Bidón 12 Litros", "Bidón 20 Litros"]
                      : ["Menos de 500ml", "500ml", "1 Litro", "1.5 a 2 Litros", "3 Litros"]
                    ).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.litros}</Form.Control.Feedback>
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
                    <option value="">Selecciona una opción</option>
                    <option value="Nuevo">Nuevo</option>
                    <option value="Usado - Buen Estado">Usado - Buen Estado</option>
                    <option value="Usado - Desgaste Visible">Usado - Desgaste Visible pero Funcional</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.estadoArticulo}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            )}
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Formato de Entrega <span className="text-danger">*</span></Form.Label>
                <Form.Select 
                  value={tempRecurso.unidadMedida}
                  isInvalid={!!localErrors.unidadMedida}
                  disabled={!tempRecurso.subCategoria}
                  onChange={(e) => {
                    const newUnidad = e.target.value;
                    const updates: any = { unidadMedida: newUnidad };
                    if (newUnidad === 'Pallets') {
                      const envases = getEnvasesPallet(tempRecurso.categoria, tempRecurso.subCategoria);
                      if (envases.length === 1) {
                        updates.tipoEnvasePallet = envases[0];
                        if (envases[0] === 'Cajas' && tempRecurso.subCategoria === 'Comida Preparada') {
                          updates.tipoEnvaseCajaPallet = 'Unidades';
                        }
                      }
                    } else if (['Cajas', 'Paquetes'].includes(newUnidad) && !['Frutas', 'Verduras'].includes(tempRecurso.subCategoria)) {
                      const hasKg = ['Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Clavos', 'Tornillos'].includes(tempRecurso.subCategoria);
                      if ((newUnidad === 'Paquetes' && !hasKg) || (newUnidad === 'Cajas' && tempRecurso.subCategoria === 'Comida Preparada')) {
                        updates.tipoEnvaseCaja = 'Unidades';
                      }
                    }
                    setTempRecurso({ ...tempRecurso, ...updates });
                    setLocalErrors({ ...localErrors, unidadMedida: '' });
                  }}
                >
                  <option value="">Selecciona una opción</option>
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

          {/* === INICIO LÓGICA CONDICIONAL V3 === */}
          
          {/* CAJAS Y PAQUETES */}
          {['Cajas', 'Paquetes'].includes(tempRecurso.unidadMedida) && (
            <>
              {/* Frutas y Verduras en Cajas -> Kg */}
              {['Frutas', 'Verduras', 'Panadería'].includes(tempRecurso.subCategoria) ? (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small">Kg por {tempRecurso.unidadMedida === 'Cajas' ? 'Caja' : 'Paquete'} <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="number" step="any" min="0.01" max="25"
                        value={tempRecurso.pesoPorCaja}
                        isInvalid={!!localErrors.pesoPorCaja}
                        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (Number(val) >= 0 && Number(val) <= 25 && val.length <= 5)) {
                            setTempRecurso({ ...tempRecurso, pesoPorCaja: val });
                          }
                        }}
                      />
                      <Form.Text className="text-muted d-block mt-1"><small>Máximo 25 kg (Ley 20.949)</small></Form.Text>
                      <Form.Control.Feedback type="invalid">{localErrors.pesoPorCaja}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small">¿Qué contiene {tempRecurso.unidadMedida === 'Cajas' ? 'la Caja' : 'el Paquete'}? <span className="text-danger">*</span></Form.Label>
                      <Form.Select 
                        value={tempRecurso.tipoEnvaseCaja || ''}
                        isInvalid={!!localErrors.tipoEnvaseCaja}
                        disabled={
                          (tempRecurso.unidadMedida === 'Paquetes' && !['Huevos', 'Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Clavos', 'Tornillos'].includes(tempRecurso.subCategoria)) ||
                          (tempRecurso.unidadMedida === 'Cajas' && tempRecurso.subCategoria === 'Comida Preparada')
                        }
                        onChange={(e) => {
                          setTempRecurso({ ...tempRecurso, tipoEnvaseCaja: e.target.value, unidadesPorEnvase: '', pesoPorCaja: '', unidadesPorPaquete: '' });
                          setLocalErrors({ ...localErrors, tipoEnvaseCaja: '' });
                        }}
                      >
                        <option value="">Selecciona una opción</option>
                        {tempRecurso.subCategoria === 'Huevos' ? (
                          <option value="Bandejas">Bandejas</option>
                        ) : (
                          <option value="Unidades">Unidades</option>
                        )}
                        {tempRecurso.unidadMedida === 'Cajas' && tempRecurso.subCategoria !== 'Comida Preparada' && (
                          <option value="Paquetes">Paquetes</option>
                        )}
                        {['Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Clavos', 'Tornillos'].includes(tempRecurso.subCategoria) && (
                          <option value="Kilogramos">Kilogramos</option>
                        )}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{localErrors.tipoEnvaseCaja}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  {['Unidades', 'Paquetes', 'Bandejas'].includes(tempRecurso.tipoEnvaseCaja) && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small">{tempRecurso.tipoEnvaseCaja} por {tempRecurso.unidadMedida === 'Cajas' ? 'Caja' : 'Paquete'} <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="number" step="1" min="1" max="9999"
                          value={tempRecurso.unidadesPorEnvase}
                          isInvalid={!!localErrors.unidadesPorEnvase}
                          onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (Number(val) >= 0 && Number(val) <= 9999 && val.length <= 4)) {
                              setTempRecurso({ ...tempRecurso, unidadesPorEnvase: val });
                            }
                          }}
                        />
                        <Form.Control.Feedback type="invalid">{localErrors.unidadesPorEnvase}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  )}

                  {tempRecurso.tipoEnvaseCaja === 'Paquetes' && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small">{tempRecurso.subCategoria === 'Huevos' ? 'Bandejas' : 'Unidades'} por Paquete <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="number" step="1" min="1" max="9999"
                          value={tempRecurso.unidadesPorPaquete}
                          isInvalid={!!localErrors.unidadesPorPaquete}
                          onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (Number(val) >= 0 && Number(val) <= 9999 && val.length <= 4)) {
                              setTempRecurso({ ...tempRecurso, unidadesPorPaquete: val });
                            }
                          }}
                        />
                        <Form.Control.Feedback type="invalid">{localErrors.unidadesPorPaquete}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  )}

                  {tempRecurso.tipoEnvaseCaja === 'Kilogramos' && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small">Kg por {tempRecurso.unidadMedida === 'Cajas' ? 'Caja' : 'Paquete'} <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="number" step="any" min="0.01" max="25"
                          value={tempRecurso.pesoPorCaja}
                          isInvalid={!!localErrors.pesoPorCaja}
                          onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (Number(val) >= 0 && Number(val) <= 25 && val.length <= 5)) {
                              setTempRecurso({ ...tempRecurso, pesoPorCaja: val });
                            }
                          }}
                        />
                        <Form.Text className="text-muted d-block mt-1"><small>Máximo 25 kg (Ley 20.949)</small></Form.Text>
                        <Form.Control.Feedback type="invalid">{localErrors.pesoPorCaja}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  )}
                </Row>
              )}
            </>
          )}

          {/* SACOS */}
          {tempRecurso.unidadMedida === 'Sacos' && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  {(["Alimentos", "Alimentos imperecederos", "Materiales de Construcción", "Alimentos para Mascotas", "Insumos Agrícolas"].includes(tempRecurso.categoria) || ["Frutas", "Verduras", "Panadería"].includes(tempRecurso.subCategoria)) ? (
                    <>
                      <Form.Label className="fw-semibold small">Peso por Saco (Kg) <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number" step="any" min="1" max={25}
                        placeholder="Ej: 25"
                        value={tempRecurso.pesoPorSaco}
                        isInvalid={!!localErrors.pesoPorSaco}
                        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (Number(val) >= 0 && Number(val) <= 25 && val.length <= 5)) {
                            setTempRecurso({ ...tempRecurso, pesoPorSaco: val });
                          }
                        }}
                      />
                      <Form.Text className="text-muted d-block mt-1">
                        <small>Máximo 25 kg (Ley 20.949)</small>
                      </Form.Text>
                      <Form.Control.Feedback type="invalid">{localErrors.pesoPorSaco}</Form.Control.Feedback>
                    </>
                  ) : (
                    <>
                      <Form.Label className="fw-semibold small">Unidades por Saco <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="number" min="1"
                        placeholder="Ej: 50"
                        value={tempRecurso.unidadesPorSaco}
                        isInvalid={!!localErrors.unidadesPorSaco}
                        onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (Number(val) > 0 && val.length <= 5)) {
                            setTempRecurso({ ...tempRecurso, unidadesPorSaco: val });
                          }
                        }}
                      />
                      <Form.Control.Feedback type="invalid">{localErrors.unidadesPorSaco}</Form.Control.Feedback>
                    </>
                  )}
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* PALLETS */}
          {tempRecurso.unidadMedida === 'Pallets' && (
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Contiene <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.tipoEnvasePallet || ''}
                    isInvalid={!!localErrors.tipoEnvasePallet}
                    disabled={getEnvasesPallet(tempRecurso.categoria, tempRecurso.subCategoria).length === 1}
                    onChange={(e) => {
                      const newTipo = e.target.value;
                      let autoTipoCaja = '';
                      if (newTipo === 'Cajas' && tempRecurso.subCategoria === 'Comida Preparada') {
                        autoTipoCaja = 'Unidades';
                      }
                      setTempRecurso({ ...tempRecurso, tipoEnvasePallet: newTipo, cantidadEnvasePallet: '', unidadesPorEnvasePallet: '', pesoPorEnvasePallet: '', tipoEnvaseCajaPallet: autoTipoCaja, unidadesPorPaquetePallet: '' });
                      setLocalErrors({ ...localErrors, tipoEnvasePallet: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {getEnvasesPallet(tempRecurso.categoria, tempRecurso.subCategoria).map(envase => (
                      <option key={envase} value={envase}>
                        {envase === 'Unidades' ? 'Unidades Sueltas' : envase}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.tipoEnvasePallet}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              {tempRecurso.tipoEnvasePallet && (
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Cantidad de {tempRecurso.tipoEnvasePallet} por Pallet <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="number" step="1" min="1" max="999"
                      value={tempRecurso.cantidadEnvasePallet}
                      isInvalid={!!localErrors.cantidadEnvasePallet}
                      onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || (Number(val) >= 0 && Number(val) <= 999 && val.length <= 3)) {
                          setTempRecurso({ ...tempRecurso, cantidadEnvasePallet: val });
                        }
                      }}
                    />
                    <Form.Control.Feedback type="invalid">{localErrors.cantidadEnvasePallet}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}

              {tempRecurso.tipoEnvasePallet === 'Cajas' && (
                <>
                  {['Frutas', 'Verduras', 'Panadería'].includes(tempRecurso.subCategoria) ? (
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small">Kg por Caja <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="number" step="any" min="0.01" max="25"
                          value={tempRecurso.pesoPorEnvasePallet}
                          isInvalid={!!localErrors.pesoPorEnvasePallet}
                          onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (Number(val) >= 0 && Number(val) <= 25 && val.length <= 5)) {
                              setTempRecurso({ ...tempRecurso, pesoPorEnvasePallet: val });
                            }
                          }}
                        />
                        <Form.Text className="text-muted d-block mt-1"><small>Máximo 25 kg (Ley 20.949)</small></Form.Text>
                        <Form.Control.Feedback type="invalid">{localErrors.pesoPorEnvasePallet}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  ) : (
                    <>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold small">¿Qué contiene la Caja? <span className="text-danger">*</span></Form.Label>
                          <Form.Select 
                            value={tempRecurso.tipoEnvaseCajaPallet || ''}
                            isInvalid={!!localErrors.tipoEnvaseCajaPallet}
                            disabled={tempRecurso.subCategoria === 'Comida Preparada'}
                            onChange={(e) => {
                              setTempRecurso({ ...tempRecurso, tipoEnvaseCajaPallet: e.target.value, unidadesPorEnvasePallet: '', pesoPorEnvasePallet: '', unidadesPorPaquetePallet: '' });
                              setLocalErrors({ ...localErrors, tipoEnvaseCajaPallet: '' });
                            }}
                          >
                            <option value="">Selecciona una opción</option>
                            {tempRecurso.subCategoria === 'Huevos' ? (
                              <option value="Bandejas">Bandejas</option>
                            ) : (
                              <option value="Unidades">Unidades</option>
                            )}
                            {tempRecurso.subCategoria !== 'Comida Preparada' && (
                              <option value="Paquetes">Paquetes</option>
                            )}
                            {['Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Clavos', 'Tornillos'].includes(tempRecurso.subCategoria) && (
                              <option value="Kilogramos">Kilogramos</option>
                            )}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">{localErrors.tipoEnvaseCajaPallet}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      {['Unidades', 'Paquetes', 'Bandejas'].includes(tempRecurso.tipoEnvaseCajaPallet) && (
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small">{tempRecurso.tipoEnvaseCajaPallet} por Caja <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                              type="number" step="1" min="1" max="9999"
                              value={tempRecurso.unidadesPorEnvasePallet}
                              isInvalid={!!localErrors.unidadesPorEnvasePallet}
                              onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || (Number(val) >= 0 && Number(val) <= 9999 && val.length <= 4)) {
                                  setTempRecurso({ ...tempRecurso, unidadesPorEnvasePallet: val });
                                }
                              }}
                            />
                            <Form.Control.Feedback type="invalid">{localErrors.unidadesPorEnvasePallet}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      )}

                      {tempRecurso.tipoEnvaseCajaPallet === 'Paquetes' && (
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small">{tempRecurso.subCategoria === 'Huevos' ? 'Bandejas' : 'Unidades'} por Paquete <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                              type="number" step="1" min="1" max="9999"
                              value={tempRecurso.unidadesPorPaquetePallet}
                              isInvalid={!!localErrors.unidadesPorPaquetePallet}
                              onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || (Number(val) >= 0 && Number(val) <= 9999 && val.length <= 4)) {
                                  setTempRecurso({ ...tempRecurso, unidadesPorPaquetePallet: val });
                                }
                              }}
                            />
                            <Form.Control.Feedback type="invalid">{localErrors.unidadesPorPaquetePallet}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      )}

                      {tempRecurso.tipoEnvaseCajaPallet === 'Kilogramos' && (
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold small">Kg por Caja <span className="text-danger">*</span></Form.Label>
                            <Form.Control 
                              type="number" step="any" min="0.01" max="25"
                              value={tempRecurso.pesoPorEnvasePallet}
                              isInvalid={!!localErrors.pesoPorEnvasePallet}
                              onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || (Number(val) >= 0 && Number(val) <= 25 && val.length <= 5)) {
                                  setTempRecurso({ ...tempRecurso, pesoPorEnvasePallet: val });
                                }
                              }}
                            />
                            <Form.Text className="text-muted d-block mt-1"><small>Máximo 25 kg (Ley 20.949)</small></Form.Text>
                            <Form.Control.Feedback type="invalid">{localErrors.pesoPorEnvasePallet}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      )}
                    </>
                  )}
                </>
              )}
              
              {tempRecurso.tipoEnvasePallet === 'Sacos' && (
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold small">Kg por Saco <span className="text-danger">*</span></Form.Label>
                    <Form.Control 
                      type="number" step="any" min="1" max={25}
                      value={tempRecurso.pesoPorEnvasePallet}
                      isInvalid={!!localErrors.pesoPorEnvasePallet}
                      onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || (Number(val) >= 0 && Number(val) <= 25 && val.length <= 5)) {
                          setTempRecurso({ ...tempRecurso, pesoPorEnvasePallet: val });
                        }
                      }}
                    />
                    <Form.Text className="text-muted d-block mt-1">
                      <small>Máximo 25 kg (Ley 20.949)</small>
                    </Form.Text>
                    <Form.Control.Feedback type="invalid">{localErrors.pesoPorEnvasePallet}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              )}

              {tempRecurso.tipoEnvasePallet === 'Paquetes' && (
                <Col md={4}>
                  {['Frutas', 'Verduras', 'Panadería'].includes(tempRecurso.subCategoria) ? (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small">Kg por Paquete <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="number" step="any" min="0.01" max="25"
                        value={tempRecurso.pesoPorEnvasePallet}
                        isInvalid={!!localErrors.pesoPorEnvasePallet}
                        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (Number(val) >= 0 && Number(val) <= 25 && val.length <= 5)) {
                            setTempRecurso({ ...tempRecurso, pesoPorEnvasePallet: val });
                          }
                        }}
                      />
                      <Form.Text className="text-muted d-block mt-1"><small>Máximo 25 kg (Ley 20.949)</small></Form.Text>
                      <Form.Control.Feedback type="invalid">{localErrors.pesoPorEnvasePallet}</Form.Control.Feedback>
                    </Form.Group>
                  ) : (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold small">{tempRecurso.subCategoria === 'Huevos' ? 'Bandejas' : 'Unidades'} por Paquete <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="number" step="1" min="1" max="9999"
                        value={tempRecurso.unidadesPorEnvasePallet}
                        isInvalid={!!localErrors.unidadesPorEnvasePallet}
                        onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (Number(val) >= 0 && Number(val) <= 9999 && val.length <= 4)) {
                            setTempRecurso({ ...tempRecurso, unidadesPorEnvasePallet: val });
                          }
                        }}
                      />
                      <Form.Control.Feedback type="invalid">{localErrors.unidadesPorEnvasePallet}</Form.Control.Feedback>
                    </Form.Group>
                  )}
                </Col>
              )}
            </Row>
          )}
          {/* FORMATO SUPERMERCADO para Abarrotes en Unidades */}
          {['Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Sal', 'Fideos', 'Pastas', 'Cereales', 'Leche en Polvo'].includes(tempRecurso.subCategoria) && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Formato del Envase <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.formatoSupermercado || ''}
                    isInvalid={!!localErrors.formatoSupermercado}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, formatoSupermercado: e.target.value });
                      setLocalErrors({ ...localErrors, formatoSupermercado: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_ABARROTES.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.formatoSupermercado}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO TÉ */}
          {tempRecurso.subCategoria === 'Té' && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Formato del Té <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.formatoSupermercado || ''}
                    isInvalid={!!localErrors.formatoSupermercado}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, formatoSupermercado: e.target.value });
                      setLocalErrors({ ...localErrors, formatoSupermercado: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_TE.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.formatoSupermercado}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO CAFÉ */}
          {tempRecurso.subCategoria === 'Café' && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Formato del Café <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.formatoSupermercado || ''}
                    isInvalid={!!localErrors.formatoSupermercado}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, formatoSupermercado: e.target.value });
                      setLocalErrors({ ...localErrors, formatoSupermercado: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_CAFE.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.formatoSupermercado}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO ACEITE */}
          {tempRecurso.subCategoria === 'Aceite' && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Formato del Aceite <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.formatoSupermercado || ''}
                    isInvalid={!!localErrors.formatoSupermercado}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, formatoSupermercado: e.target.value });
                      setLocalErrors({ ...localErrors, formatoSupermercado: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_ACEITE.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.formatoSupermercado}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO CONSERVAS */}
          {['Atún en Conserva', 'Jurel en Conserva'].includes(tempRecurso.subCategoria) && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Formato de Conserva <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.formatoSupermercado || ''}
                    isInvalid={!!localErrors.formatoSupermercado}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, formatoSupermercado: e.target.value });
                      setLocalErrors({ ...localErrors, formatoSupermercado: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_CONSERVA.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.formatoSupermercado}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO MASCOTAS */}
          {['Comida para Perros (Seca)', 'Comida para Gatos (Seca)'].includes(tempRecurso.subCategoria) && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Formato del Saco/Bolsa <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.formatoSupermercado || ''}
                    isInvalid={!!localErrors.formatoSupermercado}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, formatoSupermercado: e.target.value });
                      setLocalErrors({ ...localErrors, formatoSupermercado: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_MASCOTAS.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.formatoSupermercado}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO SALSA */}
          {tempRecurso.subCategoria === 'Salsa de Tomate' && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Formato de la Salsa <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.formatoSupermercado || ''}
                    isInvalid={!!localErrors.formatoSupermercado}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, formatoSupermercado: e.target.value });
                      setLocalErrors({ ...localErrors, formatoSupermercado: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_SALSA.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.formatoSupermercado}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO QUESOS */}
          {tempRecurso.subCategoria === 'Quesos' && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Formato del Producto <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.formatoQueso || ''}
                    isInvalid={!!localErrors.formatoQueso}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, formatoQueso: e.target.value });
                      setLocalErrors({ ...localErrors, formatoQueso: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_QUESO.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.formatoQueso}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Peso por Unidad <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.pesoQueso || ''}
                    isInvalid={!!localErrors.pesoQueso}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, pesoQueso: e.target.value });
                      setLocalErrors({ ...localErrors, pesoQueso: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {PESOS_QUESO.map(p => <option key={p} value={p}>{p}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.pesoQueso}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO MANTEQUILLA / MARGARINA */}
          {tempRecurso.subCategoria === 'Mantequilla/Margarina' && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Formato del Envase <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.formatoSupermercado || ''}
                    isInvalid={!!localErrors.formatoSupermercado}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, formatoSupermercado: e.target.value });
                      setLocalErrors({ ...localErrors, formatoSupermercado: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_MANTEQUILLA.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.formatoSupermercado}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO FIAMBRES Y EMBUTIDOS */}
          {tempRecurso.subCategoria === 'Fiambres y Embutidos' && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Formato del Fiambre <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.formatoSupermercado || ''}
                    isInvalid={!!localErrors.formatoSupermercado}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, formatoSupermercado: e.target.value });
                      setLocalErrors({ ...localErrors, formatoSupermercado: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_FIAMBRE.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.formatoSupermercado}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* TIPOS DE LECHE Y YOGUR */}
          {['Leche de 1 Litro', 'Leche Individual (200ml)', 'Leche (Caja larga vida)'].includes(tempRecurso.subCategoria) && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Tipo de Leche <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.tipoLeche || ''}
                    isInvalid={!!localErrors.tipoLeche}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, tipoLeche: e.target.value });
                      setLocalErrors({ ...localErrors, tipoLeche: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {TIPOS_LECHE.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.tipoLeche}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}
          {['Yogur Individual', 'Yogur en Bolsa (1 Litro)'].includes(tempRecurso.subCategoria) && isUnidadBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Tipo de Yogur <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.tipoYogur || ''}
                    isInvalid={!!localErrors.tipoYogur}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, tipoYogur: e.target.value });
                      setLocalErrors({ ...localErrors, tipoYogur: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {TIPOS_YOGUR.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.tipoYogur}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* HUEVOS (Bandejas) */}
          {isBandejaBaseFn(tempRecurso) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small">Capacidad de la Bandeja <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={tempRecurso.capacidadBandeja || ''}
                    isInvalid={!!localErrors.capacidadBandeja}
                    onChange={(e) => {
                      setTempRecurso({ ...tempRecurso, capacidadBandeja: e.target.value });
                      setLocalErrors({ ...localErrors, capacidadBandeja: '' });
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="12">12 Huevos</option>
                    <option value="30">30 Huevos</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{localErrors.capacidadBandeja}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* === FIN LÓGICA CONDICIONAL V3 === */}

          <Row>
            {requiresDateLocal && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small d-flex align-items-center gap-1">
                    Fecha de Vencimiento <span className="text-danger">*</span>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Recuerda que no se aceptan alimentos vencidos ni medicamentos abiertos</Tooltip>}
                    >
                      <Info size={16} className="text-muted ms-1" style={{ cursor: 'pointer' }} />
                    </OverlayTrigger>
                  </Form.Label>
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
                          {item.categoria === 'Ropa y Calzado' && (item.genero || item.talla) && (
                            <small className="text-muted d-block">
                              {item.genero && `Género: ${item.genero}`} {item.genero && item.talla && '|'} {item.talla && `Talla: ${item.talla}`}
                            </small>
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
