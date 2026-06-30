import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert, InputGroup } from 'react-bootstrap';
import Select from 'react-select';
import { CheckCircle } from 'lucide-react';
import { actualizarUsuario } from '../../services/usuarioService';
import type { Usuario } from '../../context/AuthContext';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../../utils/chileData';
import { COUNTRY_CODES } from '../../utils/countryCodes';
import { RegionComunaInput } from '../common/RegionComunaInput';
import { formatNameInput, formatNoSpaceInput, preventSpaceKeyDown, formatPhoneInput, preventPhoneKeyDown, validarEmailDominio } from '../../utils/validators';

interface UsuarioExtended extends Usuario {
  email?: string;
  tipoPersona?: string;
  nombreCompleto?: string;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  rut?: string;
  codigoPais?: string;
  telefono?: string;
  region?: string;
  comuna?: string;
  direccion?: string;
}

interface AdminEditUserModalProps {
  show: boolean;
  onHide: () => void;
  usuario: UsuarioExtended | null;
  onSuccess: () => void;
  usuarios: UsuarioExtended[];
}

const validateAdminForm = (formData: Partial<UsuarioExtended>, isJuridica: boolean) => {
  const newErrors: Record<string, string> = {};
  let nombreFinal = '';

  if (isJuridica) {
    if (!formData.razonSocial?.trim()) newErrors.razonSocial = 'Este campo no debe estar vacío';
    nombreFinal = formData.razonSocial?.trim() || '';
  } else {
    if (!formData.nombres?.trim()) newErrors.nombres = 'Este campo no debe estar vacío';
    if (!formData.apellidos?.trim()) newErrors.apellidos = 'Este campo no debe estar vacío';
    nombreFinal = `${formData.nombres?.trim() || ''} ${formData.apellidos?.trim() || ''}`.trim();
  }

  if (!formData.email?.trim()) newErrors.email = 'Este campo no debe estar vacío';
  
  if (!formData.telefono?.trim() || formData.telefono.trim().replace(/\D/g, '').length < 9) {
    newErrors.telefono = 'El teléfono debe tener al menos 9 dígitos';
  }

  if (!formData.region?.trim()) newErrors.region = 'Este campo no debe estar vacío';
  if (!formData.comuna?.trim()) newErrors.comuna = 'Este campo no debe estar vacío';
  if (!formData.direccion?.trim()) newErrors.direccion = 'Este campo no debe estar vacío';

  return { newErrors, nombreFinal };
};

