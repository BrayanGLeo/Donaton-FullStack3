import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, InputGroup, Dropdown, Spinner, ProgressBar } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Dices, X } from 'lucide-react';
import Select, { components } from 'react-select';

import { REGIONES_CHILE, COMUNAS_POR_REGION } from '../utils/chileData';
import { COUNTRY_CODES } from '../utils/countryCodes';
import { 
  formatRutInput, formatPhoneInput, formatNoSpaceInput, formatNameInput, 
  getPasswordStrength, preventSpaceKeyDown, preventRutKeyDown, preventPhoneKeyDown 
} from '../utils/validators';
import { 
  registrarUsuarioAdmin, obtenerCentrosAcopioPorRegion, type CentroAcopio 
} from '../services/usuarioService';
import { adminUserSchema, type AdminUserValues } from './registro/RegistroSchemas';

interface AdminUserFormProps {
  onUserCreated: () => void;
}

const CustomInput = (props: any) => (
  <components.Input {...props} maxLength={50} />
);

export const AdminUserForm: React.FC<AdminUserFormProps> = ({ onUserCreated }) => {
  const [centrosAcopio, setCentrosAcopio] = useState<CentroAcopio[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<AdminUserValues>({
    resolver: zodResolver(adminUserSchema),
    mode: 'onBlur',
    defaultValues: { codigoPais: '+56' }
  });

  const rol = watch('rol');
  const subRol = watch('subRol');
  const region = watch('region');
  const regionAcopio = watch('regionAcopio');
  const pwd = watch('password') || '';
  const codigoPais = watch('codigoPais');

  const { strengthColor, strengthLabel, strengthWidth } = getPasswordStrength(pwd);

  useEffect(() => {
    if (regionAcopio) {
      obtenerCentrosAcopioPorRegion(regionAcopio).then(setCentrosAcopio).catch(console.error);
    } else {
      setCentrosAcopio([]);
    }
  }, [regionAcopio]);

  useEffect(() => { setValue('subRol', undefined); }, [rol, setValue]);
  useEffect(() => { setValue('comuna', ''); }, [region, setValue]);
  useEffect(() => { setValue('centroAcopioId', ''); }, [regionAcopio, setValue]);

  const generatePassword = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let pass = '';
    for(let i=0; i<3; i++) pass += letters.charAt(Math.floor(Math.random() * letters.length));
    for(let i=0; i<3; i++) pass += numbers.charAt(Math.floor(Math.random() * numbers.length));
    const all = letters + numbers + specials;
    for(let i=0; i<4; i++) pass += all.charAt(Math.floor(Math.random() * all.length));
    pass = pass.split('').sort(() => 0.5 - Math.random()).join('');
    
    setValue('password', pass, { shouldValidate: true });
    navigator.clipboard.writeText(pass);
    toast.success('Contraseña generada y copiada al portapapeles 📋');
    
    // Show password temporarily
    setShowPassword(true);
    setTimeout(() => {
      setShowPassword(false);
    }, 3000);
  };

  const lightSelectStyles = (isInvalid: boolean) => ({
    control: (base: any) => ({
      ...base,
      borderColor: isInvalid ? '#dc3545' : base.borderColor,
      '&:hover': {
        borderColor: isInvalid ? '#dc3545' : base.borderColor
      }
    })
  });

  const onSubmit = async (data: AdminUserValues) => {
    setIsSubmitting(true);
    try {
      const requestData: any = {
        email: data.email,
        password: data.password,
        rol: data.rol,
        nombreCompleto: `${data.nombre.trim()} ${data.apellido.trim()}`,
        rut: data.rut,
        telefono: `${data.codigoPais}${data.telefono}`,
        region: data.region,
        comuna: data.comuna,
        direccion: data.direccion
      };

      if (data.rol === 'LOGISTICA') {
        requestData.subRol = data.subRol;
        if (data.subRol === 'CONDUCTOR') {
          requestData.tipoVehiculo = data.tipoVehiculo;
          requestData.matricula = data.matricula;
        } else if (data.subRol === 'RECEPCIONISTA') {
          requestData.centroAcopioId = Number(data.centroAcopioId);
        }
      }

      await registrarUsuarioAdmin(requestData);
      toast.success('Usuario operativo creado exitosamente.');
      onUserCreated();
      setValue('nombre', '');
      setValue('apellido', '');
      setValue('rut', '');
      setValue('email', '');
      setValue('password', '');
      setValue('telefono', '');
      setValue('matricula', '');
      
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear el usuario. Puede que el correo o RUT ya existan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3">
        <Form.Label className="text-white-50 small">Rol del Sistema</Form.Label>
        <Form.Select
          {...register('rol')}
          style={{ borderRadius: '10px', border: 'none' }}
          isInvalid={!!errors.rol}
        >
          <option value="">Selecciona un rol...</option>
          <option value="LOGISTICA">🚛 Logística</option>
          <option value="COORDINADOR">📋 Coordinador</option>
        </Form.Select>
        <Form.Control.Feedback type="invalid">{errors.rol?.message}</Form.Control.Feedback>
      </Form.Group>

      {rol && (
        <div style={{ maxHeight: '450px', overflowY: 'auto', overflowX: 'hidden', paddingRight: '10px' }} className="mb-3 custom-scrollbar">
          
          {rol === 'LOGISTICA' && (
            <Form.Group className="mb-3">
              <Form.Label className="text-white-50 small">Tipo de Personal</Form.Label>
              <Form.Select
                {...register('subRol')}
                style={{ borderRadius: '10px', border: 'none' }}
                isInvalid={!!errors.subRol}
              >
                <option value="">Selecciona una opción...</option>
                <option value="CONDUCTOR">🚗 Conductor</option>
                <option value="RECEPCIONISTA">🏢 Administrador Acopio</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.subRol?.message}</Form.Control.Feedback>
            </Form.Group>
          )}

          {(rol === 'COORDINADOR' || (rol === 'LOGISTICA' && subRol)) && (
            <>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label className="text-white-50 small mb-0">Nombres</Form.Label>
                    <Form.Control type="text" size="sm" {...register('nombre')} maxLength={50} placeholder="Ej: Juan" onInput={formatNameInput} isInvalid={!!errors.nombre} />
                    <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label className="text-white-50 small mb-0">Apellidos</Form.Label>
                    <Form.Control type="text" size="sm" {...register('apellido')} maxLength={50} placeholder="Ej: Pérez" onInput={formatNameInput} isInvalid={!!errors.apellido} />
                    <Form.Control.Feedback type="invalid">{errors.apellido?.message}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-2">
                <Form.Label className="text-white-50 small mb-0">RUT</Form.Label>
                <Form.Control type="text" size="sm" {...register('rut')} maxLength={12} placeholder="Ej: 12.345.678-9" onInput={formatRutInput} onKeyDown={preventRutKeyDown} isInvalid={!!errors.rut} />
                <Form.Control.Feedback type="invalid">{errors.rut?.message}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="text-white-50 small mb-0">Teléfono</Form.Label>
                <InputGroup size="sm">
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-light" id="dropdown-country" style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                      {COUNTRY_CODES.find(c => c.code === codigoPais)?.flag} {codigoPais}
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {COUNTRY_CODES.map((country) => (
                        <Dropdown.Item key={country.name} onClick={() => setValue('codigoPais', country.code)} title={country.name}>
                          {country.flag} {country.name} ({country.code})
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                  <Form.Control type="text" {...register('telefono')} maxLength={15} placeholder="Ej: 912345678" onInput={formatPhoneInput} onKeyDown={preventPhoneKeyDown} style={{ backgroundColor: '#fff', color: '#000' }} isInvalid={!!errors.telefono} />
                  <Form.Control.Feedback type="invalid">{errors.telefono?.message}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="text-white-50 small mb-0">Región de Residencia</Form.Label>
                <Controller
                  name="region"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={REGIONES_CHILE.map(r => ({ value: r, label: r }))}
                      placeholder="Seleccione..."
                      components={{ Input: CustomInput }}
                      value={field.value ? { value: field.value, label: field.value } : null}
                      onChange={(option) => field.onChange(option?.value || '')}
                      styles={lightSelectStyles(!!errors.region)}
                    />
                  )}
                />
                {errors.region && <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>{errors.region.message}</div>}
              </Form.Group>
              
              <Form.Group className="mb-2">
                <Form.Label className="text-white-50 small mb-0">Comuna de Residencia</Form.Label>
                <Controller
                  name="comuna"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={region ? COMUNAS_POR_REGION[region]?.map((c: string) => ({ value: c, label: c })) : []}
                      placeholder="Seleccione..."
                      isDisabled={!region}
                      components={{ Input: CustomInput }}
                      value={field.value ? { value: field.value, label: field.value } : null}
                      onChange={(option) => field.onChange(option?.value || '')}
                      styles={lightSelectStyles(!!errors.comuna)}
                      noOptionsMessage={() => region ? "No hay comunas" : "Seleccione región"}
                    />
                  )}
                />
                {errors.comuna && <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>{errors.comuna.message}</div>}
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="text-white-50 small mb-0">Dirección de Residencia</Form.Label>
                <Form.Control type="text" size="sm" {...register('direccion')} maxLength={100} placeholder="Ej: Alameda 123" isInvalid={!!errors.direccion} />
                <Form.Control.Feedback type="invalid">{errors.direccion?.message}</Form.Control.Feedback>
              </Form.Group>

              {/* Campos Específicos para Conductor */}
              {subRol === 'CONDUCTOR' && (
                <div className="p-3 my-3" style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
                  <h6 className="text-info fw-bold mb-3" style={{ fontSize: '0.85rem' }}><i className="bi bi-truck me-2"></i>Datos del Vehículo</h6>
                  <Form.Group className="mb-2">
                    <Form.Label className="text-white-50 small mb-0">Tipo de Vehículo</Form.Label>
                    <Form.Select size="sm" {...register('tipoVehiculo')} isInvalid={!!errors.tipoVehiculo}>
                      <option value="">Seleccione...</option>
                      <option value="auto">Auto</option>
                      <option value="camioneta">Camioneta</option>
                      <option value="camion">Camión</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">{errors.tipoVehiculo?.message}</Form.Control.Feedback>
                  </Form.Group>
                  <Form.Group className="mb-0">
                    <Form.Label className="text-white-50 small mb-0">Matrícula</Form.Label>
                    <Form.Control type="text" size="sm" {...register('matricula')} maxLength={8} placeholder="Ej: ABCD-12" isInvalid={!!errors.matricula} />
                    <Form.Control.Feedback type="invalid">{errors.matricula?.message}</Form.Control.Feedback>
                  </Form.Group>
                </div>
              )}

              {/* Campos Específicos para Recepcionista */}
              {subRol === 'RECEPCIONISTA' && (
                <div className="p-3 my-3" style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '10px' }}>
                  <h6 className="text-warning fw-bold mb-3" style={{ fontSize: '0.85rem' }}><i className="bi bi-building me-2"></i>Asignación de Centro de Acopio</h6>
                  <Form.Group className="mb-2">
                    <Form.Label className="text-white-50 small mb-0">Región del Acopio</Form.Label>
                    <Controller
                      name="regionAcopio"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={REGIONES_CHILE.map(r => ({ value: r, label: r }))}
                          placeholder="Seleccione..."
                          components={{ Input: CustomInput }}
                          value={field.value ? { value: field.value, label: field.value } : null}
                          onChange={(option) => field.onChange(option?.value || '')}
                          styles={lightSelectStyles(!!errors.regionAcopio)}
                        />
                      )}
                    />
                    {errors.regionAcopio && <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>{errors.regionAcopio.message}</div>}
                  </Form.Group>
                  <Form.Group className="mb-0">
                    <Form.Label className="text-white-50 small mb-0">Centro de Acopio</Form.Label>
                    <Controller
                      name="centroAcopioId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={centrosAcopio.map(c => ({ value: c.id.toString(), label: `${c.nombre} (${c.comuna})` }))}
                          placeholder="Seleccione..."
                          isDisabled={!regionAcopio}
                          components={{ Input: CustomInput }}
                          value={field.value ? { value: field.value, label: centrosAcopio.find(c => c.id.toString() === field.value)?.nombre + ' (' + centrosAcopio.find(c => c.id.toString() === field.value)?.comuna + ')' } : null}
                          onChange={(option) => field.onChange(option?.value || '')}
                          styles={lightSelectStyles(!!errors.centroAcopioId)}
                          noOptionsMessage={() => regionAcopio ? "No hay centros" : "Seleccione región"}
                        />
                      )}
                    />
                    {errors.centroAcopioId && <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>{errors.centroAcopioId.message}</div>}
                    {!regionAcopio && <Form.Text className="text-white-50" style={{ fontSize: '0.7rem' }}>Ingrese la región del acopio primero.</Form.Text>}
                  </Form.Group>
                </div>
              )}

              <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />

              <h6 className="text-success fw-bold mb-3 mt-3" style={{ fontSize: '0.85rem' }}><i className="bi bi-shield-lock me-2"></i>Credenciales de Acceso</h6>

              <Form.Group className="mb-2" controlId="adminEmail">
                <Form.Label className="text-white-50 small mb-0">Correo Electrónico</Form.Label>
                <div className="position-relative">
                  <Form.Control 
                    type="email" 
                    size="sm" 
                    {...register('email')} 
                    maxLength={100}
                    onInput={formatNoSpaceInput} 
                    onKeyDown={preventSpaceKeyDown} 
                    placeholder="usuario@ejemplo.com" 
                    isInvalid={!!errors.email} 
                    className="pe-5"
                  />
                  {watch('email') && watch('email').length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setValue('email', '', { shouldValidate: true });
                        document.getElementById('adminEmail')?.focus();
                      }}
                      className="position-absolute border-0 bg-transparent text-muted"
                      style={{ right: '5px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 10 }}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
                </div>
              </Form.Group>
              
              <Form.Group className="mb-1">
                <Form.Label className="text-white-50 small mb-0">Contraseña Provisional</Form.Label>
                <InputGroup size="sm" hasValidation>
                  <Form.Control type={showPassword ? "text" : "password"} {...register('password')} maxLength={50} onInput={formatNoSpaceInput} onKeyDown={preventSpaceKeyDown} placeholder="••••••••" isInvalid={!!errors.password} className="border-end-0" />
                  <Button variant="outline-light" onClick={() => setShowPassword(!showPassword)} style={{ borderColor: '#dee2e6' }} title="Ver contraseña">
                    {showPassword ? <EyeOff size={14} className="text-dark" /> : <Eye size={14} className="text-dark" />}
                  </Button>
                  <Button variant="success" onClick={generatePassword} className="border-start-0" title="Generar contraseña segura">
                    <Dices size={14} />
                  </Button>
                  <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              
              {pwd.length > 0 && (
                <div className="mb-3 px-1 mt-1">
                  <ProgressBar style={{ height: '4px' }} className="mb-1">
                    <ProgressBar variant={strengthColor} now={Number.parseInt(strengthWidth.replace('%', ''), 10)} />
                  </ProgressBar>
                  <div className="d-flex justify-content-between">
                    <small className={`text-${strengthColor} fw-bold`} style={{ fontSize: '0.65rem' }}>
                      {strengthLabel}
                    </small>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-100 fw-bold py-2 mt-2 d-flex align-items-center justify-content-center gap-2"
        disabled={isSubmitting || !rol || (rol === 'LOGISTICA' && !subRol)}
        style={{ borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', color: '#fff' }}
      >
        {isSubmitting ? <><Spinner size="sm" animation="border" /> Registrando...</> : 'Registrar Usuario'}
      </Button>
    </Form>
  );
};
