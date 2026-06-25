import React from 'react';
import { Form, Button, Row, Col, InputGroup, Spinner, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Info, X, AlertTriangle, Eye, EyeOff, UploadCloud } from 'lucide-react';
import { useBlockNavigation } from '../../hooks/useBlockNavigation';
import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../../utils/chileData';
import { COUNTRY_CODES } from '../../utils/countryCodes';
import { formatRutInput, formatPhoneInput, formatNoSpaceInput, formatNameInput, getPasswordStrength, preventSpaceKeyDown, preventRutKeyDown, preventPhoneKeyDown, validarRutChileno, validarEmailDominio } from '../../utils/validators';
import { registroJuridicaSchema, type RegistroJuridicaValues } from './RegistroSchemas';

interface Props {
  onSubmit: (data: RegistroJuridicaValues) => void;
  isLoading: boolean;
  onCancel: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calculateIsDirty = (values: any) => Object.entries(values).some(([key, val]) => {
  if (key === 'codigoPais') return val !== '+56';
  if (typeof val === 'boolean') return val === true;
  return val !== '' && val !== undefined && val !== null;
});

import { RegionComunaInput } from '../common/RegionComunaInput';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isFieldInvalid = (field: string, getValues: any, errors: any, isSubmitted: boolean) => {
  const val = getValues(field);
  const hasValue = typeof val === 'string' ? val.trim().length > 0 : !!val;
  return !!errors[field] && (hasValue || isSubmitted);
};

export const RegistroJuridica: React.FC<Props> = ({ onSubmit, isLoading, onCancel }) => {
  const { register, handleSubmit, watch, getValues, control, setValue, formState: { errors, isSubmitted } } = useForm<RegistroJuridicaValues>({
    resolver: zodResolver(registroJuridicaSchema),
    defaultValues: { codigoPais: '+56' },
    mode: 'onBlur'
  });

  const values = watch();
  const isDirty = calculateIsDirty(values);

  const { showExitModal, handleConfirmExit, handleCancelExit } = useBlockNavigation(isDirty, isSubmitted, onCancel);

  const selectedRegion = watch('region');
  
  const pwd = watch('password') || '';
  const { strengthColor, strengthLabel, strengthWidth } = getPasswordStrength(pwd);
  const confirmPwd = watch('confirmPassword') || '';
  const passwordsMatch = pwd !== '' && pwd === confirmPwd;

  const emailValue = watch('email') || '';
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue) && validarEmailDominio(emailValue);
  const rutValue = watch('rut') || '';
  const rutValid = validarRutChileno(rutValue);

  const checkInvalid = (field: keyof RegistroJuridicaValues) => isFieldInvalid(field, getValues, errors, isSubmitted);
  const showRutSuccess = rutValid && !errors.rut;
  const showEmailSuccess = emailValid && !errors.email;