export const AdminEditUserModal: React.FC<AdminEditUserModalProps> = ({ show, onHide, usuario, onSuccess, usuarios }) => {
  const [formData, setFormData] = useState<Partial<UsuarioExtended>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (usuario) {
      let initialPhone = usuario.telefono || '';
      let initialCode = '+56';
      
      if (initialPhone.startsWith('+')) {
        const spaceIndex = initialPhone.indexOf(' ');
        if (spaceIndex === -1) {
          const match = COUNTRY_CODES.find(c => initialPhone.startsWith(c.code));
          if (match) {
            initialCode = match.code;
            initialPhone = initialPhone.substring(match.code.length).trim();
          }
        } else {
          initialCode = initialPhone.substring(0, spaceIndex);
          initialPhone = initialPhone.substring(spaceIndex + 1);
        }
      }

      let nombresStr = '';
      let apellidosStr = '';
      const nom = usuario.nombreCompleto || '';
      const spaceIdx = nom.indexOf(' ');
      if (spaceIdx > -1) {
        nombresStr = nom.substring(0, spaceIdx);
        apellidosStr = nom.substring(spaceIdx + 1);
      } else {
        nombresStr = nom;
      }

      setFormData({
        email: usuario.email,
        nombres: nombresStr,
        apellidos: apellidosStr,
        razonSocial: usuario.razonSocial || usuario.nombreCompleto,
        nombreCompleto: usuario.nombreCompleto || usuario.razonSocial,
        rol: usuario.rol,
        subRol: usuario.subRol,
        codigoPais: initialCode,
        telefono: initialPhone,
        region: usuario.region,
        comuna: usuario.comuna,
        direccion: usuario.direccion,
      });
      setError(null);
      setShowSuccess(false);
      setFormErrors({});
    }
  }, [usuario]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (formErrors[e.target.name]) setFormErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!usuario) return;
    
    const isJuridica = usuario.tipoPersona === 'JURIDICA';
    const { newErrors, nombreFinal } = validateAdminForm(formData, isJuridica);

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      setError('Por favor, corrige los errores marcados en rojo.');
      return;
    }

    const emailAComprobar = formData.email?.trim().toLowerCase();
    if (emailAComprobar) {
      const isEmailTaken = usuarios.some(u => u.email?.toLowerCase() === emailAComprobar && u.id !== usuario.id);
      if (isEmailTaken) {
        setError('El correo electrónico ya está registrado por otro usuario.');
        return;
      }
    }

    if (formData.email && !validarEmailDominio(formData.email)) {
      setError('El dominio del correo electrónico no está permitido o el formato es incorrecto.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const phoneValue = formData.telefono?.trim();
      const fullPhone = phoneValue ? `${formData.codigoPais || '+56'} ${phoneValue}` : undefined;

      const cleanedData = {
        ...formData,
        nombreCompleto: nombreFinal,
        email: formData.email?.trim(),
        telefono: fullPhone,
        direccion: formData.direccion?.trim(),
      };
      await actualizarUsuario(Number(usuario.id), cleanedData);
      setShowSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return null;

  if (showSuccess) {
    return (
      <Modal show={show} onHide={onHide} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title className="fw-bold">¡Actualización Exitosa!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-5">
          <div className="mb-4 text-success d-flex justify-content-center">
            <CheckCircle size={64} strokeWidth={1.5} />
          </div>
          <h4 className="fw-bold text-dark">Usuario Actualizado</h4>
          <p className="text-muted">Los datos del perfil se han guardado correctamente.</p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 pb-4">
          <Button variant="success" className="px-5 rounded-pill" onClick={onHide}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold" style={{ color: '#1a1a2e' }}>Editar Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Row className="g-3">
            {usuario.tipoPersona === 'JURIDICA' ? (
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Razón Social</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="razonSocial" 
                    value={formData.razonSocial || ''} 
                    onChange={handleChange} 
                    maxLength={100}
                    isInvalid={!!formErrors.razonSocial}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.razonSocial}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            ) : (
              <>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Nombres</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nombres" 
                      value={formData.nombres || ''} 
                      onChange={handleChange} 
                      onInput={formatNameInput}
                      maxLength={50}
                      isInvalid={!!formErrors.nombres}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.nombres}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Apellidos</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="apellidos" 
                      value={formData.apellidos || ''} 
                      onChange={handleChange} 
                      onInput={formatNameInput}
                      maxLength={50}
                      isInvalid={!!formErrors.apellidos}
                    />
                    <Form.Control.Feedback type="invalid">{formErrors.apellidos}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </>
            )}
            
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small text-muted">RUT (No editable)</Form.Label>
                <Form.Control 
                  type="text" 
                  value={usuario.rut || 'Sin RUT'} 
                  disabled 
                  className="bg-light"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Correo Electrónico</Form.Label>
                <Form.Control 
                  type="email" 
                  name="email" 
                  value={formData.email || ''} 
                  onChange={handleChange} 
                  onInput={formatNoSpaceInput}
                  onKeyDown={preventSpaceKeyDown}
                  maxLength={100}
                  isInvalid={!!formErrors.email}
                />
                <Form.Control.Feedback type="invalid">{formErrors.email}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Teléfono</Form.Label>
                <InputGroup>
                  <Form.Select 
                    name="codigoPais"
                    value={formData.codigoPais || '+56'} 
                    onChange={handleChange}
                    style={{ maxWidth: '120px' }}
                  >
                    {COUNTRY_CODES.map((country) => (
                      <option key={country.code} value={country.code}>{country.flag} {country.code}</option>
                    ))}
                  </Form.Select>
                  <Form.Control 
                    type="text" 
                    name="telefono" 
                    value={formData.telefono || ''} 
                    onChange={handleChange} 
                    onInput={formatPhoneInput}
                    onKeyDown={preventPhoneKeyDown}
                    maxLength={15}
                    title="Ejemplo: 912345678"
                    isInvalid={!!formErrors.telefono}
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.telefono}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Rol Principal</Form.Label>
                <Form.Select name="rol" value={formData.rol || ''} onChange={handleChange} required>
                  <option value="DONANTE">DONANTE</option>
                  <option value="LOGISTICA">LOGISTICA</option>
                  <option value="COORDINADOR">COORDINADOR</option>
                </Form.Select>
              </Form.Group>
            </Col>

            {formData.rol === 'LOGISTICA' && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Sub-Rol Logística</Form.Label>
                  <Form.Select name="subRol" value={formData.subRol || ''} onChange={handleChange}>
                    <option value="">Selecciona...</option>
                    <option value="CONDUCTOR">CONDUCTOR</option>
                    <option value="RECEPCIONISTA">RECEPCIONISTA</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            )}

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Región</Form.Label>
                <Select
                  options={REGIONES_CHILE.map(r => ({ value: r, label: r }))}
                  value={formData.region ? { value: formData.region, label: formData.region } : null}
                  onChange={(option) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      region: option?.value || '', 
                      comuna: '' 
                    }));
                    if (formErrors.region) setFormErrors(prev => ({ ...prev, region: '' }));
                  }}
                  placeholder="Selecciona región..."
                  isClearable
                  components={{ Input: RegionComunaInput }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: formErrors.region ? '#dc3545' : '#dee2e6',
                      boxShadow: 'none',
                      '&:hover': { borderColor: formErrors.region ? '#dc3545' : '#b1b6bb' }
                    })
                  }}
                />
                {formErrors.region && <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>{formErrors.region}</div>}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Comuna</Form.Label>
                <Select
                  options={formData.region && COMUNAS_POR_REGION[formData.region] 
                    ? COMUNAS_POR_REGION[formData.region].map(c => ({ value: c, label: c })) 
                    : []}
                  value={formData.comuna ? { value: formData.comuna, label: formData.comuna } : null}
                  onChange={(option) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      comuna: option?.value || ''
                    }));
                    if (formErrors.comuna) setFormErrors(prev => ({ ...prev, comuna: '' }));
                  }}
                  placeholder="Selecciona comuna..."
                  isDisabled={!formData.region}
                  isClearable
                  components={{ Input: RegionComunaInput }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: formErrors.comuna ? '#dc3545' : '#dee2e6',
                      boxShadow: 'none',
                      '&:hover': { borderColor: formErrors.comuna ? '#dc3545' : '#b1b6bb' }
                    })
                  }}
                />
                {formErrors.comuna && <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>{formErrors.comuna}</div>}
              </Form.Group>
            </Col>
            
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Dirección Detallada</Form.Label>
                <Form.Control 
                  type="text" 
                  name="direccion" 
                  value={formData.direccion || ''} 
                  onChange={handleChange} 
                  maxLength={250}
                  isInvalid={!!formErrors.direccion}
                />
                <Form.Control.Feedback type="invalid">{formErrors.direccion}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};


