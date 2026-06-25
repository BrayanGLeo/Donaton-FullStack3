import { z } from 'zod';

export const getMaxYearsForSubcategory = (subCategoria?: string): number => {
  if (!subCategoria) return 5;

  const limites: Record<string, number> = {
    // Alimentos
    "Fideos/Pastas": 3,
    "Legumbres": 3,
    "Aceite": 2,
    "Salsa de Tomate": 2,
    "Atún/Jurel en Conserva": 5,
    "Leche (Polvo/Caja larga vida)": 2,
    "Harina": 1,
    "Azúcar": 5,
    "Sal": 5,
    "Té/Café": 2,
    "Avena/Cereales": 1,
    // Agua e Hidratación
    "Agua Embotellada (Bidón)": 2,
    "Agua Embotellada (Individual)": 2,
    "Bebidas Isotónicas": 1,
    "Jugos en Caja": 1,
    // Insumos Médicos
    "Mascarillas": 5,
    "Guantes de Látex/Nitrilo": 5,
    "Alcohol/Alcohol Gel": 3,
    "Gasas/Vendas": 5,
    "Paracetamol/Ibuprofeno": 5,
    "Suero": 3,
    "Jeringas": 5,
    // Alimentos para Mascotas
    "Comida para Perros (Seca)": 2,
    "Comida para Perros (Húmeda)": 3,
    "Comida para Gatos (Seca)": 2,
    "Comida para Gatos (Húmeda)": 3,
    "Arena para Gatos": 5,
  };

  return limites[subCategoria] || 5;
};


export const donacionStep1Schema = z.object({
  nombreArticulo: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  recursos: z.array(
    z.object({
      id: z.string().optional(),
      categoria: z.string().min(1, 'La categoría es requerida'),
      subCategoria: z.string().optional(),
      estadoArticulo: z.string().min(1, 'El estado es requerido'),
      unidadMedida: z.string().min(1, 'La unidad es requerida'),
      cantidad: z.number().or(z.nan())
        .transform(val => Number.isNaN(val) ? 0 : val)
        .pipe(
          z.number()
            .min(0.01, 'La cantidad es requerida')
            .max(999999, 'Cantidad máxima de 6 dígitos excedida')
        ),
      pesoAproximado: z.number().or(z.nan()).optional()
        .transform(val => (val === undefined || Number.isNaN(val)) ? undefined : val)
        .pipe(
          z.number()
            .min(0.01, 'El peso debe ser mayor a 0')
            .max(99999, 'Peso máximo de 5 dígitos excedido')
            .optional()
        ),
      fechaVencimiento: z.string().optional(),
    })
  ).min(1, "Debes agregar al menos un recurso a donar"),
  descripcion: z.string()
    .min(1, 'La descripción es requerida')
    .max(3000, 'La descripción no puede exceder 3000 caracteres'),
  fotoBase64: z.string().optional(),
  visibilidad: z.string({ message: 'Seleccione la visibilidad' }).min(1, 'Seleccione la visibilidad'),
}).superRefine((data, ctx) => {
  data.recursos.forEach((recurso, index) => {
    if (!recurso.subCategoria) {
      ctx.addIssue({
        code: "custom",
        message: "Selecciona una subcategoría",
        path: ["recursos", index, "subCategoria"],
      });
    }

    const requiresDate = ["Alimentos", "Agua e Hidratación", "Insumos Médicos", "Alimentos para Mascotas"].includes(recurso.categoria);
    if (requiresDate) {
      if (recurso.fechaVencimiento) {
        const selectedDate = new Date(recurso.fechaVencimiento);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate <= today) {
          ctx.addIssue({
            code: "custom",
            message: "La fecha debe ser posterior a hoy",
            path: ["recursos", index, "fechaVencimiento"],
          });
        }
        
        const maxYears = getMaxYearsForSubcategory(recurso.subCategoria);
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + maxYears);
        if (selectedDate > maxDate) {
          ctx.addIssue({
            code: "custom",
            message: `La fecha no puede exceder los ${maxYears} años para esta subcategoría`,
            path: ["recursos", index, "fechaVencimiento"],
          });
        }
      } else {
        ctx.addIssue({
          code: "custom",
          message: "La fecha de vencimiento es requerida para esta categoría",
          path: ["recursos", index, "fechaVencimiento"],
        });
      }
    }
  });
}).superRefine((data, ctx) => {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.startsWith(' ')) {
      ctx.addIssue({ code: "custom", message: "No puede empezar con un espacio", path: [key] });
    }
  }
  data.recursos.forEach((recurso, index) => {
    for (const [key, value] of Object.entries(recurso)) {
      if (typeof value === 'string' && value.startsWith(' ')) {
        ctx.addIssue({ code: "custom", message: "No puede empezar con un espacio", path: ["recursos", index, key] });
      }
    }
  });
});

export const donacionStep2Schema = z.object({
  modalidadEntrega: z.string().min(1, 'El método de entrega es requerido'),
  centroAcopioDestinoId: z.number().optional(),
  regionRetiro: z.string().optional(),
  comunaRetiro: z.string().optional(),
  direccionRetiroCalle: z.string().optional(),
  direccionRetiroNumero: z.string().optional(),
  disponibilidadHoraria: z.string().optional(),
  transporteEspecial: z.boolean().optional(),
  latitudRetiro: z.number().optional(),
  longitudRetiro: z.number().optional(),
}).superRefine((data, ctx) => {
  if (data.modalidadEntrega === 'Acopio') {
    if (!data.centroAcopioDestinoId || data.centroAcopioDestinoId <= 0) {
      ctx.addIssue({
        code: "custom",
        message: "Selecciona un centro de acopio",
        path: ["centroAcopioDestinoId"],
      });
    }
  } else if (data.modalidadEntrega === 'Retiro') {
    validarRetiro(data, ctx);
  }
}).superRefine((data, ctx) => {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.startsWith(' ')) {
      ctx.addIssue({ code: "custom", message: "No puede empezar con un espacio", path: [key] });
    }
  }
});

function validarRetiro(data: any, ctx: z.RefinementCtx) {
  if (!data.regionRetiro) {
    ctx.addIssue({ code: "custom", message: "La región es requerida", path: ["regionRetiro"] });
  }
  if (!data.comunaRetiro) {
    ctx.addIssue({ code: "custom", message: "La comuna es requerida", path: ["comunaRetiro"] });
  }
  if (!data.direccionRetiroCalle) {
    ctx.addIssue({ code: "custom", message: "La calle es requerida", path: ["direccionRetiroCalle"] });
  }
  if (!data.direccionRetiroNumero) {
    ctx.addIssue({ code: "custom", message: "El número es requerido", path: ["direccionRetiroNumero"] });
  }
  if (!data.disponibilidadHoraria) {
    ctx.addIssue({ code: "custom", message: "Indica tu disponibilidad", path: ["disponibilidadHoraria"] });
  }
  if (!data.latitudRetiro || !data.longitudRetiro) {
    ctx.addIssue({ code: "custom", message: "Debe marcar la ubicación en el mapa", path: ["direccionRetiroCalle"] });
  }
}

export const donacionGlobalSchema = donacionStep1Schema.and(donacionStep2Schema);

export type DonacionStep1Values = z.infer<typeof donacionStep1Schema>;
export type DonacionStep2Values = z.infer<typeof donacionStep2Schema>;
export type DonacionGlobalValues = z.infer<typeof donacionGlobalSchema>;
