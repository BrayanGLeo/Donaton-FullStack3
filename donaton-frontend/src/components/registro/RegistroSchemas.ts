import { z } from 'zod';
import { validarRutChileno, validarNombres, validarTelefono, validarPassword, validarEmailDominio, validarNumeroCasa } from '../../utils/validators';
import { verificarEmailDisponible, verificarRutDisponible } from '../../services/usuarioService';

const baseRegistroProps = {
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Debe ser un correo electrónico válido').max(100, 'Máximo 100 caracteres').refine(validarEmailDominio, 'Dominio de correo no permitido').refine(async (val) => await verificarEmailDisponible(val), 'Este correo ya se encuentra registrado'),
  password: z.string().max(50, 'Máximo 50 caracteres').refine(validarPassword, 'La contraseña debe tener al menos 3 letras, 3 números y permite caracteres especiales'),
  confirmPassword: z.string().max(50, 'Máximo 50 caracteres'),
  codigoPais: z.string().min(1).max(5, 'Máximo 5 caracteres'),
  telefono: z.string().max(15, 'Máximo 15 caracteres').regex(/^[\d\s]+$/, 'Solo se permiten números y espacios').refine(validarTelefono, 'Número de teléfono inválido'),
  rut: z.string().max(12, 'Máximo 12 caracteres').regex(/^[0-9kK.-]+$/, 'Solo se permiten números, guión, puntos y la letra K').refine(validarRutChileno, 'RUT inválido. Debe tener el formato XX.XXX.XXX-X').refine(async (val) => await verificarRutDisponible(val), 'Este RUT ya se encuentra registrado'),
  region: z.string().min(1, 'Selecciona una región').max(50, 'Máximo 50 caracteres'),
  comuna: z.string().min(1, 'Selecciona una comuna').max(50, 'Máximo 50 caracteres'),
  direccion: z.string().min(5, 'La dirección es muy corta').max(100, 'Máximo 100 caracteres'),
  direccionNumero: z.string().max(10, 'Máximo 10 caracteres').refine(validarNumeroCasa, 'Número de casa inválido'),
  departamento: z.string().max(20, 'Máximo 20 caracteres').optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional()
};

const baseRegistroObject = z.object(baseRegistroProps);

const noStartSpaceRefinement = (data: any, ctx: z.RefinementCtx) => {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.startsWith(' ')) {
      ctx.addIssue({ code: "custom", message: "No puede empezar con un espacio", path: [key] });
    }
  }
};

export const registroNaturalSchema = baseRegistroObject.extend({
  nombre: z.string().max(50, 'Máximo 50 caracteres').refine(validarNombres, 'El nombre solo permite letras, espacios, guiones o apóstrofes'),
  apellido: z.string().max(50, 'Máximo 50 caracteres').refine(validarNombres, 'El apellido solo permite letras, espacios, guiones o apóstrofes')
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
}).superRefine(noStartSpaceRefinement);

export const registroJuridicaSchema = baseRegistroObject.extend({
  razonSocial: z.string().min(3, 'La razón social debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  giro: z.string().min(3, 'El giro debe tener al menos 3 caracteres').max(100, 'Máximo 100 caracteres'),
  nombreContacto: z.string().max(50, 'Máximo 50 caracteres').refine(validarNombres, 'El nombre de contacto solo permite letras, espacios, guiones o apóstrofes'),
  sitioWeb: z.url({ message: 'Debe ser una URL válida (ej: https://www.ejemplo.com)' }).max(100, 'Máximo 100 caracteres').optional().or(z.literal(''))
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
}).superRefine(noStartSpaceRefinement);

export type RegistroNaturalValues = z.infer<typeof registroNaturalSchema>;
export type RegistroJuridicaValues = z.infer<typeof registroJuridicaSchema>;

export const adminUserSchema = baseRegistroObject.omit({ password: true, confirmPassword: true, direccionNumero: true, departamento: true, email: true, rut: true }).extend({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Debe ser un correo electrónico válido').max(100, 'Máximo 100 caracteres').refine(validarEmailDominio, 'Dominio de correo no permitido').refine(async (val) => await verificarEmailDisponible(val), 'Este correo ya se encuentra registrado'),
  rut: z.string().max(12, 'Máximo 12 caracteres').regex(/^[0-9kK.-]+$/, 'Solo se permiten números, guión, puntos y la letra K').refine(validarRutChileno, 'RUT inválido. Debe tener el formato XX.XXX.XXX-X').refine(async (val) => await verificarRutDisponible(val), 'Este RUT ya se encuentra registrado'),
  rol: z.string().min(1, 'Selecciona un rol'),
  subRol: z.string().optional(),
  nombre: z.string().max(50, 'Máximo 50 caracteres').refine(validarNombres, 'Nombre inválido'),
  apellido: z.string().max(50, 'Máximo 50 caracteres').refine(validarNombres, 'Apellido inválido'),
  password: z.string().min(1, 'Contraseña provisional requerida'),
  tipoVehiculo: z.string().optional(),
  matricula: z.string().optional(),
  regionAcopio: z.string().optional(),
  centroAcopioId: z.string().optional()
}).superRefine(noStartSpaceRefinement).superRefine((data, ctx) => {
  if (data.rol === 'LOGISTICA' && !data.subRol) {
    ctx.addIssue({ code: "custom", message: 'Sub-rol requerido', path: ['subRol'] });
  }
  if (data.subRol === 'CONDUCTOR') {
    if (!data.tipoVehiculo) ctx.addIssue({ code: "custom", message: 'Requerido', path: ['tipoVehiculo'] });
    if (!data.matricula) ctx.addIssue({ code: "custom", message: 'Requerido', path: ['matricula'] });
  }
  if (data.subRol === 'RECEPCIONISTA') {
    if (!data.regionAcopio) ctx.addIssue({ code: "custom", message: 'Requerido', path: ['regionAcopio'] });
    if (!data.centroAcopioId) ctx.addIssue({ code: "custom", message: 'Requerido', path: ['centroAcopioId'] });
  }
});

export type AdminUserValues = z.infer<typeof adminUserSchema>;
