import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import type { DonacionGlobalValues } from './DonacionSchemas';
import { MapLocationPicker } from '../registro/MapLocationPicker';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../../utils/chileData';
import { obtenerCentrosAcopio, type CentroAcopio } from '../../services/logisticaService';
import { MapPin } from 'lucide-react';

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

const extractHouseNumber = (address: any, displayName?: string) => {
  if (address.house_number) return address.house_number;
  if (address.street_number) return address.street_number;
  
  if (displayName) {
    // Buscar un patrón típico de número de calle (ej. "123", "45A") justo antes de una coma o espacio
    const regex = /(?:^|\s)([1-9]\d{0,4}[A-Za-z]?)(?:,|$|\s)/;
    const match = regex.exec(displayName);
    if (match) return match[1];
  }
  return "";
};

export const DonacionStep2: React.FC = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext<DonacionGlobalValues>();
  const watchModalidad = watch('modalidadEntrega');
  const watchRegion = watch('regionRetiro');
  const watchCentroAcopioDestinoId = watch('centroAcopioDestinoId');
  
  const [regionAcopio, setRegionAcopio] = useState('');
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>([]);
  const [centrosError, setCentrosError] = useState('');

  useEffect(() => {
    const fetchCentros = async () => {
      try {
        const data = await obtenerCentrosAcopio();
        setCentrosAcopio(data);
      } catch (err) {
        console.error('Error fetching centros:', err);
        setCentrosError('No se pudieron cargar los centros de acopio.');
      }
    };
    fetchCentros();
  }, []);

  const handleLocationSelect = (location: any) => {
    setValue('latitudRetiro', location.lat, { shouldValidate: true });
    setValue('longitudRetiro', location.lng, { shouldValidate: true });
    
    const address = location.addressDetails;
    if (!address) return;

    if (address.road) setValue('direccionRetiroCalle', address.road, { shouldValidate: true });
    
    const houseNum = extractHouseNumber(address, location.displayName);
    if (houseNum) {
      setValue('direccionRetiroNumero', houseNum, { shouldValidate: true });
    } else {
      setValue('direccionRetiroNumero', '', { shouldValidate: true });
    }
    
    const regionMatch = matchRegion(address.state);
    if (regionMatch) setValue('regionRetiro', regionMatch, { shouldValidate: true });

    const comunaRaw = address.city || address.town || address.village || address.county;
    const comunaMatchData = matchComuna(comunaRaw);
    if (comunaMatchData) {
      setValue('regionRetiro', comunaMatchData.region, { shouldValidate: true }); 
      setValue('comunaRetiro', comunaMatchData.comuna, { shouldValidate: true });
    }
  };

  const centrosFiltrados = regionAcopio 
    ? centrosAcopio.filter(c => c.region === regionAcopio) 
    : centrosAcopio;

  const selectedCentro = centrosAcopio.find(c => c.id === watchCentroAcopioDestinoId);

  return (
    <div>
      <h4 className="fw-bold text-primary mb-4 border-bottom pb-2">Logística de Entrega</h4>
      
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold d-block">¿Cómo entregarás tu donación? <span className="text-danger">*</span></Form.Label>
        <div className="d-flex gap-4">
          <Form.Check 
            type="radio" 
            label="Llevaré mi donación a un centro de acopio" 
            value="Acopio" 
            {...register('modalidadEntrega')} 
          />
          <Form.Check 
            type="radio" 
            label="Necesito que retiren mi donación (Solo casos especiales)" 
            value="Retiro" 
            {...register('modalidadEntrega')} 
          />
        </div>
        {errors.modalidadEntrega && <div className="text-danger small mt-1">{errors.modalidadEntrega.message}</div>}
      </Form.Group>

      {watchModalidad === 'Acopio' && (
        <div className="p-4 bg-light rounded-3 border mb-4">
          <h5 className="fw-bold mb-3">Selección de Centro de Acopio</h5>
          {centrosError && <Alert variant="warning">{centrosError}</Alert>}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Filtrar por Región <span className="text-muted">(Opcional)</span></Form.Label>
                <Form.Select 
                  value={regionAcopio} 
                  onChange={(e) => {
                    setRegionAcopio(e.target.value);
                    setValue('centroAcopioDestinoId', 0, { shouldValidate: true });
                  }}
                >
                  <option value="">Todas las regiones...</option>
                  {REGIONES_CHILE.map(r => <option key={r} value={r}>{r}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Selecciona el centro <span className="text-danger">*</span></Form.Label>
                <Form.Select {...register('centroAcopioDestinoId', { valueAsNumber: true })} isInvalid={!!errors.centroAcopioDestinoId}>
                  <option value="0">Seleccionar centro...</option>
                  {centrosFiltrados.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.centroAcopioDestinoId?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {selectedCentro && (
            <div className="mt-3 p-3 bg-white border rounded shadow-sm d-flex align-items-start gap-3">
              <MapPin className="text-primary mt-1 flex-shrink-0" size={24} />
              <div>
                <h6 className="fw-bold mb-1 text-primary">{selectedCentro.nombre}</h6>
                <p className="mb-0 text-muted">
                  <strong>Dirección:</strong> {selectedCentro.direccion}, {selectedCentro.comuna}, {selectedCentro.region}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {watchModalidad === 'Retiro' && (
        <div className="p-4 bg-light rounded-3 border mb-4">
          <Alert variant="info" className="mb-4">
            <strong>Nota:</strong> El retiro a domicilio está sujeto a disponibilidad de vehículos y se prioriza para artículos voluminosos o grandes cantidades.
          </Alert>

          <div className="mb-4">
            <h5 className="fw-semibold mb-3">Ubicación del Retiro</h5>
            <MapLocationPicker onLocationSelect={handleLocationSelect} error={errors.latitudRetiro?.message} />
          </div>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Región <span className="text-danger">*</span></Form.Label>
                <Form.Select {...register('regionRetiro')} isInvalid={!!errors.regionRetiro}>
                  <option value="">Seleccione una región...</option>
                  {REGIONES_CHILE.map(r => <option key={r} value={r}>{r}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.regionRetiro?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Comuna <span className="text-danger">*</span></Form.Label>
                <Form.Select {...register('comunaRetiro')} isInvalid={!!errors.comunaRetiro} disabled={!watchRegion}>
                  <option value="">Seleccione una comuna...</option>
                  {watchRegion && COMUNAS_POR_REGION[watchRegion]?.map(c => <option key={c} value={c}>{c}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.comunaRetiro?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Calle / Pasaje <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" {...register('direccionRetiroCalle')} maxLength={100} isInvalid={!!errors.direccionRetiroCalle} />
                <Form.Control.Feedback type="invalid">{errors.direccionRetiroCalle?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Número <span className="text-danger">*</span></Form.Label>
                <Form.Control type="text" {...register('direccionRetiroNumero')} maxLength={10} isInvalid={!!errors.direccionRetiroNumero} />
                <Form.Control.Feedback type="invalid">{errors.direccionRetiroNumero?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Disponibilidad Horaria <span className="text-danger">*</span></Form.Label>
                <Form.Select {...register('disponibilidadHoraria')} isInvalid={!!errors.disponibilidadHoraria}>
                  <option value="">Seleccionar horario...</option>
                  <option value="Mañana (09:00 - 13:00)">Mañana (09:00 - 13:00)</option>
                  <option value="Tarde (14:00 - 18:00)">Tarde (14:00 - 18:00)</option>
                  <option value="Cualquier horario">Cualquier horario</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.disponibilidadHoraria?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-center mt-md-4">
              <Form.Check 
                type="switch" 
                id="transporteEspecial" 
                label="¿Requiere transporte especial? (Ej: Camión para muebles grandes)" 
                {...register('transporteEspecial')} 
              />
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
};
