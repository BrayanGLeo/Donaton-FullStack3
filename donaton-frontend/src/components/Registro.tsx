import React, { useState, useRef } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert, InputGroup, Dropdown, Spinner, ListGroup, Modal } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { registrarDonante } from '../services/usuarioService';
import { validarRutChileno, validarNombres, validarTelefono, validarPassword, validarEmailDominio, validarNumeroCasa } from '../utils/validators';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../utils/chileData';
import { COUNTRY_CODES } from '../utils/countryCodes';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Registro: React.FC = () => {
  const [tipoUsuario, setTipoUsuario] = useState<'NATURAL' | 'JURIDICA' | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [codigoPais, setCodigoPais] = useState('+56');
  const [telefono, setTelefono] = useState('');
  
  const [rut, setRut] = useState('');
  const [region, setRegion] = useState('');
  const [comuna, setComuna] = useState('');
  const [direccion, setDireccion] = useState('');
  const [direccionNumero, setDireccionNumero] = useState('');
  const [coordenadas, setCoordenadas] = useState<{ lat: number; lng: number } | null>(null);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  const [razonSocial, setRazonSocial] = useState('');
  const [giro, setGiro] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');

  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressDropdown(false);
      return;
    }
    
    setIsSearchingAddress(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=cl&format=json&addressdetails=1&limit=5`);
      const data = await response.json();
      setAddressSuggestions(data);
      setShowAddressDropdown(true);
    } catch (err) {
      console.error("Error fetching address suggestions:", err);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDireccion(val);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      searchAddress(val);
    }, 500);
  };

  const handleSelectAddress = (suggestion: any) => {
    setDireccion(suggestion.display_name);
    setShowAddressDropdown(false);
    setCoordenadas({ lat: Number.parseFloat(suggestion.lat), lng: Number.parseFloat(suggestion.lon) });
  };

  const validateCommonFields = (errs: Record<string, string>) => {
    if (!validarEmailDominio(email)) errs.email = 'Por favor ingresa un correo con un dominio válido y confiable (ej. gmail.com, outlook.com).';
    if (!validarPassword(password)) errs.password = 'La contraseña no puede contener espacios, y debe incluir al menos 3 letras y 3 números.';
    if (password !== confirmPassword) errs.confirmPassword = 'Las contraseñas no coinciden.';
    if (password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres.';
    if (!validarRutChileno(rut)) errs.rut = 'El RUT ingresado no es válido. Debe tener el formato 12345678-9';
    if (!validarTelefono(telefono)) errs.telefono = 'El número de teléfono debe tener entre 9 y 12 dígitos.';
  };

  const validateAddressFields = (errs: Record<string, string>) => {
    if (!region) errs.region = 'Debes seleccionar una región.';
    if (!comuna || !COMUNAS_POR_REGION[region]?.includes(comuna)) errs.comuna = 'Debes seleccionar una comuna válida de la lista.';
    if (!direccion?.trim()) errs.direccion = 'La dirección (calle) es requerida.';
    if (!validarNumeroCasa(direccionNumero)) errs.direccionNumero = 'El número de la dirección debe contener al menos 2 números (ej. 12).';
  };

  const validateUserSpecificFields = (errs: Record<string, string>) => {
    if (tipoUsuario === 'NATURAL') {
      if (!validarNombres(nombre)) errs.nombre = 'El nombre es requerido.';
      if (!validarNombres(apellido)) errs.apellido = 'El apellido es requerido.';
    } else if (tipoUsuario === 'JURIDICA') {
      if (!razonSocial.trim()) errs.razonSocial = 'La razón social es requerida.';
      if (!nombreContacto.trim()) errs.nombreContacto = 'El nombre de contacto es requerido.';
      if (!giro.trim()) errs.giro = 'El giro o rubro es requerido.';
    }
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    validateCommonFields(newErrors);
    validateAddressFields(newErrors);
    validateUserSpecificFields(newErrors);
    return newErrors;
  };

  const handleRegister = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setError('Por favor corrige los campos marcados en rojo.');
      return;
    }

    const payload = {
      tipoPersona: tipoUsuario,
      email,
      password,
      telefono: `${codigoPais}${telefono}`,
      region,
      comuna,
      direccion: `${direccion} #${direccionNumero}`,
      rut,
      nombreCompleto: tipoUsuario === 'NATURAL' ? `${nombre.trim()} ${apellido.trim()}` : null,
      razonSocial: tipoUsuario === 'JURIDICA' ? razonSocial.trim() : null,
      giro: tipoUsuario === 'JURIDICA' ? giro.trim() : null,
      nombreContacto: tipoUsuario === 'JURIDICA' ? nombreContacto.trim() : null,
      sitioWeb: tipoUsuario === 'JURIDICA' ? sitioWeb.trim() : null,
      latitud: coordenadas?.lat ?? null,
      longitud: coordenadas?.lng ?? null,
    };

    setIsLoading(true);
    try {
      await registrarDonante(payload);
      
      try {
        const response = await axios.post('/api/auth/login', { email, password });
        const data = response.data;
        const usuarioLogueado = {
          id: data.id,
          nombre: data.nombreCompleto || data.email,
          email: data.email,
          rol: data.rol,
          subRol: data.subRol,
          region: data.region,
          centroAcopioId: data.centroAcopioId
        };
        login(data.token, usuarioLogueado);
      } catch (loginErr) {
        console.error("Auto-login failed after registration:", loginErr);
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      const resData = err.response?.data;
      let errorMsg = 'Ocurrió un error al registrarse. Verifica si el correo ya está en uso.';
      if (typeof resData === 'string') {
        errorMsg = resData;
      } else if (resData && typeof resData === 'object' && resData.message) {
        errorMsg = resData.message;
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNaturalForm = () => (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Nombres *</Form.Label>
            <Form.Control type="text" placeholder="Ej. Juan" value={nombre} onChange={(e) => { setNombre(e.target.value); if(errors.nombre) setErrors({...errors, nombre: ''}); }} isInvalid={!!errors.nombre} />
            <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Apellidos *</Form.Label>
            <Form.Control type="text" placeholder="Ej. Pérez" value={apellido} onChange={(e) => { setApellido(e.target.value); if(errors.apellido) setErrors({...errors, apellido: ''}); }} isInvalid={!!errors.apellido} />
            <Form.Control.Feedback type="invalid">{errors.apellido}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">RUT / DNI *</Form.Label>
            <Form.Control type="text" placeholder="Ej. 12345678-9" value={rut} onChange={(e) => { setRut(e.target.value); if(errors.rut) setErrors({...errors, rut: ''}); }} isInvalid={!!errors.rut} />
            <Form.Control.Feedback type="invalid">{errors.rut}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Teléfono *</Form.Label>
            <InputGroup>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-country" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                  {COUNTRY_CODES.find(c => c.code === codigoPais)?.flag} {codigoPais}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {COUNTRY_CODES.map((country) => (
                    <Dropdown.Item key={country.name} onClick={() => setCodigoPais(country.code)} title={country.name}>
                      {country.flag} {country.name} ({country.code})
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <Form.Control 
                type="text" 
                placeholder="Ej. 912345678" 
                value={telefono} 
                onChange={(e) => { setTelefono(e.target.value); if(errors.telefono) setErrors({...errors, telefono: ''}); }} 
                isInvalid={!!errors.telefono}
              />
              <Form.Control.Feedback type="invalid">{errors.telefono}</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Región *</Form.Label>
            <Dropdown className="d-grid">
              <Dropdown.Toggle 
                variant="white" 
                className="text-start border d-flex justify-content-between align-items-center" 
                style={{ backgroundColor: '#fff' }}
              >
                {region || 'Selecciona una región'}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {REGIONES_CHILE.map(r => (
                  <Dropdown.Item 
                    key={r} 
                    onClick={() => {
                      setRegion(r);
                      setComuna(''); 
                    }}
                  >
                    {r}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Comuna *</Form.Label>
            <Dropdown className="d-grid">
              <Dropdown.Toggle 
                variant="white" 
                className="text-start border d-flex justify-content-between align-items-center" 
                disabled={!region}
                style={{ backgroundColor: '#fff' }}
              >
                {comuna || 'Selecciona una comuna'}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {region && COMUNAS_POR_REGION[region]?.map(c => (
                  <Dropdown.Item key={c} onClick={() => setComuna(c)}>
                    {c}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={8}>
          <Form.Group className="mb-3" style={{ position: 'relative' }}>
            <Form.Label className="fw-semibold">Dirección (Calle) *</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Escribe tu calle para buscar..." 
              value={direccion} 
              onChange={(e: any) => { handleAddressChange(e); if(errors.direccion) setErrors({...errors, direccion: ''}); }} 
              autoComplete="off"
              isInvalid={!!errors.direccion}
            />
            <Form.Control.Feedback type="invalid">{errors.direccion}</Form.Control.Feedback>
            {isSearchingAddress && (
              <div style={{ position: 'absolute', right: '10px', top: '38px' }}>
                <Spinner animation="border" size="sm" variant="primary" />
              </div>
            )}
            {showAddressDropdown && addressSuggestions.length > 0 && (
              <ListGroup style={{ position: 'absolute', zIndex: 1000, width: '100%', maxHeight: '200px', overflowY: 'auto', boxShadow: '0px 4px 6px rgba(0,0,0,0.1)' }}>
                {addressSuggestions.map((s) => (
                  <ListGroup.Item 
                    key={s.place_id} 
                    action 
                    onClick={() => handleSelectAddress(s)}
                    style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    {s.display_name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Número / Depto *</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Ej. 1234" 
              value={direccionNumero} 
              onChange={(e) => { setDireccionNumero(e.target.value); if(errors.direccionNumero) setErrors({...errors, direccionNumero: ''}); }} 
              isInvalid={!!errors.direccionNumero}
            />
            <Form.Control.Feedback type="invalid">{errors.direccionNumero}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  const renderJuridicaForm = () => (
    <>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Razón Social *</Form.Label>
            <Form.Control type="text" placeholder="Ej. Empresa SpA" value={razonSocial} onChange={(e) => { setRazonSocial(e.target.value); if(errors.razonSocial) setErrors({...errors, razonSocial: ''}); }} isInvalid={!!errors.razonSocial} />
            <Form.Control.Feedback type="invalid">{errors.razonSocial}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">RUT Empresa *</Form.Label>
            <Form.Control type="text" placeholder="Ej. 76543210-K" value={rut} onChange={(e) => { setRut(e.target.value); if(errors.rut) setErrors({...errors, rut: ''}); }} isInvalid={!!errors.rut} />
            <Form.Control.Feedback type="invalid">{errors.rut}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Giro / Rubro *</Form.Label>
            <Form.Control type="text" placeholder="Ej. Alimentos" value={giro} onChange={(e) => { setGiro(e.target.value); if(errors.giro) setErrors({...errors, giro: ''}); }} isInvalid={!!errors.giro} />
            <Form.Control.Feedback type="invalid">{errors.giro}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Nombre de Contacto *</Form.Label>
            <Form.Control type="text" placeholder="Ej. Jefe RSE" value={nombreContacto} onChange={(e) => { setNombreContacto(e.target.value); if(errors.nombreContacto) setErrors({...errors, nombreContacto: ''}); }} isInvalid={!!errors.nombreContacto} />
            <Form.Control.Feedback type="invalid">{errors.nombreContacto}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={8}>
          <Form.Group className="mb-3" style={{ position: 'relative' }}>
            <Form.Label className="fw-semibold">Dirección Comercial (Calle) *</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Ej. Avenida Principal" 
              value={direccion} 
              onChange={(e: any) => { handleAddressChange(e); if(errors.direccion) setErrors({...errors, direccion: ''}); }} 
              autoComplete="off"
              isInvalid={!!errors.direccion}
            />
            <Form.Control.Feedback type="invalid">{errors.direccion}</Form.Control.Feedback>
            {isSearchingAddress && (
              <div style={{ position: 'absolute', right: '10px', top: '38px' }}>
                <Spinner animation="border" size="sm" variant="primary" />
              </div>
            )}
            {showAddressDropdown && addressSuggestions.length > 0 && (
              <ListGroup style={{ position: 'absolute', zIndex: 1000, width: '100%', maxHeight: '200px', overflowY: 'auto', boxShadow: '0px 4px 6px rgba(0,0,0,0.1)' }}>
                {addressSuggestions.map((s) => (
                  <ListGroup.Item 
                    key={s.place_id} 
                    action 
                    onClick={() => handleSelectAddress(s)}
                    style={{ fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    {s.display_name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Número / Depto *</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Ej. 1234, Bodega B" 
              value={direccionNumero} 
              onChange={(e) => { setDireccionNumero(e.target.value); if(errors.direccionNumero) setErrors({...errors, direccionNumero: ''}); }} 
              isInvalid={!!errors.direccionNumero}
            />
            <Form.Control.Feedback type="invalid">{errors.direccionNumero}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Región *</Form.Label>
            <Dropdown className="d-grid">
              <Dropdown.Toggle 
                variant="white" 
                className={`text-start border d-flex justify-content-between align-items-center ${errors.region ? 'border-danger' : ''}`} 
                style={{ backgroundColor: '#fff' }}
              >
                {region || 'Selecciona una región'}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {REGIONES_CHILE.map(r => (
                  <Dropdown.Item 
                    key={r} 
                    onClick={() => {
                      setRegion(r);
                      setComuna(''); 
                    }}
                  >
                    {r}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {errors.region && <div className="invalid-feedback d-block mt-1">{errors.region}</div>}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Comuna *</Form.Label>
            <Dropdown className="d-grid">
              <Dropdown.Toggle 
                variant="white" 
                className={`text-start border d-flex justify-content-between align-items-center ${errors.comuna ? 'border-danger' : ''}`} 
                disabled={!region}
                style={{ backgroundColor: '#fff' }}
              >
                {comuna || 'Selecciona una comuna'}
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {region && COMUNAS_POR_REGION[region]?.map(c => (
                  <Dropdown.Item key={c} onClick={() => setComuna(c)}>
                    {c}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
            {errors.comuna && <div className="invalid-feedback d-block mt-1">{errors.comuna}</div>}
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Teléfono Comercial *</Form.Label>
            <InputGroup>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-country-jur" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                  {COUNTRY_CODES.find(c => c.code === codigoPais)?.flag} {codigoPais}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {COUNTRY_CODES.map((country) => (
                    <Dropdown.Item key={country.name} onClick={() => setCodigoPais(country.code)} title={country.name}>
                      {country.flag} {country.name} ({country.code})
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <Form.Control 
                type="text" 
                placeholder="Ej. 922345678" 
                value={telefono} 
                onChange={(e) => { setTelefono(e.target.value); if(errors.telefono) setErrors({...errors, telefono: ''}); }} 
                isInvalid={!!errors.telefono}
              />
              <Form.Control.Feedback type="invalid">{errors.telefono}</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Sitio Web (Opcional)</Form.Label>
            <Form.Control type="text" placeholder="https://www.empresa.cl" value={sitioWeb} onChange={(e) => setSitioWeb(e.target.value)} />
          </Form.Group>
        </Col>
      </Row>
    </>
  );

  return (
    <>
      {tipoUsuario === null ? (
        <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '80vh' }}>
          <Container>
            <Row className="justify-content-center">
              <Col md={6} lg={5}>
                <Card className="shadow-lg border-0 rounded-4 animate__animated animate__fadeIn">
                  <Card.Body className="p-4 p-md-5 text-center">
                    <h3 className="fw-bold text-dark mb-3">Selecciona tu perfil</h3>
                    <p className="text-muted mb-4">Para brindarte una mejor experiencia, dinos cómo te vas a registrar.</p>
                    <div className="d-grid gap-3">
                      <Button variant="primary" size="lg" className="py-3 shadow-sm rounded-3 fw-bold" onClick={() => setTipoUsuario('NATURAL')}>
                        <i className="bi bi-person-fill me-2"></i> Persona Natural
                      </Button>
                      <Button variant="outline-primary" size="lg" className="py-3 shadow-sm rounded-3 fw-bold" onClick={() => setTipoUsuario('JURIDICA')}>
                        <i className="bi bi-building me-2"></i> Empresa / Organización
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Link to="/login" className="text-muted text-decoration-none">
                        <i className="bi bi-arrow-left me-1"></i> Volver al Login
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      ) : (
        <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '80vh' }}>
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={7}>
                <Card className="shadow-lg border-0 rounded-4 animate__animated animate__fadeIn">
                  <Card.Body className="p-4 p-md-5">
                    <div className="text-center mb-4">
                      <h3 className="fw-bold text-dark">Registro de Donante</h3>
                      <p className="text-muted mb-1">
                        {tipoUsuario === 'NATURAL' ? 'Cuenta para Persona Natural' : 'Cuenta Corporativa'}
                      </p>
                      <Button variant="link" size="sm" className="text-decoration-none" onClick={() => setTipoUsuario(null)}>
                        Cambiar tipo de cuenta
                      </Button>
                    </div>

                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleRegister}>
                      {/* Campos Específicos según tipo */}
                      {tipoUsuario === 'NATURAL' ? renderNaturalForm() : renderJuridicaForm()}

                      <hr className="my-4" />
                      
                      <h5 className="fw-bold mb-3">Datos de Acceso</h5>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Correo Electrónico *</Form.Label>
                            <Form.Control type="email" placeholder="ejemplo@correo.com" value={email} onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: ''}); }} isInvalid={!!errors.email} />
                            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Contraseña *</Form.Label>
                            <Form.Control type="password" placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: ''}); }} isInvalid={!!errors.password} />
                            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Confirmar Contraseña *</Form.Label>
                            <Form.Control type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if(errors.confirmPassword) setErrors({...errors, confirmPassword: ''}); }} isInvalid={!!errors.confirmPassword} />
                            <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button variant="primary" type="submit" disabled={isLoading} className="w-100 py-3 fw-bold shadow-sm mb-3 mt-2 rounded-3">
                        {isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Registrando...</> : 'Crear Cuenta de Donante'}
                      </Button>
                    </Form>

                    <div className="text-center mt-3">
                      <span className="text-muted">¿Ya tienes una cuenta? </span>
                      <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                        Inicia Sesión
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      )}

      {/* Pop-up de Éxito */}
      <Modal show={showSuccessModal} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center p-5">
          <div className="mb-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h3 className="fw-bold mb-3">¡Registro Exitoso!</h3>
          <p className="text-muted mb-4">
            Tu cuenta ha sido creada correctamente y tu sesión ha sido iniciada.
          </p>
          <Button variant="primary" size="lg" className="px-5 rounded-pill fw-bold shadow-sm" onClick={() => { setShowSuccessModal(false); navigate('/'); }}>
            Aceptar y Continuar
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Registro;
