export const SUBCATEGORIAS: Record<string, string[]> = {
  "Alimentos": [
    "Frutas",
    "Verduras",
    "Comida Preparada",
    "Leche de 1 Litro",
    "Leche Individual (200ml)",
    "Yogur Individual",
    "Yogur en Bolsa (1 Litro)",
    "Quesos",
    "Mantequilla/Margarina",
    "Fiambres y Embutidos",
    "Huevos",
    "Panadería",
    "Pastelería"
  ],
  "Alimentos imperecederos": [
    "Arroz",
    "Fideos",
    "Pastas",
    "Legumbres",
    "Aceite",
    "Salsa de Tomate",
    "Atún en Conserva",
    "Jurel en Conserva",
    "Leche en Polvo",
    "Leche (Caja larga vida)",
    "Harina",
    "Azúcar",
    "Sal",
    "Té",
    "Café",
    "Avena",
    "Cereales"
  ],
  "Ropa y Calzado": [
    "Poleras",
    "Camisas",
    "Pantalones",
    "Jeans",
    "Chaquetas",
    "Abrigos",
    "Ropa Interior (Nueva)",
    "Zapatos",
    "Zapatillas",
    "Ropa de Bebé"
  ],
  "Agua e Hidratación": [
    "Agua Embotellada (Bidón)",
    "Agua Embotellada (Individual)",
    "Bebidas Isotónicas",
    "Jugos en Caja"
  ],
  "Artículos de Higiene Personal": [
    "Jabón",
    "Gel de Ducha",
    "Shampoo",
    "Acondicionador",
    "Pasta Dental",
    "Cepillo Dental",
    "Papel Higiénico",
    "Toallas Higiénicas",
    "Pañales (Bebé)",
    "Pañales (Adulto)",
    "Desodorante"
  ],
  "Insumos Médicos": [
    "Mascarillas",
    "Guantes de Látex",
    "Guantes de Nitrilo",
    "Alcohol",
    "Alcohol Gel",
    "Gasas",
    "Vendas",
    "Paracetamol",
    "Ibuprofeno",
    "Suero",
    "Jeringas"
  ],
  "Materiales de Construcción": [
    "Madera",
    "Tablas",
    "Clavos",
    "Tornillos",
    "Cemento",
    "Zinc",
    "Calaminas",
    "Pintura",
    "Cables Eléctricos",
    "Ladrillos",
    "Arena",
    "Grava",
    "Yeso",
    "Tubos de PVC",
    "Fierro/Acero",
    "Planchas OSB",
    "Aislante Térmico"
  ],
  "Herramientas": [
    "Martillo",
    "Serrucho",
    "Palas",
    "Picos",
    "Taladro",
    "Destornilladores",
    "Alicates",
    "Huincha de Medir",
    "Llave Inglesa",
    "Carretilla",
    "Esmeril",
    "Sierra Circular",
    "Hacha",
    "Brochas",
    "Rodillos"
  ],
  "Muebles y Enseres": [
    "Camas",
    "Colchones",
    "Mesas",
    "Sillas",
    "Cocina",
    "Estufa",
    "Refrigerador",
    "Muebles de Guardado",
    "Sillones",
    "Estantes",
    "Escritorios",
    "Lavadora",
    "Microondas",
    "Televisor",
    "Sábanas y Frazadas"
  ],
  "Alimentos para Mascotas": [
    "Comida para Perros (Seca)",
    "Comida para Perros (Húmeda)",
    "Comida para Gatos (Seca)",
    "Comida para Gatos (Húmeda)",
    "Arena para Gatos"
  ],
  "Otro": []
};

