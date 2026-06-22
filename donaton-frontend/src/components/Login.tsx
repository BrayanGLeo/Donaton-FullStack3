import React, { useState } from 'react';
import { Card, Form, Button, Container, Row, Col, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import type { Rol, Usuario } from '../context/AuthContext';
import { Eye, EyeOff, HeartPulse, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { formatNoSpaceInput, preventSpaceKeyDown } from '../utils/validators';

const loginSchema = z.object({
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Debe ser un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean().optional()
}).superRefine((data, ctx) => {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.startsWith(' ')) {
      ctx.addIssue({ code: "custom", message: "No puede empezar con un espacio", path: [key] });
    }
  }
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface AuthResponse {
  token: string;
  email: string;
  rol: Rol;
  id: number;
  nombreCompleto: string;
  subRol?: string;
  region?: string;
  centroAcopioId?: number;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [blockUntil, setBlockUntil] = useState<number | null>(null);

  React.useEffect(() => {
    const storedAttempts = localStorage.getItem('loginFailedAttempts');
    const storedBlockUntil = localStorage.getItem('loginBlockUntil');
    
    if (storedBlockUntil) {
      const blockTime = Number.parseInt(storedBlockUntil, 10);
      if (blockTime > Date.now()) {
        setBlockUntil(blockTime);
      } else {
        localStorage.removeItem('loginFailedAttempts');
        localStorage.removeItem('loginBlockUntil');
      }
    } else if (storedAttempts) {
      setFailedAttempts(Number.parseInt(storedAttempts, 10));
    }
  }, []);

  React.useEffect(() => {
    if (blockUntil) {
      const interval = setInterval(() => {
        if (Date.now() > blockUntil) {
          setBlockUntil(null);
          setFailedAttempts(0);
          localStorage.removeItem('loginFailedAttempts');
          localStorage.removeItem('loginBlockUntil');
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [blockUntil]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false }
  });

  const handleNavigation = (rol: Rol, subRol?: string) => {
    if (rol === 'ADMIN') {
      navigate('/admin');
    } else if (rol === 'COORDINADOR') {
      navigate('/dashboard');
    } else if (rol === 'LOGISTICA') {
      if (subRol === 'RECEPCIONISTA') navigate('/recepcionista');
      else if (subRol === 'CONDUCTOR') navigate('/conductor');
      else navigate('/logistica');
    } else {
      navigate('/mis-donaciones');
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await axios.post<AuthResponse>('/api/auth/login', { 
        email: data.email.trim(), 
        password: data.password 
      });
      const resData = response.data;
      
      const usuarioLogueado: Usuario = {
        id: resData.id,
        nombre: resData.nombreCompleto || resData.email,
        email: resData.email,
        rol: resData.rol,
        subRol: resData.subRol,
        region: resData.region,
        centroAcopioId: resData.centroAcopioId
      };

      login(resData.token, usuarioLogueado, !!data.rememberMe);
      handleNavigation(resData.rol, resData.subRol);
      
    } catch (err: any) {
      const status = err?.response?.status;
      console.error("Detalles del error de login:", err);
      
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('loginFailedAttempts', newAttempts.toString());

      if (newAttempts >= 10) {
        const blockTime = Date.now() + 15 * 60 * 1000; // 15 minutos
        setBlockUntil(blockTime);
        localStorage.setItem('loginBlockUntil', blockTime.toString());
        toast.error('Has excedido el número máximo de intentos. Inténtalo de nuevo en 15 minutos.');
        return;
      }
      
      if (status === 401 || status === 403 || status === 404 || status === 400 || status === 500) {
        toast.error(`Credenciales inválidas. Intentos fallidos: ${newAttempts}/10`);
      } else if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
        toast.error('Error de conexión. Por favor, intenta nuevamente.');
      } else if (err?.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Ocurrió un error de conexión. Verifica que el servidor esté en línea.');
      }
    }
  };

  const isBlocked = blockUntil !== null && Date.now() < blockUntil;
  const minutesRemaining = blockUntil ? Math.ceil((blockUntil - Date.now()) / 60000) : 0;

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg border-0 rounded-4">
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '60px', height: '60px' }}>
                      <HeartPulse size={32} />
                    </div>
                    <h3 className="fw-bold text-dark">Bienvenido de vuelta</h3>
                    <p className="text-muted">Inicia sesión en el Sistema Donatón</p>
                  </div>

                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                      <Form.Label className="fw-semibold">Correo Electrónico</Form.Label>
                      <div className="position-relative">
                        <Form.Control 
                          type="email" 
                          placeholder="ejemplo@correo.com" 
                          {...register('email')}
                          isInvalid={!!errors.email}
                          className="py-2 pe-5"
                          disabled={isSubmitting || isBlocked}
                          maxLength={100}
                          onInput={formatNoSpaceInput}
                          onKeyDown={preventSpaceKeyDown}
                          autoFocus
                        />
                        {watch('email') && watch('email').length > 0 && !isSubmitting && !isBlocked && (
                          <button
                            type="button"
                            onClick={() => {
                              setValue('email', '', { shouldValidate: true });
                              document.getElementById('formBasicEmail')?.focus();
                            }}
                            className="position-absolute border-0 bg-transparent text-muted"
                            style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 10 }}
                          >
                            <X size={18} />
                          </button>
                        )}
                        <Form.Control.Feedback type="invalid">
                          {errors.email?.message}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <Form.Label className="fw-semibold mb-0">Contraseña</Form.Label>
                        <Link to="/recuperar-password" className="text-decoration-none small text-primary fw-semibold">
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <InputGroup>
                        <Form.Control 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          {...register('password')}
                          isInvalid={!!errors.password}
                          className="py-2 border-end-0"
                          disabled={isSubmitting || isBlocked}
                          maxLength={50}
                          onInput={formatNoSpaceInput}
                          onKeyDown={preventSpaceKeyDown}
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="d-flex align-items-center bg-white border-start-0"
                          disabled={isSubmitting || isBlocked}
                          style={{ borderColor: errors.password ? '#dc3545' : '#dee2e6' }}
                        >
                          {showPassword ? <EyeOff size={18} className="text-muted" /> : <Eye size={18} className="text-muted" />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {errors.password?.message}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-4 d-flex align-items-center gap-2 user-select-none">
                      <input 
                        type="checkbox" 
                        id="formRememberMe"
                        className="form-check-input m-0"
                        style={{ cursor: 'pointer', borderColor: '#495057', borderWidth: '2px' }}
                        {...register('rememberMe')}
                        disabled={isSubmitting || isBlocked}
                      />
                      <label htmlFor="formRememberMe" className="text-muted small mb-0" style={{ cursor: 'pointer' }}>
                        Recuérdame en este equipo
                      </label>
                    </Form.Group>

                    {isBlocked && (
                      <div className="alert alert-danger mt-3 mb-3 p-2 text-center" style={{ fontSize: '0.9rem' }}>
                        Cuenta bloqueada temporalmente.<br/>
                        Inténtalo de nuevo en <b>{minutesRemaining} {minutesRemaining === 1 ? 'minuto' : 'minutos'}</b>.
                      </div>
                    )}

                    <Button variant="primary" type="submit" className="w-100 py-2 fw-bold shadow-sm mb-3 d-flex justify-content-center align-items-center gap-2" disabled={isSubmitting || isBlocked}>
                      {isSubmitting ? (
                        <>
                          <Spinner size="sm" animation="border" /> Iniciando sesión...
                        </>
                      ) : (
                        'Ingresar'
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
