import React, { useState } from 'react';
import { Card, Button, Container, Row, Col, Alert, Modal, Spinner, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { registrarDonacion } from '../services/donacionService';
import { useAuth } from '../context/AuthContext';
import { Package } from 'lucide-react';

import { donacionGlobalSchema, type DonacionGlobalValues } from './donacion/DonacionSchemas';
import { DonacionStep1 } from './donacion/DonacionStep1';
import { DonacionStep2 } from './donacion/DonacionStep2';
import { Stepper } from './donacion/Stepper';

interface Props {
  onSuccess?: () => void;
}

export const DonacionForm: React.FC<Props> = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const methods = useForm<DonacionGlobalValues>({
    resolver: zodResolver(donacionGlobalSchema),
    mode: 'onBlur',
    defaultValues: {
      cantidad: 1,
      modalidadEntrega: '',
    }
  });

  const { handleSubmit, trigger, formState: { isSubmitting } } = methods;

  const nextStep = async () => {
    // Validate only step 1 fields before proceeding
    const isStepValid = await trigger([
      'categoria', 'estadoArticulo', 'unidadMedida', 'cantidad', 
      'pesoAproximado', 'descripcion', 'fechaVencimiento', 'fotoBase64'
    ]);
    if (isStepValid) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: DonacionGlobalValues) => {
    if (!usuario?.id) {
      setError('Debes iniciar sesión para registrar una donación.');
      return;
    }

    try {
      setError('');
      
      const payload: any = { 
        ...data, 
        donanteId: Number(usuario.id),
        recurso: data.subCategoria,
      };

      if (data.modalidadEntrega === 'Retiro' && data.direccionRetiroCalle && data.direccionRetiroNumero) {
        payload.direccionRetiro = `${data.direccionRetiroCalle} #${data.direccionRetiroNumero}`.trim();
      }

      await registrarDonacion(payload);
      setShowSuccessModal(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al procesar la donación. Inténtalo nuevamente.');
      window.scrollTo(0, 0);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate('/mis-donaciones');
  };

  return (
    <div className="py-4">
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm border-0 rounded-4">
              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-5">
                  <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <Package size={32} />
                  </div>
                  <h3 className="fw-bold text-dark">Registrar Nueva Donación</h3>
                  <p className="text-muted">Completa los datos para aportar al centro de acopio</p>
                </div>

                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

                <Stepper currentStep={step} steps={['Detalles', 'Logística']} />

                <FormProvider {...methods}>
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: step === 1 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: step === 1 ? 20 : -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {step === 1 && <DonacionStep1 />}
                        {step === 2 && <DonacionStep2 />}
                      </motion.div>
                    </AnimatePresence>

                    <div className="d-flex justify-content-between mt-5 pt-3 border-top">
                      {step === 2 ? (
                        <Button variant="outline-secondary" onClick={prevStep} disabled={isSubmitting} className="px-4">
                          ← Volver
                        </Button>
                      ) : <div></div>}

                      {step === 1 ? (
                        <Button variant="primary" onClick={nextStep} className="fw-bold px-4">
                          Siguiente →
                        </Button>
                      ) : (
                        <Button variant="success" type="submit" disabled={isSubmitting} className="fw-bold px-4">
                          {isSubmitting ? <><Spinner size="sm" className="me-2"/> Enviando...</> : 'Confirmar Donación ✓'}
                        </Button>
                      )}
                    </div>
                  </Form>
                </FormProvider>

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={showSuccessModal} onHide={handleModalClose} backdrop="static" keyboard={false} centered>
        <Modal.Body className="text-center p-5">
          <div className="mb-4 text-success" style={{ fontSize: '64px' }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h3 className="fw-bold mb-3">¡Donación Registrada!</h3>
          <p className="text-muted mb-4">
            Tu intención de donación ha sido registrada exitosamente. Puedes hacer seguimiento en la sección "Mis Donaciones".
          </p>
          <Button variant="primary" className="w-100 py-2 fw-bold" onClick={handleModalClose}>
            Ir a Mis Donaciones
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

