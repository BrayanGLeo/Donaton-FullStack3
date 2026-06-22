import type { SyntheticEvent, KeyboardEvent } from 'react';

export const validarNombres = (nombre: string): boolean => {
  if (!nombre || nombre.trim().length === 0) return false;
  if (!/^[\p{L}\s\-']+$/u.test(nombre)) return false;
  const palabras = nombre.trim().split(/\s+/);
  return palabras.length >= 1;
};

export const validarPassword = (password: string): boolean => {
  if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;':",./<>?]+$/.test(password)) return false;
  
  const letters = password.match(/[a-zA-Z]/g);
  const numbers = password.match(/\d/g);
  
  if (!letters || letters.length < 3) return false;
  if (!numbers || numbers.length < 3) return false;
  
  return true;
};

export const validarEmailDominio = (email: string): boolean => {
  const allowedDomains = [
    // Correos generales
    'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'live.com',
    'protonmail.com', 'mail.com', 'aol.com', 'zoho.com', 'gmx.com', 'yandex.com', 'msn.com',
    
    // Universidades e Institutos de Chile
    'educacion.cl', 'uchile.cl', 'uc.cl', 'usach.cl', 'usm.cl', 'udec.cl', 'utalca.cl',
    'duocuc.cl', 'profesor.duoc.cl', 'alumnos.duoc.cl', 'inacap.cl', 'inacapmail.cl',
    'aiep.cl', 'correo.aiep.cl', 'unab.cl', 'uandresbello.edu', 'pucv.cl', 'udp.cl',
    'uai.cl', 'uss.cl', 'correo.uss.cl', 'santotomas.cl', 'alumnos.santotomas.cl',
    'utem.cl', 'ubo.cl', 'umayor.cl', 'uft.cl', 'udla.cl', 'uv.cl', 'ubiobio.cl',
    
    // Empresas, Bancos y Telecomunicaciones
    'bancoestado.cl', 'bancochile.cl', 'bci.cl', 'santander.cl', 'itau.cl', 'scotiabank.cl',
    'codelco.cl', 'latam.com', 'falabella.com', 'cencosud.cl', 'entel.cl', 'movistar.cl', 'claro.cl', 'wom.cl',
    
    // Gobierno
    'gob.cl', 'mineduc.cl', 'minsal.cl', 'sii.cl'
  ];
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) return false;
  if (allowedDomains.includes(domain)) return true;
  
  return allowedDomains.some(d => domain.endsWith('.' + d));
};

export const validarTelefono = (telefono: string): boolean => {
  const num = telefono.replace(/\D/g, '');
  return num.length >= 8 && num.length <= 14;
};

export const validarRutChileno = (rutCompleto: string): boolean => {
  if (!rutCompleto) return false;
  
  const rutLimpio = rutCompleto.replaceAll('.', '').trim();
  
  if (!/^\d+-[\dkK]$/.test(rutLimpio)) return false;

  const tmp = rutLimpio.split('-');
  const digv = tmp[1].toLowerCase(); 
  const rut = tmp[0];
  
  return calcularDigitoVerificador(rut) === digv;
};

export const validarNumeroCasa = (numero: string): boolean => {
  const numLimpio = numero.trim();
  return numLimpio.length >= 1 && numLimpio.length <= 6;
};

const calcularDigitoVerificador = (rut: string): string => {
  let T = Number.parseInt(rut, 10);
  let M = 0;
  let S = 1;
  for (; T; T = Math.floor(T / 10)) {
    S = (S + (T % 10) * (9 - M++ % 6)) % 11;
  }
  return S ? (S - 1).toString() : 'k';
};

const maintainCursor = (
  target: HTMLInputElement | HTMLTextAreaElement,
  newVal: string,
  removedCountBeforeCursor: number
) => {
  if (target.value === newVal) return;
  
  const start = target.selectionStart;
  const end = target.selectionEnd;
  
  target.value = newVal;
  
  if (start !== null) {
    const newStart = Math.max(0, start - removedCountBeforeCursor);
    const newEnd = end === null ? newStart : Math.max(0, end - removedCountBeforeCursor);
    target.setSelectionRange(newStart, newEnd);
  }
};

const formatRutText = (cleanRut: string): string => {
  if (cleanRut.length <= 1) return cleanRut;
  const dv = cleanRut.slice(-1);
  const rutBody = cleanRut.slice(0, -1);
  
  let formattedBody = '';
  for (let i = rutBody.length - 1, j = 1; i >= 0; i--, j++) {
    formattedBody = rutBody.charAt(i) + formattedBody;
    if (j % 3 === 0 && i !== 0) {
      formattedBody = '.' + formattedBody;
    }
  }
  return `${formattedBody}-${dv}`;
};

export const formatRutInput = (e: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const target = e.currentTarget;
  const oldVal = target.value;
  
  const cleanRut = oldVal.replace(/[^0-9kK]/g, '');
  const val = cleanRut.length > 0 ? formatRutText(cleanRut) : '';
  
  if (oldVal !== val) {
    const start = target.selectionStart || 0;
    const rawBeforeCursor = oldVal.substring(0, start).replace(/[^0-9kK]/g, '').length;
    
    target.value = val;
    
    let newCursorPos = 0;
    let rawCount = 0;
    for (const char of val) {
      if (/[0-9kK]/.test(char)) rawCount++;
      newCursorPos++;
      if (rawCount === rawBeforeCursor) break;
    }
    
    target.setSelectionRange(newCursorPos, newCursorPos);
  }
};

export const formatPhoneInput = (e: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const target = e.currentTarget;
  const oldVal = target.value;
  const cleanVal = oldVal.replace(/\D/g, '');
  let newVal = '';
  
  if (cleanVal.length > 0) {
    if (cleanVal.length <= 1) {
      newVal = cleanVal;
    } else if (cleanVal.length <= 5) {
      newVal = cleanVal.slice(0, 1) + ' ' + cleanVal.slice(1);
    } else {
      newVal = cleanVal.slice(0, 1) + ' ' + cleanVal.slice(1, 5) + ' ' + cleanVal.slice(5, 9);
    }
  }
  
  if (oldVal !== newVal) {
    const start = target.selectionStart || 0;
    const rawBeforeCursor = oldVal.substring(0, start).replace(/\D/g, '').length;
    
    target.value = newVal;
    
    let newCursorPos = 0;
    let rawCount = 0;
    for (const char of newVal) {
      if (/\d/.test(char)) rawCount++;
      newCursorPos++;
      if (rawCount === rawBeforeCursor) break;
    }
    
    target.setSelectionRange(newCursorPos, newCursorPos);
  }
};

export const formatNameInput = (e: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const target = e.currentTarget;
  const oldVal = target.value;
  let newVal = oldVal.replace(/[^\p{L}\s\-']/gu, '');
  newVal = newVal.replace(/(^|[\s\-'])(\p{L})/gu, (_match, sep, letter) => sep + letter.toUpperCase());
  
  if (oldVal !== newVal) {
    const start = target.selectionStart || 0;
    const removedBeforeCursor = (oldVal.substring(0, start).match(/[^\p{L}\s\-']/gu) || []).length;
    maintainCursor(target, newVal, removedBeforeCursor);
  }
};

export const getPasswordStrength = (pwd: string) => {
  const pwdLetras = (pwd.match(/[a-zA-Z]/g) || []).length;
  const pwdNumeros = (pwd.match(/\d/g) || []).length;
  const pwdSpecial = (pwd.match(/[^a-zA-Z0-9\s]/g) || []).length;

  let strengthScore = 0;
  if (pwd.length >= 6) strengthScore += 1;
  if (pwdLetras >= 3) strengthScore += 1;
  if (pwdNumeros >= 3) strengthScore += 1;
  if (pwd.length >= 8 && pwdSpecial >= 1) strengthScore += 1;

  let strengthColor = 'bg-secondary';
  let strengthLabel = '';
  let strengthWidth = '0%';

  if (pwd.length > 0) {
    if (strengthScore <= 1) { strengthColor = 'bg-danger'; strengthWidth = '25%'; strengthLabel = 'Débil'; }
    else if (strengthScore === 2) { strengthColor = 'bg-warning'; strengthWidth = '50%'; strengthLabel = 'Media'; }
    else if (strengthScore === 3) { strengthColor = 'bg-info'; strengthWidth = '75%'; strengthLabel = 'Buena'; }
    else if (strengthScore === 4) { strengthColor = 'bg-success'; strengthWidth = '100%'; strengthLabel = 'Fuerte'; }
  }

  return { pwdLetras, pwdNumeros, strengthColor, strengthLabel, strengthWidth };
};

export const formatNoSpaceInput = (e: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const target = e.currentTarget;
  const oldVal = target.value;
  const newVal = oldVal.replace(/\s/g, '');
  
  if (oldVal !== newVal) {
    const start = target.selectionStart || 0;
    const removedBeforeCursor = (oldVal.substring(0, start).match(/\s/g) || []).length;
    maintainCursor(target, newVal, removedBeforeCursor);
  }
};

export const preventSpaceKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  if (e.key === ' ') e.preventDefault();
};

export const preventRutKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
  if (!/[0-9kK.-]/.test(e.key)) e.preventDefault();
};

export const preventPhoneKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  if (e.key.length > 1 || e.ctrlKey || e.metaKey || e.altKey) return;
  if (!/\d/.test(e.key)) e.preventDefault();
};
