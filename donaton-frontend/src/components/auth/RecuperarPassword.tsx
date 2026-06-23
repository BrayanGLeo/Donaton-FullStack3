import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, InputGroup, Spinner, ProgressBar } from 'react-bootstrap';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatNoSpaceInput, preventSpaceKeyDown, getPasswordStrength, validarPassword, validarEmailDominio } from '../../utils/validators';

type Fase = 'SOLICITAR' | 'VERIFICAR' | 'RESETEAR' | 'EXITO';

const solicitarSchema = z.object({
  email: z.string()
    .min(1, 'El correo electrónico es requerido')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Debe ser un correo electrónico válido')
    .refine(validarEmailDominio, 'Dominio de correo no permitido')
});

const verificarSchema = z.object({
  codigo: z.string()
    .length(6, 'El código debe tener exactamente 6 dígitos')
    .regex(/^\d+$/, 'El código solo debe contener números')
});

const resetearSchema = z.object({
  newPassword: z.string()
    .min(1, 'La contraseña es requerida')
    .max(50, 'Máximo 50 caracteres')
    .refine(validarPassword, 'La contraseña debe tener al menos 3 letras, 3 números y permite caracteres especiales'),
  confirmPassword: z.string()
    .min(1, 'La confirmación es requerida')
    .max(50, 'Máximo 50 caracteres')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type SolicitarValues = z.infer<typeof solicitarSchema>;
type VerificarValues = z.infer<typeof verificarSchema>;
type ResetearValues = z.infer<typeof resetearSchema>;

const RecuperarPassword: React.FC = () => {
  const [fase, setFase] = useState<Fase>('SOLICITAR');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // FORMS
  const { 
    register: registerSolicitar, 
    handleSubmit: handleSubmitSolicitar, 
    formState: { errors: errorsSolicitar } 
  } = useForm<SolicitarValues>({ resolver: zodResolver(solicitarSchema), mode: 'onBlur' });

  const { 
    register: registerVerificar, 
    handleSubmit: handleSubmitVerificar, 
    formState: { errors: errorsVerificar } 
  } = useForm<VerificarValues>({ resolver: zodResolver(verificarSchema), mode: 'onChange' });

  const { 
    register: registerResetear, 
    handleSubmit: handleSubmitResetear, 
    watch,
    formState: { errors: errorsResetear } 
  } = useForm<ResetearValues>({ resolver: zodResolver(resetearSchema), mode: 'onChange' });

  // PWD Strength
  const pwd = watch('newPassword') || '';
  const { pwdLetras, pwdNumeros, strengthColor, strengthLabel, strengthWidth } = getPasswordStrength(pwd);
  const confirmPwd = watch('confirmPassword') || '';
  const passwordsMatch = pwd !== '' && pwd === confirmPwd;

  // HANDLERS
  const onSolicitar = async (data: SolicitarValues) => {
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email: data.email });
      setEmail(data.email);
      setFase('VERIFICAR');
      toast.success('Si el correo está registrado, te hemos enviado un código de 6 dígitos.', { duration: 5000 });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setLoading(false);
    }
  };

  const onVerificar = async (data: VerificarValues) => {
    setLoading(true);
    try {
      await axios.post('/api/auth/verify-code', { email, code: data.codigo });
      setCodigo(data.codigo);
      setFase('RESETEAR');
      toast.success('Código verificado correctamente.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  const onResetear = async (data: ResetearValues) => {
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { 
        email, 
        code: codigo, 
        newPassword: data.newPassword 
      });
      setFase('EXITO');
      toast.success('¡Contraseña restablecida exitosamente!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Ocurrió un error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg border-0 rounded-4 animate__animated animate__fadeInUp">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                    <i className="bi bi-shield-lock"></i>
                  </div>
                  <h3 className="fw-bold text-dark">Recuperar Contraseña</h3>
                  {fase !== 'EXITO' && (
                    <p className="text-muted">Sigue los pasos para restablecer tu acceso</p>
                  )}
                </div>

                <div className="position-relative" style={{ minHeight: '220px' }}>
                  <AnimatePresence mode="wait">
                    
                    {fase === 'SOLICITAR' && (
                      <motion.div key="solicitar" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                        <Form onSubmit={handleSubmitSolicitar(onSolicitar)}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Correo Electrónico</Form.Label>
                            <Form.Control 
                              type="email" 
                              placeholder="ejemplo@correo.com" 
                              {...registerSolicitar('email')}
                              isInvalid={!!errorsSolicitar.email}
                              className="py-2"
                              disabled={loading}
                              onInput={formatNoSpaceInput}
                              onKeyDown={preventSpaceKeyDown}
                              autoFocus
                            />
                            <Form.Control.Feedback type="invalid">
                              {errorsSolicitar.email?.message}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted">
                              Te enviaremos un código de seguridad a este correo.
                            </Form.Text>
                          </Form.Group>
                          <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                            {loading ? <><Spinner size="sm" animation="border" /> Enviando...</> : 'Enviar Código'}
                          </Button>
                        </Form>
                      </motion.div>
                    )}

                    {fase === 'VERIFICAR' && (
                      <motion.div key="verificar" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                        <Form onSubmit={handleSubmitVerificar(onVerificar)}>
                          <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold text-center d-block">Código de Verificación</Form.Label>
                            <Form.Control 
                              type="text" 
                              placeholder="000000" 
                              {...registerVerificar('codigo')}
                              isInvalid={!!errorsVerificar.codigo}
                              className="py-2 text-center text-tracking-widest fw-bold fs-3"
                              maxLength={6}
                              disabled={loading}
                              onInput={(e: any) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0,6); }}
                              autoFocus
                            />
                            <Form.Control.Feedback type="invalid" className="text-center">
                              {errorsVerificar.codigo?.message}
                            </Form.Control.Feedback>
                            <Form.Text className="text-muted text-center d-block mt-2">
                              Ingresa los 6 dígitos que enviamos a <strong>{email}</strong>
                            </Form.Text>
                          </Form.Group>
                          <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                            {loading ? <><Spinner size="sm" animation="border" /> Verificando...</> : 'Verificar Código'}
                          </Button>
                        </Form>
                      </motion.div>
                    )}

                    {fase === 'RESETEAR' && (
                      <motion.div key="resetear" variants={formVariants} initial="hidden" animate="visible" exit="exit">
                        <Form onSubmit={handleSubmitResetear(onResetear)}>
                          <Form.Group className="mb-2">
                            <Form.Label className="fw-semibold">Nueva Contraseña</Form.Label>
                            <InputGroup hasValidation>
                              <Form.Control 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                {...registerResetear('newPassword')}
                                isInvalid={!!errorsResetear.newPassword}
                                className="py-2 border-end-0"
                                disabled={loading}
                                onInput={formatNoSpaceInput}
                                onKeyDown={preventSpaceKeyDown}
                                autoFocus
                              />
                              <Button 
                                variant="outline-secondary" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="d-flex align-items-center bg-white border-start-0"
                                disabled={loading}
                              >
                                {showPassword ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-muted" />}
                              </Button>
                              <Form.Control.Feedback type="invalid">
                                {errorsResetear.newPassword?.message}
                              </Form.Control.Feedback>
                            </InputGroup>
                          </Form.Group>

                          {pwd.length > 0 && (
                            <div className="mb-3 px-1">
                              <ProgressBar style={{ height: '6px' }} className="mt-2 mb-1">
                                <ProgressBar variant={strengthColor} now={Number.parseInt(strengthWidth.replace('%', ''), 10)} />
                              </ProgressBar>
                              <div className="d-flex justify-content-between">
                                <small className={`text-${strengthColor} fw-bold`} style={{ fontSize: '0.75rem' }}>
                                  {strengthLabel}
                                </small>
                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                  {pwdLetras}/3 letras, {pwdNumeros}/3 números
                                </small>
                              </div>
                            </div>
                          )}

                          <Form.Group className="mb-4 mt-2">
                            <Form.Label className="fw-semibold">Confirmar Contraseña</Form.Label>
                            <InputGroup hasValidation>
                              <Form.Control 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                {...registerResetear('confirmPassword')}
                                isInvalid={!!errorsResetear.confirmPassword}
                                isValid={passwordsMatch && !errorsResetear.confirmPassword}
                                className="py-2 border-end-0"
                                disabled={loading}
                                onInput={formatNoSpaceInput}
                                onKeyDown={preventSpaceKeyDown}
                              />
                              <Button 
                                variant="outline-secondary" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="d-flex align-items-center bg-white border-start-0"
                                disabled={loading}
                              >
                                {showConfirmPassword ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-muted" />}
                              </Button>
                              <Form.Control.Feedback type="invalid">
                                {errorsResetear.confirmPassword?.message}
                              </Form.Control.Feedback>
                            </InputGroup>
                          </Form.Group>
                          <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                            {loading ? <><Spinner size="sm" animation="border" /> Restableciendo...</> : 'Restablecer Contraseña'}
                          </Button>
                        </Form>
                      </motion.div>
                    )}

                    {fase === 'EXITO' && (
                      <motion.div key="exito" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="text-center mt-3">
                        <div className="mb-4 text-success" style={{ fontSize: '64px' }}>
                          <i className="bi bi-check-circle-fill"></i>
                        </div>
                        <h4 className="fw-bold mb-3">¡Contraseña Cambiada!</h4>
                        <p className="text-muted mb-4">
                          Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
                        </p>
                        <Button variant="primary" className="w-100 py-2 fw-bold shadow-sm" onClick={() => navigate('/login')}>
                          Ir a Iniciar Sesión
                        </Button>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {fase !== 'EXITO' && (
                  <div className="text-center mt-4 pt-2">
                    <Link to="/login" className="text-decoration-none text-muted" style={{ transition: 'color 0.2s ease' }}>
                      <i className="bi bi-arrow-left me-2"></i> Volver a Iniciar Sesión
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RecuperarPassword;