const getAlimentosUnidades = (subCategoria: string): string[] => {
  if (["Frutas", "Verduras"].includes(subCategoria)) return ["Cajas", "Sacos", "Pallets"];
  if (subCategoria === "Panadería") return ["Cajas", "Paquetes", "Sacos", "Pallets"];
  if (subCategoria === "Comida Preparada") return ["Unidades", "Cajas", "Pallets"];
  if (subCategoria === "Pastelería") return ["Unidades", "Cajas", "Paquetes"];
  if (["Leche de 1 Litro", "Yogur en Bolsa (1 Litro)"].includes(subCategoria)) return ["Unidades", "Cajas", "Paquetes", "Pallets"];
  if (["Leche Individual (200ml)", "Yogur Individual"].includes(subCategoria)) return ["Unidades", "Cajas", "Paquetes", "Pallets"];
  if (["Quesos", "Mantequilla/Margarina", "Fiambres y Embutidos"].includes(subCategoria)) return ["Unidades", "Kilogramos", "Cajas", "Paquetes", "Pallets"];
  if (subCategoria === "Huevos") return ["Bandejas", "Cajas", "Paquetes", "Pallets"];
  return ["Unidades", "Cajas", "Paquetes", "Pallets"];
};

const getConstruccionUnidades = (subCategoria: string): string[] => {
  if (["Arena", "Grava"].includes(subCategoria)) return ["Sacos"];
  if (["Cemento", "Yeso"].includes(subCategoria)) return ["Sacos", "Pallets"];
  if (["Clavos", "Tornillos"].includes(subCategoria)) return ["Unidades", "Cajas", "Paquetes"];
  if (["Pintura"].includes(subCategoria)) return ["Unidades", "Cajas", "Pallets"];
  if (["Cables Eléctricos"].includes(subCategoria)) return ["Unidades", "Paquetes"];
  if (["Ladrillos"].includes(subCategoria)) return ["Unidades", "Pallets"];
  return ["Unidades", "Paquetes", "Pallets"]; 
};

const getAlimentosImperecederosUnidades = (subCategoria: string): string[] => {
  if (["Arroz", "Legumbres", "Azúcar", "Harina", "Avena"].includes(subCategoria)) return ["Unidades", "Cajas", "Paquetes", "Sacos", "Pallets"];
  if (["Fideos", "Pastas", "Sal", "Té", "Café", "Cereales"].includes(subCategoria)) return ["Unidades", "Cajas", "Paquetes", "Pallets"];
  return ["Unidades", "Cajas", "Paquetes", "Pallets"];
};

const getMascotasUnidades = (subCategoria: string): string[] => {
  if (subCategoria.includes("Seca") || subCategoria.includes("Arena")) return ["Unidades", "Cajas", "Paquetes", "Sacos", "Pallets"];
  return ["Unidades", "Cajas", "Paquetes", "Pallets"];
};

export const getUnidadesDisponibles = (categoria: string, subCategoria: string): string[] => {
  if (categoria === "Alimentos") return getAlimentosUnidades(subCategoria);
  if (categoria === "Alimentos imperecederos") return getAlimentosImperecederosUnidades(subCategoria);
  if (categoria === "Ropa y Calzado") return ["Unidades", "Cajas", "Paquetes", "Sacos"];
  if (categoria === "Agua e Hidratación") return subCategoria.includes("Bidón") ? ["Unidades", "Pallets"] : ["Unidades", "Cajas", "Paquetes", "Pallets"];
  if (categoria === "Artículos de Higiene Personal" || categoria === "Insumos Médicos") return ["Unidades", "Cajas", "Paquetes", "Pallets"];
  if (categoria === "Materiales de Construcción") return getConstruccionUnidades(subCategoria);
  if (categoria === "Herramientas") return ["Unidades", "Cajas"];
  if (categoria === "Muebles y Enseres") return ["Unidades"];
  if (categoria === "Alimentos para Mascotas") return getMascotasUnidades(subCategoria);

  return ["Unidades", "Kilogramos", "Litros", "Cajas", "Paquetes", "Sacos", "Pallets"];
};

export const FORMATOS_ABARROTES = [
  "250g",
  "400g",
  "500g",
  "1kg",
  "2kg",
  "5kg"
];

export const FORMATOS_TE = [
  "Cajita de 20 bolsitas",
  "Cajita de 50 bolsitas",
  "Cajita de 100 bolsitas",
  "Té en hebras (100g)",
  "Té en hebras (250g)"
];