  return (
    <>
    <Form onSubmit={handleSubmit(onSubmit)}>
      <h5 className="mb-3 fw-bold text-primary border-bottom pb-2">Datos de la Organización</h5>
      
      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label className="d-flex align-items-center gap-1 mb-2">
              Razón Social <span className="text-danger">*</span>
              <OverlayTrigger placement="right" overlay={<Tooltip>El nombre legal exacto de su organización, fundación o empresa. Ej: "Fundación de Ayuda Social XYZ".</Tooltip>}>
                <Info size={14} className="text-muted ms-1" style={{ cursor: 'pointer' }} />
              </OverlayTrigger>
            </Form.Label>
            <Form.Control type="text" {...register('razonSocial')} maxLength={100} isInvalid={checkInvalid('razonSocial')} disabled={isLoading} autoFocus />
            <Form.Control.Feedback type="invalid">{errors.razonSocial?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>RUT Institucional <span className="text-danger">*</span></Form.Label>
            <InputGroup hasValidation>
              <Form.Control type="text" placeholder="12.345.678-9" {...register('rut')} maxLength={12} isInvalid={checkInvalid('rut')} disabled={isLoading} onInput={formatRutInput} onKeyDown={preventRutKeyDown} className={showRutSuccess ? 'border-end-0' : ''} />
              {showRutSuccess && (
                <InputGroup.Text className="bg-white text-success border-start-0">
                  <CheckCircle2 size={18} />
                </InputGroup.Text>
              )}
              <Form.Control.Feedback type="invalid">{errors.rut?.message}</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="d-flex align-items-center gap-1 mb-2">
              Giro Comercial <span className="text-danger">*</span>
              <OverlayTrigger placement="right" overlay={<Tooltip>La actividad económica principal registrada ante el SII. Ej: "Asistencia social", "Comercio al por menor".</Tooltip>}>
                <Info size={14} className="text-muted ms-1" style={{ cursor: 'pointer' }} />
              </OverlayTrigger>
            </Form.Label>
            <Form.Control type="text" {...register('giro')} maxLength={100} isInvalid={checkInvalid('giro')} disabled={isLoading} />
            <Form.Control.Feedback type="invalid">{errors.giro?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Sitio Web <span className="text-muted">(Opcional)</span></Form.Label>
            <Form.Control type="text" placeholder="https://..." {...register('sitioWeb')} maxLength={100} isInvalid={checkInvalid('sitioWeb')} disabled={isLoading} />
            <Form.Control.Feedback type="invalid">{errors.sitioWeb?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Teléfono Institucional <span className="text-danger">*</span></Form.Label>
            <InputGroup>
              <Form.Select {...register('codigoPais')} disabled={isLoading} style={{ maxWidth: '120px' }}>
                {COUNTRY_CODES.map((country) => (
                  <option key={country.name} value={country.code}>{country.code}</option>
                ))}
              </Form.Select>
              <Form.Control type="text" placeholder="912345678" {...register('telefono')} maxLength={15} isInvalid={checkInvalid('telefono')} disabled={isLoading} onInput={formatPhoneInput} onKeyDown={preventPhoneKeyDown} />
              <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Representante / Contacto <span className="text-danger">*</span></Form.Label>
            <Form.Control type="text" {...register('nombreContacto')} maxLength={50} isInvalid={checkInvalid('nombreContacto')} disabled={isLoading} onInput={formatNameInput} />
            <Form.Control.Feedback type="invalid">{errors.nombreContacto?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mb-3 mt-4 fw-bold text-primary border-bottom pb-2">Ubicación (Casa Matriz)</h5>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Región <span className="text-danger">*</span></Form.Label>
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={REGIONES_CHILE.map(r => ({ value: r, label: r }))}
                  placeholder="Seleccione una región..."
                  isDisabled={isLoading}
                  components={{ Input: RegionComunaInput }}
                  value={field.value ? { value: field.value, label: field.value } : null}
                  onChange={(option) => field.onChange(option?.value || '')}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: errors.region ? '#dc3545' : base.borderColor,
                      '&:hover': {
                        borderColor: errors.region ? '#dc3545' : base.borderColor
                      }
                    })
                  }}
                />
              )}
            />
            {errors.region && <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>{errors.region.message}</div>}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Comuna <span className="text-danger">*</span></Form.Label>
            <Controller
              name="comuna"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={selectedRegion ? COMUNAS_POR_REGION[selectedRegion]?.map(c => ({ value: c, label: c })) : []}
                  placeholder="Seleccione una comuna..."
                  isDisabled={isLoading || !selectedRegion}
                  components={{ Input: RegionComunaInput }}
                  value={field.value ? { value: field.value, label: field.value } : null}
                  onChange={(option) => field.onChange(option?.value || '')}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: errors.comuna ? '#dc3545' : base.borderColor,
                      '&:hover': {
                        borderColor: errors.comuna ? '#dc3545' : base.borderColor
                      }
                    })
                  }}
                  noOptionsMessage={() => selectedRegion ? "No hay comunas" : "Seleccione una región primero"}
                />
              )}
            />
            {errors.comuna && <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>{errors.comuna.message}</div>}
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Calle / Pasaje <span className="text-danger">*</span></Form.Label>
            <Form.Control type="text" {...register('direccion')} maxLength={100} isInvalid={checkInvalid('direccion')} disabled={isLoading} />
            <Form.Control.Feedback type="invalid">{errors.direccion?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Número <span className="text-danger">*</span></Form.Label>
            <Form.Control type="text" {...register('direccionNumero')} maxLength={10} isInvalid={checkInvalid('direccionNumero')} disabled={isLoading} />
            <Form.Control.Feedback type="invalid">{errors.direccionNumero?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group className="mb-3">
            <Form.Label>Depto/Oficina</Form.Label>
            <Form.Control type="text" {...register('departamento')} maxLength={20} isInvalid={checkInvalid('departamento')} disabled={isLoading} placeholder="Opcional" />
            <Form.Control.Feedback type="invalid">{errors.departamento?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <h5 className="mb-3 mt-4 fw-bold text-primary border-bottom pb-2">Credenciales Institucionales</h5>
      
      <Form.Group className="mb-3" controlId="rjEmail">
        <Form.Label>Correo Electrónico <span className="text-danger">*</span></Form.Label>
        <InputGroup hasValidation className="position-relative">
          <Form.Control type="email" {...register('email')} maxLength={100} isInvalid={checkInvalid('email')} disabled={isLoading} onInput={formatNoSpaceInput} onKeyDown={preventSpaceKeyDown} className={showEmailSuccess ? 'border-end-0' : ''} />
          {watch('email') && watch('email').length > 0 && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setValue('email', '', { shouldValidate: true });
                document.getElementById('rjEmail')?.focus();
              }}
              className="position-absolute border-0 bg-transparent text-muted"
              style={{ right: showEmailSuccess ? '45px' : '30px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={18} />
            </button>
          )}
          {showEmailSuccess && (
            <InputGroup.Text className="bg-white text-success border-start-0" style={{ zIndex: 5 }}>
              <CheckCircle2 size={18} />
            </InputGroup.Text>
          )}
          <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
        </InputGroup>
      </Form.Group>
      <PasswordSection 
        register={register} 
        checkInvalid={checkInvalid} 
        isLoading={isLoading} 
        errors={errors} 
        pwd={pwd} 
        confirmPwd={confirmPwd} 
        passwordsMatch={passwordsMatch} 
        strengthColor={strengthColor} 
        strengthWidth={strengthWidth} 
        strengthLabel={strengthLabel} 
      />

      <h5 className="mb-3 mt-4 fw-bold text-primary border-bottom pb-2">Verificación de la Empresa</h5>
      <FileDropzone />

      <div className="d-flex justify-content-between mt-5 pt-3 border-top">
        <Button variant="outline-secondary" onClick={onCancel} disabled={isLoading}>
          Volver a Selección
        </Button>
        <Button variant="primary" type="submit" disabled={isLoading} className="fw-bold px-4">
          {isLoading ? <><Spinner size="sm" className="me-2"/> Registrando...</> : 'Completar Registro'}
        </Button>
      </div>
    </Form>

    <Modal show={showExitModal} onHide={handleCancelExit} centered backdrop="static" className="border-0">
      <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
      <Modal.Body className="text-center pt-0 px-5 pb-5">
        <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
          <AlertTriangle size={40} />
        </div>
        <h3 className="fw-bold mb-3">¿Descartar cambios?</h3>
        <p className="text-muted mb-4 fs-5">
          Tienes datos sin guardar en el formulario. Si sales ahora, perderás todo tu progreso.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Button variant="light" className="px-4 py-2 fw-bold text-secondary border" onClick={handleCancelExit}>
            Quedarme
          </Button>
          <Button variant="danger" className="px-4 py-2 fw-bold shadow-sm" onClick={handleConfirmExit}>
            Sí, salir y perder datos
          </Button>
        </div>
      </Modal.Body>
    </Modal>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PasswordSection = ({ register, checkInvalid, isLoading, errors, pwd, confirmPwd, passwordsMatch, strengthColor, strengthWidth, strengthLabel }: any) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  return (
    <Row>
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Contraseña <span className="text-danger">*</span></Form.Label>
          <InputGroup hasValidation>
            <Form.Control type={showPassword ? "text" : "password"} {...register('password')} maxLength={50} isInvalid={checkInvalid('password')} disabled={isLoading} onInput={formatNoSpaceInput} onKeyDown={preventSpaceKeyDown} />
            <Button variant="outline-secondary" className="bg-white" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} className="text-muted"/> : <Eye size={18} className="text-muted"/>}
            </Button>
            <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
          </InputGroup>
          {pwd.length > 0 && (
            <div className="mt-2">
              <div className="progress" style={{ height: '5px' }}>
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
        <Form.Group className="mb-3">
          <Form.Label>Confirmar Contraseña <span className="text-danger">*</span></Form.Label>
          <InputGroup hasValidation>
            <Form.Control type={showConfirmPassword ? "text" : "password"} {...register('confirmPassword')} maxLength={50} isInvalid={checkInvalid('confirmPassword')} disabled={isLoading} onInput={formatNoSpaceInput} onKeyDown={preventSpaceKeyDown} />
            <Button variant="outline-secondary" className="bg-white" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={18} className="text-muted"/> : <Eye size={18} className="text-muted"/>}
            </Button>
            <Form.Control.Feedback type="invalid">{errors.confirmPassword?.message}</Form.Control.Feedback>
          </InputGroup>
          {confirmPwd.length > 0 && passwordsMatch && (
            <div className="mt-2 text-success" style={{ fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} className="me-1 mb-1" />
              Las contraseñas coinciden
            </div>
          )}
        </Form.Group>
      </Col>
    </Row>
  );
};

const FileDropzone = () => {
  const [dragActive, setDragActive] = React.useState(false);
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);
  return (
    <Form.Group className="mb-4">
      <Form.Label className="d-flex align-items-center gap-1 mb-2">
        Certificado de Vigencia o Rol <span className="text-muted">(Opcional)</span>
        <OverlayTrigger placement="right" overlay={<Tooltip>Sube un documento oficial que acredite la existencia de la organización.</Tooltip>}>
          <Info size={14} className="text-muted ms-1" style={{ cursor: 'pointer' }} />
        </OverlayTrigger>
      </Form.Label>
      <button 
        type="button"
        className={`w-100 p-4 text-center border rounded ${dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary border-dashed bg-light'}`}
        style={{ borderStyle: 'dashed', cursor: 'pointer', transition: 'all 0.3s ease' }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setUploadedFileName(e.dataTransfer.files[0].name);
          }
        }}
        onClick={() => document.getElementById('fileUpload')?.click()}
      >
        <input type="file" id="fileUpload" className="d-none" onChange={(e) => e.target.files && setUploadedFileName(e.target.files[0].name)} accept=".pdf,.jpg,.jpeg,.png" />
        <UploadCloud size={32} className={dragActive ? 'text-primary mb-2' : 'text-muted mb-2'} />
        {uploadedFileName ? (
          <span className="d-block mb-0 text-success fw-bold">{uploadedFileName}</span>
        ) : (
          <>
            <span className="d-block mb-0 text-muted">Arrastra tu documento aquí o <b>haz clic para buscar</b></span>
            <small className="d-block text-black-50 mt-1">Solo PDF, JPG o PNG (Max. 5MB)</small>
          </>
        )}
      </button>
    </Form.Group>
  );
};



