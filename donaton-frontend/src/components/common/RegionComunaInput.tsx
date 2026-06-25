import type { ChangeEvent } from 'react';
import { components } from 'react-select';
import type { InputProps } from 'react-select';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RegionComunaInput = (props: InputProps<any, false>) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    
    // Solo permitir letras (con acentos y ñ), espacios, apóstrofes y paréntesis.
    val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ'() ]/g, '');
    
    // El espacio y caracteres especiales (' y () ) solo después del primer caracter.
    if (val.length > 0 && !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(val)) {
      val = val.substring(1);
    }
    
    // No permitir doble espacio o doble caracter especial repetido innecesariamente (ej. "  ")
    val = val.replace(/\s{2,}/g, ' ');
    
    e.target.value = val;
    
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return <components.Input {...props} maxLength={50} onChange={handleChange} />;
};