export const FORMATOS_CAFE = [
  "Frasco pequeño (50g)",
  "Frasco mediano (100g)",
  "Frasco tradicional (170g)",
  "Bolsa recarga (170g)",
  "Café molido (250g)",
  "Café molido (500g)"
];

export const FORMATOS_QUESO = [
  "Laminado (Sobres)",
  "Trozo / Bloque",
  "Rallado",
  "Horma entera"
];

export const FORMATOS_FIAMBRE = [
  "Laminado (Sobres)",
  "Trozo / Bloque",
  "Pieza entera"
];

export const FORMATOS_MANTEQUILLA = [
  "Pan (125g)",
  "Pan (250g)",
  "Pote (500g)",
  "Bloque (1kg)"
];

export const FORMATOS_ACEITE = [
  "Botella (500ml)",
  "Botella (900ml)",
  "Botella (1 Litro)",
  "Bidón (3 Litros)",
  "Bidón (5 Litros)"
];

export const FORMATOS_CONSERVA = [
  "Tarro pequeño (170g)",
  "Tarro grande (425g)"
];

export const FORMATOS_SALSA = [
  "Sachet (200g)",
  "Sachet (250g)",
  "Tarro (400g)"
];

export const FORMATOS_MASCOTAS = [
  "Bolsa (1kg)",
  "Bolsa (3kg)",
  "Saco (10kg)",
  "Saco (15kg)",
  "Saco (20kg)",
  "Saco (25kg)"
];

export const PESOS_QUESO = [
  "100g",
  "150g",
  "200g",
  "250g",
  "380g",
  "400g",
  "500g",
  "1kg"
];

export const TIPOS_LECHE = [
  "Entera (Blanca)",
  "Semidescremada (Blanca)",
  "Descremada (Blanca)",
  "Sin Lactosa",
  "Protein",
  "Saborizada Chocolate",
  "Saborizada Frutilla",
  "Saborizada Vainilla"
];

export const TIPOS_YOGUR = [
  "Batido",
  "Light/Diet",
  "Protein",
  "Griego",
  "Sin Lactosa",
  "Con Cereal"
];

const flattenCajas = (item: any, rawCantidad: number, subcategoria: string) => {
  if (item.tipoEnvaseCaja === 'Kilogramos' || (['Frutas', 'Verduras', 'Panadería'].includes(subcategoria) && item.pesoPorCaja)) {
    return { finalCantidad: rawCantidad * Number(item.pesoPorCaja), finalUnidad: 'Kilogramos' };
  }
  if (item.tipoEnvaseCaja === 'Unidades' || item.tipoEnvaseCaja === 'Paquetes' || item.tipoEnvaseCaja === 'Bandejas' || item.unidadesPorEnvase) {
    let cant = rawCantidad * Number(item.unidadesPorEnvase);
    let unid = ['Paquetes', 'Bandejas'].includes(item.tipoEnvaseCaja) ? item.tipoEnvaseCaja : 'Unidades';
    
    if (item.tipoEnvaseCaja === 'Paquetes' && item.unidadesPorPaquete) {
      cant = cant * Number(item.unidadesPorPaquete);
      unid = subcategoria === 'Huevos' ? 'Bandejas' : 'Unidades';
    }

    return { finalCantidad: cant, finalUnidad: unid };
  }
  return { finalCantidad: rawCantidad, finalUnidad: 'Unidades' };
};

const flattenPalletCajas = (item: any, rawCantidad: number, envases: number, subcategoria: string) => {
  if (item.tipoEnvaseCajaPallet === 'Kilogramos' || (['Frutas', 'Verduras', 'Panadería'].includes(subcategoria) && item.pesoPorEnvasePallet)) {
    return { finalCantidad: rawCantidad * envases * Number(item.pesoPorEnvasePallet), finalUnidad: 'Kilogramos' };
  }
  
  if (item.tipoEnvaseCajaPallet === 'Unidades' || item.tipoEnvaseCajaPallet === 'Paquetes' || item.tipoEnvaseCajaPallet === 'Bandejas' || item.unidadesPorEnvasePallet) {
    let cant = rawCantidad * envases * Number(item.unidadesPorEnvasePallet);
    let unid = ['Paquetes', 'Bandejas'].includes(item.tipoEnvaseCajaPallet) ? item.tipoEnvaseCajaPallet : 'Unidades';
    
    if (item.tipoEnvaseCajaPallet === 'Paquetes' && item.unidadesPorPaquetePallet) {
      cant = cant * Number(item.unidadesPorPaquetePallet);
      unid = subcategoria === 'Huevos' ? 'Bandejas' : 'Unidades';
    }

    return { finalCantidad: cant, finalUnidad: unid };
  }
  return { finalCantidad: rawCantidad * envases, finalUnidad: 'Unidades' };
};

