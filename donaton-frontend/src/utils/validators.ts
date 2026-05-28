export const validarNombreCompleto = (nombre: string): boolean => {
  if (!nombre || nombre.trim().length === 0) return false;
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) return false;
  const palabras = nombre.trim().split(/\s+/);
  return palabras.length >= 4;
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
  const allowedDomains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'live.com'];
  const domain = email.split('@')[1];
  return domain ? allowedDomains.includes(domain.toLowerCase()) : false;
};

export const validarTelefono = (telefono: string): boolean => {
  const num = telefono.replace(/\D/g, '');
  return num.length >= 9 && num.length <= 12;
};

export const validarRutChileno = (rutCompleto: string): boolean => {
  if (!rutCompleto) return false;
  
  const rutLimpio = rutCompleto.replaceAll('.', '').trim();
  
  if (!/^\d+-[\dkK]$/.test(rutLimpio)) return false;

  const tmp = rutLimpio.split('-');
  let digv = tmp[1].toLowerCase(); 
  const rut = tmp[0];
  
  return calcularDigitoVerificador(rut) === digv;
};

export const validarNumeroCasa = (numero: string): boolean => {
  return /^\d{2,}$/.test(numero.trim());
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
