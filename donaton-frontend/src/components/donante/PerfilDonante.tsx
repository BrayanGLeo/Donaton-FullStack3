import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerUsuarios, actualizarUsuario, cambiarPassword, verificarEmailDisponible } from '../../services/usuarioService';
import { toast } from 'react-hot-toast';
import { User, MapPin, Lock, Info, CheckCircle2, ShieldAlert, Mail, Map, Building, Hash, Eye, EyeOff } from 'lucide-react';
import { Container, Row, Col, Card, Form, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import Select from 'react-select';
import { RegionComunaInput } from '../common/RegionComunaInput';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../../utils/chileData';
import { formatNoSpaceInput, preventSpaceKeyDown, validarEmailDominio, getPasswordStrength } from '../../utils/validators';

const PerfilDonante: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submittingDir, setSubmittingDir] = useState(false);
  const [submittingSeg, setSubmittingSeg] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Formularios
  const [direccionForm, setDireccionForm] = useState({ region: '', comuna: '', direccion: '' });
  const [seguridadForm, setSeguridadForm] = useState({ email: '', currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!usuario?.id) return;
      try {
        setLoading(true);
        const res = await obtenerUsuarios({ rol: 'DONANTE', size: 1000 });
        const currentUser = res.content.find((u: any) => Number(u.id) === Number(usuario.id));
        if (currentUser) {
          setUserData(currentUser);
          setDireccionForm({
            region: currentUser.region || '',
            comuna: currentUser.comuna || '',
            direccion: currentUser.direccion || ''
          });
          setSeguridadForm(prev => ({ ...prev, email: currentUser.email || '' }));
        } else {
          toast.error('No se pudo encontrar la información de tu perfil.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        toast.error('Error al cargar perfil.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [usuario]);

  const handleDireccionSubmit = async () => {
    if (!usuario?.id) return;
    
    if (!direccionForm.region || !direccionForm.comuna || !direccionForm.direccion) {
      toast.error('Todos los campos de dirección son obligatorios.');
      return;
    }

    if (direccionForm.direccion.length > 100) {
      toast.error('La dirección no puede tener más de 100 caracteres.');
      return;
    }

    try {
      setSubmittingDir(true);
      await actualizarUsuario(Number(usuario.id), {
        region: direccionForm.region,
        comuna: direccionForm.comuna,
        direccion: direccionForm.direccion
      });
      toast.success('Dirección actualizada correctamente.');
      setUserData((prev: any) => ({ ...prev, ...direccionForm }));
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Error al actualizar la dirección.');
    } finally {
      setSubmittingDir(false);
    }
  };

  const checkPasswordValidations = (): boolean => {
    if (seguridadForm.newPassword || seguridadForm.currentPassword) {
      if (seguridadForm.newPassword.length < 6) {
        toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
        return false;
      }
      if (seguridadForm.newPassword !== seguridadForm.confirmPassword) {
        toast.error('Las nuevas contraseñas no coinciden.');
        return false;
      }
      if (!seguridadForm.currentPassword) {
        toast.error('Debes ingresar tu contraseña actual para cambiarla.');
        return false;
      }
    }
    return true;
  };

  const handleEmailUpdate = async (): Promise<boolean> => {
    if (!usuario?.id) return false;
    if (seguridadForm.email === userData.email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(seguridadForm.email) || !validarEmailDominio(seguridadForm.email)) {
      toast.error('El formato o dominio del correo no es válido.');
      return false;
    }

    const isAvailable = await verificarEmailDisponible(seguridadForm.email);
    if (!isAvailable) {
      toast.error('El nuevo correo ya está en uso.');
      return false;
    }

    await actualizarUsuario(Number(usuario.id), { email: seguridadForm.email });
    return true;
  };

  const handleSeguridadSubmit = async () => {
    if (!usuario?.id) return;
    if (!checkPasswordValidations()) return;

    try {
      setSubmittingSeg(true);
      let requiresLogout = false;

      const emailUpdated = await handleEmailUpdate();
      if (emailUpdated) requiresLogout = true;

      if (seguridadForm.newPassword && seguridadForm.currentPassword) {
        await cambiarPassword(Number(usuario.id), seguridadForm.currentPassword, seguridadForm.newPassword);
        requiresLogout = true;
      }

      if (requiresLogout) {
        toast.success('Datos de seguridad actualizados. Inicia sesión nuevamente.', { duration: 5000 });
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      } else {
        toast.success('No hubo cambios en la seguridad.');
      }
    } catch (error: any) {
      console.error('Error updating security settings:', error);
      toast.error(error?.response?.data?.message || 'Error al actualizar seguridad.');
    } finally {
      setSubmittingSeg(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="success" style={{ width: '3rem', height: '3rem' }} />
      </Container>
    );
  }

  const { strengthColor, strengthLabel, strengthWidth } = getPasswordStrength(seguridadForm.newPassword);
  const passwordsMatch = seguridadForm.newPassword !== '' && seguridadForm.newPassword === seguridadForm.confirmPassword;

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Hero Banner Moderno */}
      <div style={{
        background: 'linear-gradient(135deg, #0f5132 0%, #198754 100%)',
        padding: '3rem 0 5rem 0',
        borderBottomLeftRadius: '3rem',
        borderBottomRightRadius: '3rem',
        boxShadow: '0 10px 30px rgba(25, 135, 84, 0.2)'
      }}>
        <Container>
          <h2 className="text-white fw-bold display-6 mb-1">Mi Perfil</h2>
          <p className="text-white-50 fs-5">Gestiona tu información personal y preferencias de seguridad</p>
        </Container>
      </div>

      <Container style={{ marginTop: '-4rem' }} className="position-relative z-1">
        
        {/* Profile Card Header */}
        <Card className="border-0 shadow rounded-4 mb-4 overflow-hidden">
          <Card.Body className="p-4 p-md-5 d-flex flex-column flex-md-row align-items-center gap-4">
            <div 
              className="d-flex align-items-center justify-content-center rounded-circle shadow-sm" 
              style={{ width: '100px', height: '100px', background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' }}
            >
              <User size={48} color="#198754" strokeWidth={1.5} />
            </div>
            <div className="text-center text-md-start">
              <h2 className="fw-bolder mb-2 text-dark">
                {userData?.nombreCompleto || userData?.razonSocial || 'Usuario'}
              </h2>
              <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2 align-items-center">
                <Badge bg="success" className="px-3 py-2 rounded-pill fs-6 fw-semibold shadow-sm">
                  {usuario?.rol}
                </Badge>
                <span className="text-muted d-flex align-items-center">
                  <MapPin size={16} className="me-1" />
                  {userData?.comuna ? `${userData.comuna}, ${userData.region}` : 'Ubicación no configurada'}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Layout tipo Grid Bento */}
        <Row className="g-4">
          
          {/* Columna Izquierda: Datos Personales */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4 p-xl-5">
                <h4 className="fw-bold mb-4 d-flex align-items-center text-dark">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                    <User className="text-primary" size={24} />
                  </div>
                  Datos Personales
                </h4>
                
                <div className="d-flex flex-column gap-4">
                  <div>
                    <p className="text-muted mb-1 fs-6 d-flex align-items-center">
                      <User size={16} className="me-2" /> Nombre Completo
                    </p>
                    <p className="fw-semibold fs-5 text-dark mb-0">{userData?.nombreCompleto || userData?.razonSocial || '-'}</p>
                  </div>
                  
                  <hr className="my-0 text-muted opacity-25" />
                  
                  <div>
                    <p className="text-muted mb-1 fs-6 d-flex align-items-center">
                      <Hash size={16} className="me-2" /> RUT
                    </p>
                    <p className="fw-semibold fs-5 text-dark mb-0">{userData?.rut || '-'}</p>
                  </div>
                  
                  <hr className="my-0 text-muted opacity-25" />
                  
                  <div>
                    <p className="text-muted mb-1 fs-6 d-flex align-items-center">
                      <Building size={16} className="me-2" /> Tipo de Persona
                    </p>
                    <p className="fw-semibold fs-5 text-dark mb-0">{userData?.tipoPersona || '-'}</p>
                  </div>
                </div>

                <Alert variant="info" className="mt-5 mb-0 border-0 bg-info bg-opacity-10 text-info-emphasis d-flex align-items-start rounded-3">
                  <Info size={20} className="me-2 flex-shrink-0 mt-1" />
                  <small>Esta información es de solo lectura. Para solicitar modificaciones formales contacta a soporte.</small>
                </Alert>
              </Card.Body>
            </Card>
          </Col>

          {/* Columna Derecha: Formularios */}
          <Col lg={8}>
            
            {/* Tarjeta Dirección */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Body className="p-4 p-xl-5">
                <h4 className="fw-bold mb-1 d-flex align-items-center text-dark">
                  <div className="bg-success bg-opacity-10 p-2 rounded-3 me-3">
                    <Map className="text-success" size={24} />
                  </div>
                  Dirección Operativa
                </h4>
                <p className="text-muted mb-4 ms-5 ps-2">Ubicación donde gestionaremos tus donaciones</p>
                
                <Form onSubmit={(e) => { e.preventDefault(); handleDireccionSubmit(); }}>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-secondary">Región <span className="text-danger">*</span></Form.Label>
                        <Select
                          options={REGIONES_CHILE.map(r => ({ value: r, label: r }))}
                          placeholder="Seleccione una región..."
                          components={{ Input: RegionComunaInput }}
                          value={direccionForm.region ? { value: direccionForm.region, label: direccionForm.region } : null}
                          onChange={(option: any) => setDireccionForm({...direccionForm, region: option?.value || '', comuna: ''})}
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: 'calc(1.5em + 1rem + 2px)',
                              borderRadius: '0.75rem',
                              border: '0',
                              backgroundColor: '#f8f9fa',
                              boxShadow: 'none',
                              paddingLeft: '0.5rem',
                            })
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="fw-semibold text-secondary">Comuna <span className="text-danger">*</span></Form.Label>
                        <Select
                          options={direccionForm.region ? COMUNAS_POR_REGION[direccionForm.region]?.map(c => ({ value: c, label: c })) || [] : []}
                          placeholder="Seleccione una comuna..."
                          isDisabled={!direccionForm.region}
                          components={{ Input: RegionComunaInput }}
                          value={direccionForm.comuna ? { value: direccionForm.comuna, label: direccionForm.comuna } : null}
                          onChange={(option: any) => setDireccionForm({...direccionForm, comuna: option?.value || ''})}
                          noOptionsMessage={() => direccionForm.region ? "No hay comunas" : "Seleccione una región primero"}
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: 'calc(1.5em + 1rem + 2px)',
                              borderRadius: '0.75rem',
                              border: '0',
                              backgroundColor: '#f8f9fa',
                              boxShadow: 'none',
                              paddingLeft: '0.5rem',
                            })
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-end mb-2">
                      <Form.Label className="fw-semibold text-secondary mb-0">Dirección Exacta <span className="text-danger">*</span></Form.Label>
                      <small className={`fw-medium ${direccionForm.direccion.length > 90 ? 'text-danger' : 'text-muted'}`}>
                        {direccionForm.direccion.length}/100
                      </small>
                    </div>
                    <Form.Control 
                      type="text" 
                      required
                      maxLength={100}
                      size="lg"
                      className="bg-light border-0 shadow-none px-4"
                      style={{ borderRadius: '0.75rem' }}
                      value={direccionForm.direccion} 
                      onChange={(e) => setDireccionForm({...direccionForm, direccion: e.target.value})}
                      placeholder="Calle, Número, Depto, Población..."
                    />
                  </Form.Group>

                  <div className="text-end">
                    <Button 
                      variant="success" 
                      type="submit" 
                      size="lg"
                      disabled={submittingDir}
                      className="rounded-pill px-4 fw-bold shadow-sm"
                    >
                      {submittingDir ? (
                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Guardando...</>
                      ) : (
                        <><CheckCircle2 size={20} className="me-2 mb-1" /> Actualizar Dirección</>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Tarjeta Seguridad */}
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4 p-xl-5">
                <h4 className="fw-bold mb-1 d-flex align-items-center text-dark">
                  <div className="bg-warning bg-opacity-10 p-2 rounded-3 me-3">
                    <ShieldAlert className="text-warning" size={24} />
                  </div>
                  Privacidad y Seguridad
                </h4>
                <p className="text-muted mb-4 ms-5 ps-2">Credenciales y configuración de acceso seguro</p>

                <Alert variant="warning" className="border-0 bg-warning bg-opacity-10 rounded-3 d-flex align-items-start mb-4">
                  <Lock size={20} className="text-warning-emphasis me-3 flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="alert-heading fw-bold text-warning-emphasis mb-1">Cierre de sesión automático</h6>
                    <small className="text-warning-emphasis">Por tu seguridad, si actualizas tu correo electrónico o cambias tu contraseña, cerraremos tu sesión automáticamente y deberás volver a ingresar.</small>
                  </div>
                </Alert>

                <Form onSubmit={(e) => { e.preventDefault(); handleSeguridadSubmit(); }}>
                  
                  {/* Sección Correo */}
                  <h5 className="fw-bold mt-4 mb-3 d-flex align-items-center text-dark">
                    <Mail size={20} className="me-2 text-primary" /> Correo Electrónico
                  </h5>
                  <div className="ms-4 ps-3 border-start border-2 border-light mb-4">
                    <Form.Group style={{ maxWidth: '500px' }}>
                      <Form.Label className="fw-semibold text-secondary">Dirección Actual <span className="text-danger">*</span></Form.Label>
                      <Form.Control 
                        type="email" 
                        required
                        size="lg"
                        className="bg-light border-0 shadow-none px-4"
                        style={{ borderRadius: '0.75rem' }}
                        value={seguridadForm.email} 
                        onChange={(e) => setSeguridadForm({...seguridadForm, email: e.target.value})}
                        onInput={formatNoSpaceInput}
                        onKeyDown={preventSpaceKeyDown}
                        maxLength={100}
                      />
                    </Form.Group>
                  </div>

                  {/* Sección Contraseña */}
                  <h5 className="fw-bold mt-4 mb-3 d-flex align-items-center text-dark">
                    <Lock size={20} className="me-2 text-success" /> Cambiar Contraseña
                  </h5>
                  <div className="ms-4 ps-3 border-start border-2 border-light mb-4">
                    <Form.Group className="mb-3" style={{ maxWidth: '500px' }}>
                      <Form.Label className="fw-semibold text-secondary">Contraseña Actual</Form.Label>
                      <div className="position-relative">
                        <Form.Control 
                          type={showCurrentPassword ? "text" : "password"} 
                          size="lg"
                          className="bg-light border-0 shadow-none px-4"
                          style={{ borderRadius: '0.75rem', paddingRight: '2.5rem' }}
                          value={seguridadForm.currentPassword} 
                          onChange={(e) => setSeguridadForm({...seguridadForm, currentPassword: e.target.value})}
                          placeholder="Ingrésala solo si deseas cambiarla"
                          onInput={formatNoSpaceInput}
                          onKeyDown={preventSpaceKeyDown}
                          maxLength={50}
                        />
                        <Button 
                          variant="link" 
                          className="position-absolute top-50 end-0 translate-middle-y text-muted px-3 text-decoration-none shadow-none"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </Button>
                      </div>
                    </Form.Group>

                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary">Nueva Contraseña</Form.Label>
                          <div className="position-relative">
                            <Form.Control 
                              type={showNewPassword ? "text" : "password"} 
                              minLength={6}
                              size="lg"
                              className="bg-light border-0 shadow-none px-4"
                              style={{ borderRadius: '0.75rem', paddingRight: '2.5rem' }}
                              value={seguridadForm.newPassword} 
                              onChange={(e) => setSeguridadForm({...seguridadForm, newPassword: e.target.value})}
                              placeholder="Mínimo 6 caracteres"
                              onInput={formatNoSpaceInput}
                              onKeyDown={preventSpaceKeyDown}
                              maxLength={50}
                            />
                            <Button 
                              variant="link" 
                              className="position-absolute top-50 end-0 translate-middle-y text-muted px-3 text-decoration-none shadow-none"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </Button>
                          </div>
                          {seguridadForm.newPassword.length > 0 && (
                            <div className="mt-2 px-1">
                              <div className="progress" style={{ height: '4px' }}>
                                <div className={`progress-bar ${strengthColor}`} style={{ width: strengthWidth, transition: 'width 0.3s ease, background-color 0.3s ease' }} />
                              </div>
                              <div className="text-end mt-1" style={{ fontSize: '0.75rem', color: 'var(--bs-gray-600)' }}>
                                Seguridad: <span className="fw-bold">{strengthLabel}</span>
                              </div>
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold text-secondary">Confirmar Contraseña</Form.Label>
                          <div className="position-relative">
                            <Form.Control 
                              type={showConfirmPassword ? "text" : "password"} 
                              minLength={6}
                              size="lg"
                              className="bg-light border-0 shadow-none px-4"
                              style={{ borderRadius: '0.75rem', paddingRight: '2.5rem' }}
                              value={seguridadForm.confirmPassword} 
                              onChange={(e) => setSeguridadForm({...seguridadForm, confirmPassword: e.target.value})}
                              placeholder="Repite la nueva contraseña"
                              onInput={formatNoSpaceInput}
                              onKeyDown={preventSpaceKeyDown}
                              maxLength={50}
                            />
                            <Button 
                              variant="link" 
                              className="position-absolute top-50 end-0 translate-middle-y text-muted px-3 text-decoration-none shadow-none"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </Button>
                          </div>
                          {seguridadForm.confirmPassword.length > 0 && passwordsMatch && (
                            <div className="mt-2 px-1 text-success d-flex align-items-center" style={{ fontSize: '0.85rem' }}>
                              <CheckCircle2 size={16} className="me-1" />
                              Las contraseñas coinciden
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  <div className="text-end pt-3 mt-4 border-top">
                    <Button 
                      variant="dark" 
                      type="submit" 
                      size="lg"
                      disabled={submittingSeg}
                      className="rounded-pill px-4 fw-bold shadow-sm"
                    >
                      {submittingSeg ? (
                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Actualizando...</>
                      ) : (
                        <><ShieldAlert size={20} className="me-2 mb-1" /> Actualizar Seguridad</>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PerfilDonante;
