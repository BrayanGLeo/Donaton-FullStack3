const fs = require('fs');

const maxLengths = {
  'email': 100,
  'password': 50,
  'confirmPassword': 50,
  'telefono': 15,
  'rut': 12,
  'nombre': 50,
  'apellido': 50,
  'direccion': 100,
  'direccionNumero': 10,
  'razonSocial': 100,
  'giro': 100,
  'nombreContacto': 50,
  'sitioWeb': 100,
  'direccionRetiroCalle': 100,
  'direccionRetiroNumero': 10,
  'cantidad': 6,
  'pesoAproximado': 5
};

const files = [
  'src/components/registro/RegistroNatural.tsx',
  'src/components/registro/RegistroJuridica.tsx',
  'src/components/donacion/DonacionStep1.tsx',
  'src/components/donacion/DonacionStep2.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  for (const [key, max] of Object.entries(maxLengths)) {
    // We look for {...register('key')} and inject maxLength={max} right after it
    // Handle both single line and multiline tags
    const regex = new RegExp(`(\\{\\.\\.\\.register\\('${key}'\\)\\})`, 'g');
    content = content.replace(regex, `$1 maxLength={${max}}`);
  }
  
  fs.writeFileSync(file, content, 'utf8');
});
console.log('Done!');
