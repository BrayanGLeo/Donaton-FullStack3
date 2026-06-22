import React, { useState } from 'react';
import { Card, Container, Row, Col, Alert, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { registrarDonante } from '../services/usuarioService';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HeartPulse, Building2, User } from 'lucide-react';

import { RegistroNatural } from './registro/RegistroNatural';
import { RegistroJuridica } from './registro/RegistroJuridica';
import type { RegistroNaturalValues, RegistroJuridicaValues } from './registro/RegistroSchemas';

const Registro: React.FC = () => {
  const [tipoUsuario, setTipoUsuario] = useState<'NATURAL' | 'JURIDICA' | null>(null);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleNaturalSubmit = async (data: RegistroNaturalValues) => {
    setError(''); 
    setIsLoading(true);

    const payload = {
      tipoPersona: 'NATURAL',
      email: data.email,
      password: data.password,
      codigoPais: data.codigoPais,
      telefono: data.telefono,
      rut: data.rut,
      region: data.region,
      comuna: data.comuna,
      direccion: data.direccion,
      direccionNumero: data.direccionNumero,
      latitud: data.latitud,
      longitud: data.longitud,
      nombreCompleto: `${data.nombre} ${data.apellido}`.trim()
    };

    try {
      await registrarDonante(payload);
      setShowSuccessModal(true);
      
      try {
        const response = await axios.post('/api/auth/login', { email: data.email, password: data.password });
        const resData = response.data;
        login(resData.token, {
          id: resData.id,
          nombre: resData.nombreCompleto || resData.email,
          email: resData.email,
          rol: resData.rol
        });
      } catch (loginErr) {
        console.error("Auto-login failed:", loginErr);
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setError(err.response.data.message); toast.error(err.response.data.message);
      } else {
        setError('Ocurrió un error de conexión.'); toast.error('Ocurrió un error de conexión.');
      }
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJuridicaSubmit = async (data: RegistroJuridicaValues) => {
    setError(''); 
    setIsLoading(true);

    const payload = {
      tipoPersona: 'JURIDICA',
      email: data.email,
      password: data.password,
      codigoPais: data.codigoPais,
      telefono: data.telefono,
      rut: data.rut,
      region: data.region,
      comuna: data.comuna,
      direccion: data.direccion,
      direccionNumero: data.direccionNumero,
      latitud: data.latitud,
      longitud: data.longitud,
      razonSocial: data.razonSocial,
      giro: data.giro,
      nombreContacto: data.nombreContacto,
      sitioWeb: data.sitioWeb
    };

    try {
      await registrarDonante(payload);
      setShowSuccessModal(true);
      
      try {
        const response = await axios.post('/api/auth/login', { email: data.email, password: data.password });
        const resData = response.data;
        login(resData.token, {
          id: resData.id,
          nombre: resData.nombreCompleto || resData.email,
          email: resData.email,
          rol: resData.rol
        });
      } catch (loginErr) {
        console.error("Auto-login failed:", loginErr);
      }
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setError(err.response.data.message); toast.error(err.response.data.message);
      } else {
        setError('Ocurrió un error de conexión.'); toast.error('Ocurrió un error de conexión.');
      }
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/mis-donaciones');
  };

  return (
    <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '80vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card className="shadow-lg border-0 rounded-4">
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm" style={{ width: '60px', height: '60px' }}>
                      <HeartPulse size={32} />
                    </div>
                    <h3 className="fw-bold text-dark">Únete a Donatón</h3>
                    <p className="text-muted">Crea tu cuenta para comenzar a hacer la diferencia</p>
                  </div>

                  {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

                  <AnimatePresence mode="wait">
                    {tipoUsuario ? (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="d-flex align-items-center mb-4">
                          <Button variant="link" className="p-0 me-3 text-secondary text-decoration-none" onClick={() => setTipoUsuario(null)}>
                            ← Volver
                          </Button>
                          <h5 className="mb-0 text-primary fw-bold">
                            Registro de Persona {tipoUsuario === 'NATURAL' ? 'Natural' : 'Jurídica'}
                          </h5>
                        </div>
                        {tipoUsuario === 'NATURAL' ? (
                          <RegistroNatural onSubmit={handleNaturalSubmit} isLoading={isLoading} onCancel={() => setTipoUsuario(null)} />
                        ) : (
                          <RegistroJuridica onSubmit={handleJuridicaSubmit} isLoading={isLoading} onCancel={() => setTipoUsuario(null)} />
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="selector"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h5 className="text-center mb-4 text-secondary">¿Cómo deseas registrarte?</h5>
                        <Row className="g-4">
                          <Col md={6}>
                            <Card 
                              className="h-100 border-2 cursor-pointer hover-card text-center py-4"
                              onClick={() => setTipoUsuario('NATURAL')}
                              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                              onMouseEnter={(e) => e.currentTarget.classList.add('shadow', 'border-primary')}
                              onMouseLeave={(e) => e.currentTarget.classList.remove('shadow', 'border-primary')}
                            >
                              <Card.Body>
                                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                  <User size={40} className="text-primary" />
                                </div>
                                <h5 className="fw-bold">Persona Natural</h5>
                                <p className="text-muted small mb-0">Para individuos que desean donar a título personal</p>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col md={6}>
                            <Card 
                              className="h-100 border-2 cursor-pointer hover-card text-center py-4"
                              onClick={() => setTipoUsuario('JURIDICA')}
                              style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                              onMouseEnter={(e) => e.currentTarget.classList.add('shadow', 'border-primary')}
                              onMouseLeave={(e) => e.currentTarget.classList.remove('shadow', 'border-primary')}
                            >
                              <Card.Body>
                                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                                  <Building2 size={40} className="text-primary" />
                                </div>
                                <h5 className="fw-bold">Persona Jurídica</h5>
                                <p className="text-muted small mb-0">Para empresas e instituciones que desean colaborar</p>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                        <div className="text-center mt-4">
                          <p className="text-muted">¿Ya tienes una cuenta? <a href="/login" className="text-primary text-decoration-none fw-bold">Inicia Sesión</a></p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>

      <Modal show={showSuccessModal} onHide={handleModalClose} backdrop="static" keyboard={false} centered>
        <Modal.Body className="text-center p-5">
          <div className="mb-4 text-success">
            <HeartPulse size={64} className="animate__animated animate__pulse animate__infinite" />
          </div>
          <h3 className="fw-bold mb-3">¡Registro Exitoso!</h3>
          <p className="text-muted mb-4">
            Tu cuenta ha sido creada correctamente. ¡Bienvenido/a a la comunidad Donatón!
          </p>
          <Button variant="primary" className="w-100 py-2 fw-bold" onClick={handleModalClose}>
            Ir a Mi Panel
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Registro;
