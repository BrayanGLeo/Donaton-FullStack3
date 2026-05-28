import React, { useState, useRef } from 'react';
import { Card, Form, Button, Container, Row, Col, Alert, InputGroup, Dropdown, Spinner, ListGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { registrarDonante } from '../services/usuarioService';
import { validarRutChileno, validarNombreCompleto, validarTelefono, validarPassword, validarEmailDominio, validarNumeroCasa } from '../utils/validators';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../utils/chileData';
import { COUNTRY_CODES } from '../utils/countryCodes';

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

  const [nombreCompleto, setNombreCompleto] = useState('');

  const [razonSocial, setRazonSocial] = useState('');
  const [giro, setGiro] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');
  const [sitioWeb, setSitioWeb] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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

  const validarCamposRequeridos = (): string | null => {
    if (tipoUsuario === 'NATURAL') {
      const faltanCampos = !nombreCompleto || !rut || !email || !password || !telefono || !region || !comuna || !direccion || !direccionNumero;
      return faltanCampos ? 'Por favor completa todos los campos requeridos.' : null;
    }
    const faltanCamposEmpresa = !razonSocial || !rut || !giro || !nombreContacto || !email || !password || !telefono || !direccion || !direccionNumero;
    return faltanCamposEmpresa ? 'Por favor completa todos los campos requeridos de la empresa.' : null;
  };

  const validateForm = (): string | null => {
    if (!validarEmailDominio(email)) return 'Por favor ingresa un correo con un dominio válido y confiable (ej. gmail.com, outlook.com).';
    if (!validarPassword(password)) return 'La contraseña no puede contener espacios, y debe incluir al menos 3 letras y 3 números.';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (!validarRutChileno(rut)) return 'El RUT ingresado no es válido. Debe tener el formato 12345678-9';
    if (tipoUsuario === 'NATURAL' && !validarNombreCompleto(nombreCompleto)) return 'El nombre debe contener 2 nombres y 2 apellidos (mínimo 4 palabras).';
    if (tipoUsuario === 'JURIDICA' && (!razonSocial.trim() || !nombreContacto.trim())) return 'La razón social y el nombre de contacto no pueden estar vacíos.';
    if (!validarTelefono(telefono)) return 'El número de teléfono debe tener entre 9 y 12 dígitos.';
    if (!region || !comuna || !COMUNAS_POR_REGION[region]?.includes(comuna)) return 'Debes seleccionar una región y una comuna válida de la lista.';
    if (!validarNumeroCasa(direccionNumero)) return 'El número de la dirección debe contener al menos 2 números (ej. 12).';
    return validarCamposRequeridos();
  };

  const handleRegister = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
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
      nombreCompleto: tipoUsuario === 'NATURAL' ? nombreCompleto.trim() : null,
      razonSocial: tipoUsuario === 'JURIDICA' ? razonSocial.trim() : null,
      giro: tipoUsuario === 'JURIDICA' ? giro.trim() : null,
      nombreContacto: tipoUsuario === 'JURIDICA' ? nombreContacto.trim() : null,
      sitioWeb: tipoUsuario === 'JURIDICA' ? sitioWeb.trim() : null,
      latitud: coordenadas?.lat ?? null,
      longitud: coordenadas?.lng ?? null,
    };

    try {
      await registrarDonante(payload);
      setSuccess('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data || 'Ocurrió un error al registrarse. Verifica si el correo ya está en uso.');
    }
  };

  const renderNaturalForm = () => (
    <>
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Nombres y Apellidos *</Form.Label>
            <Form.Control type="text" placeholder="Ej. Juan Pérez" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">RUT / DNI *</Form.Label>
            <Form.Control type="text" placeholder="Ej. 12345678-9" value={rut} onChange={(e) => setRut(e.target.value)} />
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
                onChange={(e) => setTelefono(e.target.value)} 
              />
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
              onChange={handleAddressChange} 
              autoComplete="off"
            />
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
              onChange={(e) => setDireccionNumero(e.target.value)} 
            />
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
            <Form.Control type="text" placeholder="Ej. Empresa SpA" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">RUT Empresa *</Form.Label>
            <Form.Control type="text" placeholder="Ej. 76543210-K" value={rut} onChange={(e) => setRut(e.target.value)} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Giro / Rubro *</Form.Label>
            <Form.Control type="text" placeholder="Ej. Alimentos" value={giro} onChange={(e) => setGiro(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Nombre de Contacto *</Form.Label>
            <Form.Control type="text" placeholder="Ej. Jefe RSE" value={nombreContacto} onChange={(e) => setNombreContacto(e.target.value)} />
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
              onChange={handleAddressChange} 
              autoComplete="off"
            />
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
              onChange={(e) => setDireccionNumero(e.target.value)} 
            />
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
                onChange={(e) => setTelefono(e.target.value)} 
              />
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
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleRegister}>
                      {/* Campos Específicos según tipo */}
                      {tipoUsuario === 'NATURAL' ? renderNaturalForm() : renderJuridicaForm()}

                      <hr className="my-4" />
                      
                      <h5 className="fw-bold mb-3">Datos de Acceso</h5>
                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Correo Electrónico *</Form.Label>
                            <Form.Control type="email" placeholder="ejemplo@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Contraseña *</Form.Label>
                            <Form.Control type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Confirmar Contraseña *</Form.Label>
                            <Form.Control type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Button variant="primary" type="submit" className="w-100 py-3 fw-bold shadow-sm mb-3 mt-2 rounded-3">
                        Crear Cuenta de Donante
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
    </>
  );
};

export default Registro;
