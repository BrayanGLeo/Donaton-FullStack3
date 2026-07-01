import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ingresarNecesidad } from '../../services/bffService';
import { MapLocationPicker } from '../registro/MapLocationPicker';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../../utils/chileData';
import { useAuth } from '../../context/AuthContext';
import { SUBCATEGORIAS, getUnidadesDisponibles, FORMATOS_ABARROTES, TIPOS_LECHE, TIPOS_YOGUR, flattenResourceUnit, getEnvasesPallet, FORMATOS_QUESO, PESOS_QUESO, FORMATOS_TE, FORMATOS_CAFE, FORMATOS_ACEITE, FORMATOS_CONSERVA, FORMATOS_SALSA, FORMATOS_MANTEQUILLA, FORMATOS_FIAMBRE, FORMATOS_MASCOTAS } from '../../utils/unidadesLogic';

const matchRegion = (stateStr?: string) => {
  if (!stateStr) return null;
  const lowerState = stateStr.toLowerCase();
  return REGIONES_CHILE.find(r => lowerState.includes(r.toLowerCase()) || r.toLowerCase().includes(lowerState)) || null;
};

const matchComuna = (comunaRaw?: string) => {
  if (!comunaRaw) return null;
  const lowerComuna = comunaRaw.toLowerCase();
  for (const region of Object.keys(COMUNAS_POR_REGION)) {
    const match = COMUNAS_POR_REGION[region].find(c => lowerComuna.includes(c.toLowerCase()));
    if (match) return { comuna: match, region };
  }
  return null;
};

// Interfaces para Recursos Estructurados
export interface ItemNecesidad {
  id: string;
  categoria: string;
  subcategoria: string;
  cantidad: number | '';
  unidad: string;
  genero?: string;
  talla?: string;
  tamano?: string;
  etapa?: string;
  restriccionDietetica?: string;
  dimensiones?: string;
  litros?: string;
  unidadesPorEnvase?: number | '';
  pesoPorSaco?: number | '';
  tipoEnvaseCaja?: string;
  pesoPorCaja?: number | '';
  tipoEnvasePallet?: string;
  cantidadEnvasePallet?: number | '';
  pesoPorEnvasePallet?: number | '';
  unidadesPorEnvasePallet?: number | '';
  unidadesPorPaquete?: number | '';
  tipoEnvaseCajaPallet?: string;
  unidadesPorPaquetePallet?: number | '';
  formatoSupermercado?: string;
  tipoLeche?: string;
  tipoYogur?: string;
  capacidadBandeja?: string;
  formatoQueso?: string;
  pesoQueso?: string;
}

const isUnidadBaseFn = (item: ItemNecesidad) => {
  return item.unidad === 'Unidades' || 
    item.unidad === 'Paquetes' ||
    (item.unidad === 'Cajas' && ['Unidades', 'Paquetes'].includes(item.tipoEnvaseCaja || '')) ||
    (item.unidad === 'Pallets' && (
      ['Unidades', 'Paquetes'].includes(item.tipoEnvasePallet || '') ||
      (item.tipoEnvasePallet === 'Cajas' && ['Unidades', 'Paquetes'].includes(item.tipoEnvaseCajaPallet || ''))
    ));
};

const isBandejaBaseFn = (item: ItemNecesidad) => {
  if (item.subcategoria !== 'Huevos') return false;
  return item.unidad === 'Bandejas' || 
    item.unidad === 'Paquetes' ||
    (item.unidad === 'Cajas' && ['Bandejas', 'Paquetes'].includes(item.tipoEnvaseCaja || '')) ||
    (item.unidad === 'Pallets' && (
      ['Bandejas', 'Paquetes'].includes(item.tipoEnvasePallet || '') ||
      (item.tipoEnvasePallet === 'Cajas' && ['Bandejas', 'Paquetes'].includes(item.tipoEnvaseCajaPallet || ''))
    ));
};

