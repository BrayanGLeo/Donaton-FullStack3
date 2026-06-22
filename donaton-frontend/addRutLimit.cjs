const fs = require('node:fs');

const files = [
  'src/components/registro/RegistroNatural.tsx',
  'src/components/registro/RegistroJuridica.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const rutRegex = /(<Form\.Control[^>]*?\{\.\.\.register\('rut'\)\}[^>]*?)(\/?>)/g;
  
  content = content.replace(rutRegex, (match, p1, p2) => {
    if (p1.includes('onInput=')) return match;
    return `${p1} onInput={(e: any) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9kK-]/g, ''); }} ${p2}`;
  });
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Rut limit added!');
