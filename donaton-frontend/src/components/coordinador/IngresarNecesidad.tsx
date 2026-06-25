import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ingresarNecesidad } from '../../services/bffService';
import { MapLocationPicker } from '../registro/MapLocationPicker';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../../utils/chileData';
import { useAuth } from '../../context/AuthContext';

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
}

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

const UNIDADES_DISPONIBLES = [
  "Unidades",
  "Kilogramos",
  "Litros",
  "Cajas",
  "Paquetes",
  "Sacos",
  "Pallets"
];

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

// No map utils needed here

const IngresarNecesidad: React.FC = () => {
  const { usuario } = useAuth();
  const [items, setItems] = useState<ItemNecesidad[]>([]);
  const [currentItem, setCurrentItem] = useState<ItemNecesidad>({ id: crypto.randomUUID(), categoria: '', subcategoria: '', cantidad: '', unidad: 'Unidades' });
  const [otroSubcategoria, setOtroSubcategoria] = useState('');
  const [tipoEmergencia, setTipoEmergencia] = useState('');
  const [latitud, setLatitud] = useState<number | ''>('');
  const [longitud, setLongitud] = useState<number | ''>('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleAddItem = () => {
    let finalSubcategoria = currentItem.subcategoria;
    if (currentItem.categoria === 'Otro' || currentItem.subcategoria === 'Otro') {
      finalSubcategoria = otroSubcategoria.trim();
    }

    if (!currentItem.categoria || !finalSubcategoria || currentItem.cantidad === '' || Number(currentItem.cantidad) <= 0) {
      alert("Por favor, completa la categoría, la subcategoría/recurso y una cantidad válida antes de añadir.");
      return;
    }

    setItems([...items, { ...currentItem, subcategoria: finalSubcategoria }]);
    setCurrentItem({ id: crypto.randomUUID(), categoria: '', subcategoria: '', cantidad: '', unidad: 'Unidades' });
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
      const recursosJSON = JSON.stringify(items);

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
      setCurrentItem({ id: crypto.randomUUID(), categoria: '', subcategoria: '', cantidad: '', unidad: 'Unidades' });
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
                                <Form.Label className="small mb-1">Categoría</Form.Label>
                                <Form.Select
                                  value={currentItem.categoria}
                                  onChange={(e) => {
                                    setCurrentItem({ ...currentItem, categoria: e.target.value, subcategoria: '' });
                                    setOtroSubcategoria('');
                                  }}
                                  disabled={isLoading}
                                >
                                  <option value="">Selecciona...</option>
                                  {CATEGORIAS_DISPONIBLES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            {currentItem.categoria && (
                              <Col md={12}>
                                <Form.Group>
                                  <Form.Label className="small mb-1">Subcategoría / Recurso</Form.Label>
                                  <Form.Select
                                    value={currentItem.subcategoria}
                                    onChange={(e) => {
                                      setCurrentItem({ ...currentItem, subcategoria: e.target.value });
                                      if (e.target.value !== 'Otro') setOtroSubcategoria('');
                                    }}
                                    disabled={isLoading}
                                  >
                                    <option value="">Selecciona...</option>
                                    {(SUBCATEGORIAS[currentItem.categoria] || []).map(sub => (
                                      <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                    <option value="Otro">Otro (Especificar)</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                            )}
                            {(currentItem.categoria === 'Otro' || currentItem.subcategoria === 'Otro') && (
                              <Col md={12}>
                                <Form.Group>
                                  <Form.Label className="small mb-1">Especificar Recurso</Form.Label>
                                  <Form.Control
                                    type="text"
                                    placeholder="Ej. Pañales talla G, Colchones, etc."
                                    value={otroSubcategoria}
                                    onChange={(e) => setOtroSubcategoria(e.target.value)}
                                    disabled={isLoading}
                                    maxLength={100}
                                  />
                                </Form.Group>
                              </Col>
                            )}
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="small mb-1">Cantidad</Form.Label>
                                <Form.Control
                                  type="number"
                                  min="1"
                                  placeholder="Ej. 50"
                                  value={currentItem.cantidad}
                                  onChange={(e) => setCurrentItem({ ...currentItem, cantidad: e.target.value === '' ? '' : Number(e.target.value) })}
                                  disabled={isLoading}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="small mb-1">Unidad</Form.Label>
                                <Form.Select
                                  value={currentItem.unidad}
                                  onChange={(e) => setCurrentItem({ ...currentItem, unidad: e.target.value })}
                                  disabled={isLoading}
                                >
                                  {UNIDADES_DISPONIBLES.map(uni => (
                                    <option key={uni} value={uni}>{uni}</option>
                                  ))}
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>
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
                        <option value="">Selecciona el tipo de emergencia (opcional)</option>
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