const CATEGORIAS_DISPONIBLES = [
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
const getSubcategoriaUpdates = (currentItem: ItemNecesidad, newSub: string) => {
  const updates: Partial<ItemNecesidad> = { subcategoria: newSub };
  if (currentItem.unidad === 'Pallets') {
    const envases = getEnvasesPallet(currentItem.categoria, newSub);
    if (envases.length === 1) {
      updates.tipoEnvasePallet = envases[0];
      if (envases[0] === 'Cajas' && newSub === 'Comida Preparada') {
        updates.tipoEnvaseCajaPallet = 'Unidades';
      }
    } else if (currentItem.tipoEnvasePallet && !envases.includes(currentItem.tipoEnvasePallet)) {
      updates.tipoEnvasePallet = '';
    } else if (currentItem.tipoEnvasePallet === 'Cajas' && newSub === 'Comida Preparada') {
      updates.tipoEnvaseCajaPallet = 'Unidades';
    }
  }
  
  if (['Cajas', 'Paquetes'].includes(currentItem.unidad) && !['Frutas', 'Verduras'].includes(newSub)) {
    const hasKg = ['Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Clavos', 'Tornillos'].includes(newSub);
    if ((currentItem.unidad === 'Paquetes' && !hasKg) || (currentItem.unidad === 'Cajas' && newSub === 'Comida Preparada')) {
      updates.tipoEnvaseCaja = 'Unidades';
    }
  }
  return updates;
};

const getUnidadUpdates = (currentItem: ItemNecesidad, newUnidad: string) => {
  const updates: Partial<ItemNecesidad> = { unidad: newUnidad };
  if (newUnidad === 'Pallets') {
    const envases = getEnvasesPallet(currentItem.categoria, currentItem.subcategoria);
    if (envases.length === 1) {
      updates.tipoEnvasePallet = envases[0];
      if (envases[0] === 'Cajas' && currentItem.subcategoria === 'Comida Preparada') {
        updates.tipoEnvaseCajaPallet = 'Unidades';
      }
    }
  } else if (['Cajas', 'Paquetes'].includes(newUnidad) && !['Frutas', 'Verduras'].includes(currentItem.subcategoria)) {
    const hasKg = ['Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Clavos', 'Tornillos'].includes(currentItem.subcategoria);
    if ((newUnidad === 'Paquetes' && !hasKg) || (newUnidad === 'Cajas' && currentItem.subcategoria === 'Comida Preparada')) {
      updates.tipoEnvaseCaja = 'Unidades';
    }
  }
  return updates;
};

const getLabelCantidad = (unidad: string) => {
  if (unidad === 'Kilogramos') return 'Cantidad (Kg)';
  if (unidad === 'Litros') return 'Cantidad (Litros)';
  return 'Cantidad';
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const IngresarNecesidad: React.FC = () => {
  const { usuario } = useAuth();
  const [items, setItems] = useState<ItemNecesidad[]>([]);
  const [currentItem, setCurrentItem] = useState<ItemNecesidad>({ 
    id: crypto.randomUUID(), categoria: '', subcategoria: '', cantidad: '', unidad: '', genero: '', talla: '', 
    unidadesPorEnvase: '', pesoPorSaco: '', tipoEnvaseCaja: '', pesoPorCaja: '', tipoEnvasePallet: '', 
    cantidadEnvasePallet: '', pesoPorEnvasePallet: '', unidadesPorEnvasePallet: '', formatoSupermercado: '', 
    tipoLeche: '', tipoYogur: '', capacidadBandeja: '' 
  });
  const [otroSubcategoria, setOtroSubcategoria] = useState('');
  const [tipoEmergencia, setTipoEmergencia] = useState('');
  const [latitud, setLatitud] = useState<number | ''>('');
  const [longitud, setLongitud] = useState<number | ''>('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const handleLocationSelect = (location: any) => {
    setLatitud(location.lat);
    setLongitud(location.lng);
    
    const address = location.addressDetails;
    if (!address) return;

    let foundRegion = '';
    const regionMatch = matchRegion(address.state);
    if (regionMatch) foundRegion = regionMatch;

    const comunaRaw = address.city || address.town || address.village || address.county;
    const comunaMatchData = matchComuna(comunaRaw);
    if (comunaMatchData) {
      foundRegion = comunaMatchData.region;
      setComuna(comunaMatchData.comuna);
    } else {
      setComuna('');
    }
    
    setRegion(foundRegion);
  };

  const validateFormatosEspeciales = (item: ItemNecesidad, errors: Record<string, string>) => {
    if (item.subcategoria === 'Quesos' && isUnidadBaseFn(item)) {
      if (!item.formatoQueso) errors.formatoQueso = "Requerido";
      if (!item.pesoQueso) errors.pesoQueso = "Requerido";
    }
    if (isBandejaBaseFn(item) && !item.capacidadBandeja) {
      errors.capacidadBandeja = "Requerido";
    }
    if (item.categoria === 'Ropa y Calzado') {
      if (!item.genero) errors.genero = "Requerido";
      if (!item.talla) errors.talla = "Requerido";
    }
  };

  const validateCajasPaquetes = (item: ItemNecesidad, errors: Record<string, string>) => {
    if (['Frutas', 'Verduras', 'Panadería'].includes(item.subcategoria) || item.tipoEnvaseCaja === 'Kilogramos') {
      if (!item.pesoPorCaja) errors.pesoPorCaja = "Requerido";
    } else {
      if (!item.tipoEnvaseCaja) errors.tipoEnvaseCaja = "Requerido";
      if (['Unidades', 'Paquetes', 'Bandejas'].includes(item.tipoEnvaseCaja || '') && !item.unidadesPorEnvase) {
        errors.unidadesPorEnvase = "Requerido";
      }
    }
  };



  const validateItem = (item: ItemNecesidad, finalSubcategoria: string): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!item.categoria) errors.categoria = "Requerido";
    if (!finalSubcategoria) errors.subcategoria = "Requerido";
    if (item.cantidad === '' || Number(item.cantidad) <= 0) errors.cantidad = "Inválido";
    if (!item.unidad) errors.unidad = "Requerido";
    
    if (['Cajas', 'Paquetes'].includes(item.unidad)) validateCajasPaquetes(item, errors);
    if (item.unidad === 'Sacos' && !item.pesoPorSaco) errors.pesoPorSaco = "Requerido";
    
    validateFormatosEspeciales(item, errors);
    return errors;
  };

  const handleAddItem = () => {
    let finalSubcategoria = currentItem.subcategoria;
    if (currentItem.categoria === 'Otro' || currentItem.subcategoria === 'Otro') {
      finalSubcategoria = otroSubcategoria.trim();
      if (!finalSubcategoria) {
        setLocalErrors({ subcategoria: "Requerido" });
        return;
      }
    }

    const errors = validateItem(currentItem, finalSubcategoria);
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }
    
    setLocalErrors({});

    setItems([...items, { ...currentItem, subcategoria: finalSubcategoria }]);
    setCurrentItem({ 
      id: crypto.randomUUID(), categoria: '', subcategoria: '', cantidad: '', unidad: '', genero: '', talla: '', 
      unidadesPorEnvase: '', pesoPorSaco: '', tipoEnvaseCaja: '', pesoPorCaja: '', tipoEnvasePallet: '', 
      cantidadEnvasePallet: '', pesoPorEnvasePallet: '', unidadesPorEnvasePallet: '', formatoSupermercado: '', 
      tipoLeche: '', tipoYogur: '', capacidadBandeja: '' 
    });
    setOtroSubcategoria('');
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };



  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    // Validación de ítems
    const isValidItems = items.every(item => item.categoria && item.subcategoria && item.cantidad !== '' && Number(item.cantidad) > 0);

    if (!isValidItems || items.length === 0 || latitud === '' || longitud === '') {
      setError("Por favor, completa correctamente todos los campos de recursos y la ubicación exacta.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const recursosData = items.map(item => {
        const itemCantidad = Number(item.cantidad);
        const { finalCantidad, finalUnidad } = flattenResourceUnit(item, itemCantidad);

        return {
          ...item,
          cantidad: finalCantidad,
          unidad: finalUnidad,
          litros: item.litros || undefined,
          formatoSupermercado: item.formatoSupermercado || undefined,
          tipoLeche: item.tipoLeche || undefined,
          tipoYogur: item.tipoYogur || undefined,
        };
      });
      const recursosJSON = JSON.stringify(recursosData);

      await ingresarNecesidad({
        recursos: recursosJSON,
        latitud: Number(latitud),
        longitud: Number(longitud),
        tipoEmergencia: tipoEmergencia || undefined,
        region: region || undefined,
        comuna: comuna || undefined,
        coordinadorId: Number(usuario?.id)
      });
      
      setSuccess(true);
      setItems([]);
      setCurrentItem({ id: crypto.randomUUID(), categoria: '', subcategoria: '', cantidad: '', unidad: 'Unidades', genero: '', talla: '', unidadesPorEnvase: '', pesoPorSaco: '' });
      setOtroSubcategoria('');
      setTipoEmergencia('');
      setLatitud('');
      setLongitud('');
      setRegion('');
      setComuna('');
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al registrar la necesidad. Inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary display-6">Registrar Nueva Alerta</h2>
        <p className="text-muted">
          Ingresa las solicitudes de ayuda de manera detallada y selecciona la ubicación exacta en el mapa.
        </p>
      </div>

      <Row className="justify-content-center">
        <Col xs={12} xl={11} className="mb-4">
          <Card className="shadow-sm border-0 rounded-4 h-100">
            <Card.Body className="p-4 p-md-5">
              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
                  ¡Alerta registrada exitosamente! Ya aparecerá en el mapa del centro de coordinación.
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  {/* COLUMNA IZQUIERDA: Recursos y Tipo de Emergencia */}
                  <Col lg={6} className="pe-lg-4 mb-4 mb-lg-0">
                    <div className="mb-4">
                      <Form.Label className="fw-semibold">1. Añadir Recursos Solicitados <span className="text-danger">*</span></Form.Label>
                      <Card className="mb-3 border rounded bg-light shadow-sm">
                        <Card.Body className="p-3">
                          <Row className="g-2">
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="small mb-1">Categoría <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                  id="categoria"
                                  value={currentItem.categoria}
                                  isInvalid={!!localErrors.categoria}
                                  onChange={(e) => {
                                    setCurrentItem({ ...currentItem, categoria: e.target.value, subcategoria: '' });
                                    setOtroSubcategoria('');
                                    setLocalErrors({ ...localErrors, categoria: '' });
                                  }}
                                  disabled={isLoading}
                                >
                                  <option value="">Selecciona una opción</option>
                                  {CATEGORIAS_DISPONIBLES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{localErrors.categoria}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            {currentItem.categoria && (
                              <Col md={12}>
                                <Form.Group>
                                  <Form.Label className="small mb-1">Subcategoría / Recurso <span className="text-danger">*</span></Form.Label>
                                  <Form.Select
                                    value={currentItem.subcategoria}
                                    isInvalid={!!localErrors.subcategoria}
                                    onChange={(e) => {
                                      const newSub = e.target.value;
                                      const updates = getSubcategoriaUpdates(currentItem, newSub);
                                      setCurrentItem({ ...currentItem, ...updates });
                                      if (newSub !== 'Otro') setOtroSubcategoria('');
                                      setLocalErrors({ ...localErrors, subcategoria: '' });
                                    }}
                                    disabled={isLoading}
                                  >
                                    <option value="">Selecciona una opción</option>
                                    {(SUBCATEGORIAS[currentItem.categoria] || []).map(sub => (
                                      <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                    <option value="Otro">Otro (Especificar)</option>
                                  </Form.Select>
                                  <Form.Control.Feedback type="invalid">{localErrors.subcategoria}</Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                            )}
                            {(currentItem.categoria === 'Otro' || currentItem.subcategoria === 'Otro') && (
                              <Col md={12}>
                                <Form.Group>
                                  <Form.Label className="small mb-1">Especificar Recurso <span className="text-danger">*</span></Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="Ej. Pañales talla G, Colchones, etc."
                                    value={otroSubcategoria}
                                    isInvalid={!!localErrors.subcategoria}
                                    onChange={(e) => {
                                      setOtroSubcategoria(e.target.value);
                                      setLocalErrors({ ...localErrors, subcategoria: '' });
                                    }}
                                    disabled={isLoading}
                                    maxLength={100}
                                  />
                                  <Form.Control.Feedback type="invalid">{localErrors.subcategoria}</Form.Control.Feedback>
                                </Form.Group>
                              </Col>
                            )}

                            {currentItem.categoria === 'Ropa y Calzado' && (
                              <>
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label className="small mb-1">Género <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                      value={currentItem.genero || ''}
                                      isInvalid={!!localErrors.genero}
                                      onChange={(e) => {
                                        setCurrentItem({ ...currentItem, genero: e.target.value });
                                        setLocalErrors({ ...localErrors, genero: '' });
                                      }}
                                      disabled={isLoading}
                                    >
                                      <option value="">Selecciona una opción</option>
                                      {currentItem.subcategoria === 'Ropa de Bebé' ? (
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
                                  <Form.Group>
                                    <Form.Label className="small mb-1">Talla <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                      value={currentItem.talla || ''}
                                      isInvalid={!!localErrors.talla}
                                      onChange={(e) => {
                                        setCurrentItem({ ...currentItem, talla: e.target.value });
                                        setLocalErrors({ ...localErrors, talla: '' });
                                      }}
                                      disabled={isLoading}
                                    >
                                      <option value="">Selecciona una opción</option>
                                      {renderTallaOptions(currentItem.subcategoria)}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">{localErrors.talla}</Form.Control.Feedback>
                                  </Form.Group>
                                </Col>
                              </>
                            )}

                              {(currentItem.subcategoria === "Pañales (Bebé)" || 
                                currentItem.subcategoria === "Pañales (Adulto)" || 
                                currentItem.subcategoria === "Guantes de Látex" || 
                                currentItem.subcategoria === "Guantes de Nitrilo") && (
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label className="small mb-1">Talla <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                      size="sm"
                                      value={currentItem.talla || ''}
                                      onChange={(e) => setCurrentItem({ ...currentItem, talla: e.target.value })}
                                      disabled={isLoading}
                                    >
                                      <option value="">Selecciona una opción</option>
                                      {renderTallaOptions(currentItem.subcategoria)}
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                              )}

                              {(currentItem.subcategoria === "Camas" || 
                                currentItem.subcategoria === "Colchones" || 
                                currentItem.subcategoria === "Sábanas y Frazadas") && (
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label className="small mb-1">Tamaño <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                      size="sm"
                                      value={currentItem.tamano || ''}
                                      onChange={(e) => setCurrentItem({ ...currentItem, tamano: e.target.value })}
                                      disabled={isLoading}
                                    >
                                      <option value="">Selecciona una opción</option>
                                      {["1 Plaza", "1.5 Plazas", "2 Plazas", "King", "Super King"].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                              )}

                              {currentItem.categoria === "Alimentos para Mascotas" && (
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label className="small mb-1">Etapa/Edad <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                      size="sm"
                                      value={currentItem.etapa || ''}
                                      onChange={(e) => setCurrentItem({ ...currentItem, etapa: e.target.value })}
                                      disabled={isLoading}
                                    >
                                      <option value="">Selecciona una opción</option>
                                      {["Cachorro/Gatito", "Adulto", "Senior", "Todas las edades"].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                              )}

                              {[
                                "Comida Preparada", "Lácteos", "Refrigerados", "Panadería", "Pastelería", 
                                "Fideos", "Pastas", "Leche en Polvo", "Leche (Caja larga vida)", 
                                "Harina", "Avena", "Cereales"
                              ].includes(currentItem.subcategoria) && (
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label className="small mb-1 text-muted">Restricción Dietética (Opcional)</Form.Label>
                                    <Form.Select
                                      size="sm"
                                      value={currentItem.restriccionDietetica || ''}
                                      onChange={(e) => setCurrentItem({ ...currentItem, restriccionDietetica: e.target.value })}
                                      disabled={isLoading}
                                    >
                                      <option value="">Ninguna</option>
                                      {["Sin Gluten", "Sin Lactosa", "Vegano/Vegetariano", "Para Diabéticos"].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                              )}

                              {currentItem.categoria === "Materiales de Construcción" && 
                                !["Cemento", "Pintura", "Arena", "Grava", "Yeso"].includes(currentItem.subcategoria) && (
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label className="small mb-1">Dimensiones/Medidas (Opcional)</Form.Label>
                                    <Form.Control
                                      type="text"
                                      size="sm"
                                      placeholder="Ej: 2x4 pulgadas, 3 metros..."
                                      value={currentItem.dimensiones || ''}
                                      onChange={(e) => setCurrentItem({ ...currentItem, dimensiones: e.target.value })}
                                      disabled={isLoading}
                                    />
                                  </Form.Group>
                                </Col>
                              )}

                              {currentItem.categoria === "Agua e Hidratación" && (
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label className="small mb-1">Litros (Capacidad) <span className="text-danger">*</span></Form.Label>
                                    <Form.Select
                                      size="sm"
                                      value={currentItem.litros || ''}
                                      onChange={(e) => setCurrentItem({ ...currentItem, litros: e.target.value })}
                                      disabled={isLoading}
                                    >
                                      <option value="">Selecciona una opción</option>
                                      {(currentItem.subcategoria === "Agua Embotellada (Bidón)"
                                        ? ["Bidón 5 Litros", "Bidón 10 Litros", "Bidón 12 Litros", "Bidón 20 Litros"]
                                        : ["Menos de 500ml", "500ml", "1 Litro", "1.5 a 2 Litros", "3 Litros"]
                                      ).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                      ))}
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                              )}

                            <Col md={6}>
                              <Form.Group>
                                  <Form.Label className="small mb-1">Formato de Entrega <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                  value={currentItem.unidad}
                                  isInvalid={!!localErrors.unidad}
                                  onChange={(e) => {
                                    const newUnidad = e.target.value;
                                    const updates = getUnidadUpdates(currentItem, newUnidad);
                                    setCurrentItem({ ...currentItem, ...updates });
                                    setLocalErrors({ ...localErrors, unidad: '' });
                                  }}
                                  disabled={isLoading || !currentItem.subcategoria}
                                >
                                  <option value="">Selecciona una opción</option>
                                  {getUnidadesDisponibles(currentItem.categoria, currentItem.subcategoria)
                                    .filter(uni => uni !== 'Pallets')
                                    .map(uni => (
                                    <option key={uni} value={uni}>{uni}</option>
                                  ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{localErrors.unidad}</Form.Control.Feedback>
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="small mb-1">
                                  {getLabelCantidad(currentItem.unidad)} <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                  type="number"
                                  min={['Kilogramos', 'Litros'].includes(currentItem.unidad) ? "0.01" : "1"}
                                  max={currentItem.unidad === 'Kilogramos' ? "25" : "999999"}
                                  step={['Kilogramos', 'Litros'].includes(currentItem.unidad) ? "any" : "1"}
                                  placeholder="Ej. 50"
                                  value={currentItem.cantidad}
                                  isInvalid={!!localErrors.cantidad}
                                  onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                                  onChange={(e) => {
                                    let val = e.target.value;
                                    if (currentItem.unidad === 'Kilogramos' && Number(val) > 25) {
                                      val = '25';
                                    } else if (Number(val) > 999999) {
                                      val = '999999';
                                    }
                                    setCurrentItem({ ...currentItem, cantidad: val === '' ? '' : Number(val) });
                                    setLocalErrors({ ...localErrors, cantidad: '' });
                                  }}
                                  disabled={isLoading}
                                />
                                <Form.Control.Feedback type="invalid">{localErrors.cantidad}</Form.Control.Feedback>
                                {currentItem.unidad === 'Kilogramos' && (
                                  <Form.Text className="text-muted d-block mt-1">
                                    <small>Máximo 25 kg (Ley 20.949)</small>
                                  </Form.Text>
                                )}
                              </Form.Group>
                            </Col>
                          </Row>

          {/* === INICIO LÓGICA CONDICIONAL V3 === */}
          
          {/* FORMATO SUPERMERCADO para Abarrotes en Unidades */}
          {['Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Sal', 'Fideos', 'Pastas', 'Cereales', 'Leche en Polvo'].includes(currentItem.subcategoria) && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Formato del Envase <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.formatoSupermercado || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, formatoSupermercado: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_ABARROTES.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO TÉ */}
          {currentItem.subcategoria === 'Té' && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Formato del Té <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.formatoSupermercado || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, formatoSupermercado: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_TE.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO CAFÉ */}
          {currentItem.subcategoria === 'Café' && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Formato del Café <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.formatoSupermercado || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, formatoSupermercado: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_CAFE.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO ACEITE */}
          {currentItem.subcategoria === 'Aceite' && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Formato del Aceite <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.formatoSupermercado || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, formatoSupermercado: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_ACEITE.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO CONSERVAS */}
          {['Atún en Conserva', 'Jurel en Conserva'].includes(currentItem.subcategoria) && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Formato de Conserva <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.formatoSupermercado || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, formatoSupermercado: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_CONSERVA.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO MASCOTAS */}
          {['Comida para Perros (Seca)', 'Comida para Gatos (Seca)'].includes(currentItem.subcategoria) && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Formato del Saco/Bolsa <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.formatoSupermercado || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, formatoSupermercado: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_MASCOTAS.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO SALSA */}
          {currentItem.subcategoria === 'Salsa de Tomate' && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Formato de la Salsa <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.formatoSupermercado || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, formatoSupermercado: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_SALSA.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO QUESOS */}
          {currentItem.subcategoria === 'Quesos' && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Formato del Producto <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.formatoQueso || ''}
                    isInvalid={!!localErrors.formatoQueso}
                    onChange={(e) => {
                      setCurrentItem({ ...currentItem, formatoQueso: e.target.value });
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
                  <Form.Label className="small mb-1">Peso por Unidad <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.pesoQueso || ''}
                    isInvalid={!!localErrors.pesoQueso}
                    onChange={(e) => {
                      setCurrentItem({ ...currentItem, pesoQueso: e.target.value });
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
          {currentItem.subcategoria === 'Mantequilla/Margarina' && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Formato del Envase <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.formatoSupermercado || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, formatoSupermercado: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_MANTEQUILLA.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* FORMATO FIAMBRES Y EMBUTIDOS */}
          {currentItem.subcategoria === 'Fiambres y Embutidos' && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Formato del Fiambre <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.formatoSupermercado || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, formatoSupermercado: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {FORMATOS_FIAMBRE.map(f => <option key={f} value={f}>{f}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* TIPOS DE LECHE Y YOGUR */}
          {['Leche de 1 Litro', 'Leche Individual (200ml)', 'Leche (Caja larga vida)'].includes(currentItem.subcategoria) && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Tipo de Leche <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.tipoLeche || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, tipoLeche: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {TIPOS_LECHE.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}
          {['Yogur Individual', 'Yogur en Bolsa (1 Litro)'].includes(currentItem.subcategoria) && isUnidadBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Tipo de Yogur <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.tipoYogur || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, tipoYogur: e.target.value })}
                  >
                    <option value="">Selecciona una opción</option>
                    {TIPOS_YOGUR.map(t => <option key={t} value={t}>{t}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* HUEVOS (Bandejas) */}
          {isBandejaBaseFn(currentItem) && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Capacidad de la Bandeja <span className="text-danger">*</span></Form.Label>
                  <Form.Select 
                    value={currentItem.capacidadBandeja || ''}
                    isInvalid={!!localErrors.capacidadBandeja}
                    onChange={(e) => {
                      setCurrentItem({ ...currentItem, capacidadBandeja: e.target.value });
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

          {/* CAJAS Y PAQUETES */}
          {['Cajas', 'Paquetes'].includes(currentItem.unidad) && (
            <>
              {['Frutas', 'Verduras', 'Panadería'].includes(currentItem.subcategoria) ? (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small mb-1">Kg por {currentItem.unidad === 'Cajas' ? 'Caja' : 'Paquete'} <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="number" step="any" min="0.01" max="25"
                        value={currentItem.pesoPorCaja}
                        isInvalid={!!localErrors.pesoPorCaja}
                        onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (Number(val) >= 0 && Number(val) <= 25 && val.length <= 5)) {
                            setCurrentItem({ ...currentItem, pesoPorCaja: val === '' ? '' : Number(val) });
                            setLocalErrors({ ...localErrors, pesoPorCaja: '' });
                          }
                        }}
                      />
                      <Form.Control.Feedback type="invalid">{localErrors.pesoPorCaja}</Form.Control.Feedback>
                      <Form.Text className="text-muted d-block mt-1"><small>Máximo 25 kg (Ley 20.949)</small></Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small mb-1">¿Qué contiene {currentItem.unidad === 'Cajas' ? 'la Caja' : 'el Paquete'}? <span className="text-danger">*</span></Form.Label>
                      <Form.Select 
                        value={currentItem.tipoEnvaseCaja || ''}
                        isInvalid={!!localErrors.tipoEnvaseCaja}
                        disabled={
                          (currentItem.unidad === 'Paquetes' && !['Huevos', 'Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Clavos', 'Tornillos'].includes(currentItem.subcategoria)) ||
                          (currentItem.unidad === 'Cajas' && currentItem.subcategoria === 'Comida Preparada')
                        }
                        onChange={(e) => {
                          setCurrentItem({ ...currentItem, tipoEnvaseCaja: e.target.value, unidadesPorEnvase: '', pesoPorCaja: '', unidadesPorPaquete: '' });
                          setLocalErrors({ ...localErrors, tipoEnvaseCaja: '' });
                        }}
                      >
                        <option value="">Selecciona una opción</option>
                        {currentItem.subcategoria === 'Huevos' ? (
                          <option value="Bandejas">Bandejas</option>
                        ) : (
                          <option value="Unidades">Unidades</option>
                        )}
                        {currentItem.unidad === 'Cajas' && currentItem.subcategoria !== 'Comida Preparada' && (
                          <option value="Paquetes">Paquetes</option>
                        )}
                        {['Arroz', 'Legumbres', 'Azúcar', 'Harina', 'Avena', 'Clavos', 'Tornillos'].includes(currentItem.subcategoria) && (
                          <option value="Kilogramos">Kilogramos</option>
                        )}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{localErrors.tipoEnvaseCaja}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  
                  {['Unidades', 'Paquetes', 'Bandejas'].includes(currentItem.tipoEnvaseCaja || '') && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small mb-1">{currentItem.tipoEnvaseCaja} por {currentItem.unidad === 'Cajas' ? 'Caja' : 'Paquete'} <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="number" step="1" min="1" max="9999"
                          value={currentItem.unidadesPorEnvase}
                          isInvalid={!!localErrors.unidadesPorEnvase}
                          onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (Number(val) >= 0 && Number(val) <= 9999 && val.length <= 4)) {
                              setCurrentItem({ ...currentItem, unidadesPorEnvase: val === '' ? '' : Number(val) });
                              setLocalErrors({ ...localErrors, unidadesPorEnvase: '' });
                            }
                          }}
                        />
                        <Form.Control.Feedback type="invalid">{localErrors.unidadesPorEnvase}</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  )}

                  {currentItem.tipoEnvaseCaja === 'Paquetes' && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small mb-1">Unidades por Paquete <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="number" step="1" min="1" max="9999"
                          value={currentItem.unidadesPorPaquete}
                          onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (Number(val) >= 0 && Number(val) <= 9999 && val.length <= 4)) {
                              setCurrentItem({ ...currentItem, unidadesPorPaquete: val === '' ? '' : Number(val) });
                            }
                          }}
                        />
                      </Form.Group>
                    </Col>
                  )}

                  {currentItem.tipoEnvaseCaja === 'Kilogramos' && (
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small mb-1">Kg por {currentItem.unidad === 'Cajas' ? 'Caja' : 'Paquete'} <span className="text-danger">*</span></Form.Label>
                        <Form.Control 
                          type="number" step="any" min="0.01" max="25"
                          value={currentItem.pesoPorCaja}
                          isInvalid={!!localErrors.pesoPorCaja}
                          onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '' || (Number(val) >= 0 && Number(val) <= 25 && val.length <= 5)) {
                              setCurrentItem({ ...currentItem, pesoPorCaja: val === '' ? '' : Number(val) });
                              setLocalErrors({ ...localErrors, pesoPorCaja: '' });
                            }
                          }}
                        />
                        <Form.Control.Feedback type="invalid">{localErrors.pesoPorCaja}</Form.Control.Feedback>
                        <Form.Text className="text-muted d-block mt-1"><small>Máximo 25 kg (Ley 20.949)</small></Form.Text>
                      </Form.Group>
                    </Col>
                  )}
                </Row>
              )}
            </>
          )}

          {/* SACOS */}
          {currentItem.unidad === 'Sacos' && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small mb-1">Peso por Saco (Kg) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number" step="any" min="1" max={25}
                    placeholder="Ej: 25"
                    value={currentItem.pesoPorSaco}
                    isInvalid={!!localErrors.pesoPorSaco}
                    onKeyDown={(e) => ['e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || (Number(val) >= 0 && Number(val) <= 25 && val.length <= 5)) {
                        setCurrentItem({ ...currentItem, pesoPorSaco: val === '' ? '' : Number(val) });
                        setLocalErrors({ ...localErrors, pesoPorSaco: '' });
                      }
                    }}
                  />
                  <Form.Control.Feedback type="invalid">{localErrors.pesoPorSaco}</Form.Control.Feedback>
                  <Form.Text className="text-muted d-block mt-1">
                    <small>Máximo 25 kg (Ley 20.949)</small>
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          )}

          {/* === FIN LÓGICA CONDICIONAL V3 === */}

                          <div className="mt-3 text-end">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={handleAddItem}
                              disabled={isLoading}
                              className="px-4 rounded-pill"
                            >
                              + Añadir a la lista
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>

                      {items.length > 0 && (
                        <div className="mt-4">
                          <Form.Label className="fw-semibold text-success">Lista de Recursos a Solicitar ({items.length})</Form.Label>
                          <ul className="list-group shadow-sm">
                            {items.map((item, index) => (
                              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center bg-white border-light">
                                <div>
                                  <strong className="text-dark d-block">{item.subcategoria}</strong>
                                  <small className="text-muted">{item.categoria}</small>
                                  {item.genero && <small className="text-muted ms-2">({item.genero} - {item.talla})</small>}
                                  <span className="ms-2 text-primary fw-semibold">{item.cantidad} {item.unidad}</span>
                                </div>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  onClick={() => handleRemoveItem(index)}
                                  disabled={isLoading}
                                  style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
                                  title="Eliminar recurso"
                                >
                                  X
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <Form.Group className="mb-4" controlId="tipoEmergencia">
                      <Form.Label className="fw-semibold">2. Tipo de Emergencia</Form.Label>
                      <Form.Select
                        value={tipoEmergencia}
                        onChange={(e) => setTipoEmergencia(e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="">Selecciona una opción</option>
                        <option value="Incendio">🔥 Incendio</option>
                        <option value="Inundación">🌊 Inundación</option>
                        <option value="Terremoto">🏚️ Terremoto</option>
                        <option value="Corte de suministros">⚡ Corte de suministros</option>
                        <option value="General">📍 Otro / General</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* COLUMNA DERECHA: Mapa y Ubicación */}
                  <Col lg={6}>
                    <div className="bg-light p-4 rounded-3 h-100 border d-flex flex-column">
                      <div className="mb-3 flex-grow-1">
                        <Form.Label className="fw-semibold">3. Ubicación Exacta de la Emergencia <span className="text-danger">*</span></Form.Label>
                        <div style={{ height: '350px', marginBottom: '1rem' }}>
                          <MapLocationPicker onLocationSelect={handleLocationSelect} />
                        </div>
                        <div className="mt-2 text-center">
                          <small className="text-primary fw-semibold">
                            💡 Tip: Busca o haz clic en el mapa para auto-completar la ubicación.
                          </small>
                        </div>
                      </div>
                      
                      <Row className="mt-auto">
                        <Col md={6}>
                          <Form.Group controlId="region" className="mb-3">
                            <Form.Label className="small text-muted mb-1">Región Detectada</Form.Label>
                            <Form.Control
                              type="text"
                              value={region || 'No detectada'}
                              readOnly
                              disabled
                              className="bg-white"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="comuna" className="mb-3">
                            <Form.Label className="small text-muted mb-1">Comuna Detectada</Form.Label>
                            <Form.Control
                              type="text"
                              value={comuna || 'No detectada'}
                              readOnly
                              disabled
                              className="bg-white"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>

                <hr className="my-4" />

                <div className="d-grid w-50 mx-auto">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg" 
                    disabled={isLoading}
                    className="py-3 rounded-pill fw-bold shadow-sm"
                  >
                    {isLoading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Procesando...
                      </>
                    ) : (
                      'Registrar Alerta Estructurada'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default IngresarNecesidad;