const flattenPallets = (item: any, rawCantidad: number, subcategoria: string) => {
  const envases = Number(item.cantidadEnvasePallet || 1);
  if (item.tipoEnvasePallet === 'Cajas') {
    return flattenPalletCajas(item, rawCantidad, envases, subcategoria);
  } else if (item.tipoEnvasePallet === 'Sacos' && item.pesoPorEnvasePallet) {
    return { finalCantidad: rawCantidad * envases * Number(item.pesoPorEnvasePallet), finalUnidad: 'Kilogramos' };
  } else if (item.tipoEnvasePallet === 'Paquetes') {
    if (['Frutas', 'Verduras', 'Panadería'].includes(subcategoria) && item.pesoPorEnvasePallet) {
      return { finalCantidad: rawCantidad * envases * Number(item.pesoPorEnvasePallet), finalUnidad: 'Kilogramos' };
    }
    return { finalCantidad: rawCantidad * envases * Number(item.unidadesPorEnvasePallet), finalUnidad: subcategoria === 'Huevos' ? 'Bandejas' : 'Unidades' };
  } else if (item.tipoEnvasePallet === 'Bandejas' && item.unidadesPorEnvasePallet) {
    return { finalCantidad: rawCantidad * envases * Number(item.unidadesPorEnvasePallet), finalUnidad: 'Bandejas' };
  }
  return { finalCantidad: rawCantidad * envases, finalUnidad: item.tipoEnvasePallet === 'Bandejas' ? 'Bandejas' : 'Unidades' };
};

export function flattenResourceUnit(item: any, rawCantidad: number): { finalCantidad: number, finalUnidad: string } {
  const finalUnidad = item.unidadMedida || item.unidad;
  const subcategoria = item.subCategoria || item.subcategoria;

  if (finalUnidad === 'Cajas' || finalUnidad === 'Paquetes') {
    return flattenCajas(item, rawCantidad, subcategoria);
  }

  if (finalUnidad === 'Sacos') {
    if (item.pesoPorSaco) {
      return { finalCantidad: rawCantidad * Number(item.pesoPorSaco), finalUnidad: 'Kilogramos' };
    }
    return { finalCantidad: rawCantidad, finalUnidad: 'Unidades' };
  }

  if (finalUnidad === 'Pallets') {
    return flattenPallets(item, rawCantidad, subcategoria);
  }

  if (subcategoria === 'Huevos' && finalUnidad === 'Bandejas' && item.capacidadBandeja) {
    return { finalCantidad: rawCantidad * Number(item.capacidadBandeja), finalUnidad: 'Unidades' };
  }

  return { finalCantidad: rawCantidad, finalUnidad };
}

export const getEnvasesPallet = (categoria: string, subCategoria: string): string[] => {
  const unidades = getUnidadesDisponibles(categoria, subCategoria);
  
  let palletEnvases = unidades.filter(u => !['Pallets', 'Kilogramos', 'Litros'].includes(u));

  const canBeLooseOnPallet = ["Ladrillos", "Pintura"].includes(subCategoria) || 
                             (categoria === "Agua e Hidratación" && subCategoria.includes("Bidón")) ||
                             categoria === "Muebles y Enseres";
                             
  if (!canBeLooseOnPallet) {
    palletEnvases = palletEnvases.filter(u => u !== 'Unidades');
  }

  if (palletEnvases.length === 0) {
    palletEnvases = ['Cajas']; 
  }

  return palletEnvases;
};
