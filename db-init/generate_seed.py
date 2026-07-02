import json
import random
import datetime

# --- CONSTANTES Y CONFIGURACIÓN ---
REGION_VALPARAISO = "Valparaíso"
REGION_METROPOLITANA = "Metropolitana de Santiago"

OUTPUT_FILE = "seed_data.sql"
TOTAL_DONANTES_NATURAL = 1000
TOTAL_DONANTES_JURIDICO = 500
TOTAL_DONACIONES = 3000
TOTAL_NECESIDADES = 4000

REGIONES = [
    {"nombre": "Arica y Parinacota", "pob_nivel": "baja", "acopios": [1, 2]},
    {"nombre": "Tarapacá", "pob_nivel": "baja", "acopios": [3, 4]},
    {"nombre": "Antofagasta", "pob_nivel": "media", "acopios": [5, 6]},
    {"nombre": "Atacama", "pob_nivel": "baja", "acopios": [7, 8]},
    {"nombre": "Coquimbo", "pob_nivel": "media", "acopios": [9, 10]},
    {"nombre": REGION_VALPARAISO, "pob_nivel": "alta", "acopios": [11, 12]},
    {"nombre": REGION_METROPOLITANA, "pob_nivel": "alta", "acopios": [13, 14]},
    {"nombre": "Libertador General Bernardo O''Higgins", "pob_nivel": "media", "acopios": [15, 16]},
    {"nombre": "Maule", "pob_nivel": "media", "acopios": [17, 18]},
    {"nombre": "Ñuble", "pob_nivel": "media", "acopios": [19, 20]},
    {"nombre": "Biobío", "pob_nivel": "alta", "acopios": [21, 22]},
    {"nombre": "La Araucanía", "pob_nivel": "media", "acopios": [23, 24]},
    {"nombre": "Los Ríos", "pob_nivel": "baja", "acopios": [25, 26]},
    {"nombre": "Los Lagos", "pob_nivel": "media", "acopios": [27, 28]},
    {"nombre": "Aysén del General Carlos Ibáñez del Campo", "pob_nivel": "baja", "acopios": [29, 30]},
    {"nombre": "Magallanes y de la Antártica Chilena", "pob_nivel": "baja", "acopios": [31, 32]}
]

NOMBRES = ["Juan", "Maria", "Pedro", "Ana", "Diego", "Camila", "Jose", "Carolina", "Luis", "Valentina", "Carlos", "Javiera", "Jorge", "Francisca", "Matias", "Sofia", "Gabriel", "Isidora"]
APELLIDOS = ["Perez", "Gonzalez", "Munoz", "Rojas", "Diaz", "Soto", "Contreras", "Silva", "Martinez", "Sepulveda", "Morales", "Rodriguez", "Gomez", "Lopez", "Cortez", "Vargas"]
RAZONES_SOCIALES = ["Comercializadora Sur", "Transportes Andinos", "Inversiones San Carlos", "Distribuidora Nacional", "Constructora El Alba", "Logistica Integral", "Importaciones Globales", "Alimentos del Sur", "Agricola Central", "Empresas Unidas"]
CATEGORIAS = ["Alimentos", "Agua", "Ropa", "Medicamentos", "Material de Construcción", "Artículos de Aseo", "Herramientas"]
UNIDADES = ["unidades", "litros", "kilos", "cajas", "paquetes"]

REGIONES_COMUNAS = {
    "Arica y Parinacota": ["Arica", "Putre"],
    "Tarapacá": ["Iquique", "Alto Hospicio"],
    "Antofagasta": ["Antofagasta", "Calama"],
    "Atacama": ["Copiapó", "Vallenar"],
    "Coquimbo": ["La Serena", "Coquimbo"],
    REGION_VALPARAISO: ["Valparaíso", "Viña del Mar"],
    REGION_METROPOLITANA: ["Santiago", "Maipú", "Providencia"],
    "Libertador General Bernardo O''Higgins": ["Rancagua", "San Fernando"],
    "Maule": ["Talca", "Curicó"],
    "Ñuble": ["Chillán", "San Carlos"],
    "Biobío": ["Concepción", "Talcahuano", "Hualpén", "Los Ángeles"],
    "La Araucanía": ["Temuco", "Villarrica"],
    "Los Ríos": ["Valdivia", "La Unión"],
    "Los Lagos": ["Puerto Montt", "Osorno"],
    "Aysén del General Carlos Ibáñez del Campo": ["Coyhaique", "Puerto Aysén"],
    "Magallanes y de la Antártica Chilena": ["Punta Arenas", "Puerto Natales"]
}

def calcular_dv(rut_num):
    rut_str = str(rut_num)[::-1]
    multiplicador = 2
    suma = 0
    for digito in rut_str:
        suma += int(digito) * multiplicador
        multiplicador += 1
        if multiplicador > 7:
            multiplicador = 2
    resto = suma % 11
    dv = 11 - resto
    if dv == 11:
        return '0'
    elif dv == 10:
        return 'K'
    else:
        return str(dv)

def generar_rut_valido(index):
    num = 10000000 + index
    dv = calcular_dv(num)
    num_str = f"{num:,}".replace(",", ".")
    return f"{num_str}-{dv}"

def random_date(start_days_ago=60):
    now = datetime.datetime.now()
    delta = datetime.timedelta(days=random.randint(0, start_days_ago), hours=random.randint(0, 23), minutes=random.randint(0, 59))
    return now - delta

def get_region_weights():
    # Make all regions equally likely to get donantes, to ensure all centros get data
    return [10 for _ in REGIONES]

# CONSTANTS FOR CATEGORIES
CAT_ALIMENTOS = "Alimentos"
CAT_ALIMENTOS_IMP = "Alimentos imperecederos"
CAT_ROPA = "Ropa y Calzado"
CAT_AGUA = "Agua e Hidratación"
CAT_HIGIENE = "Artículos de Higiene Personal"
CAT_MEDICOS = "Insumos Médicos"
CAT_CONSTRUCCION = "Materiales de Construcción"
CAT_HERRAMIENTAS = "Herramientas"
CAT_MUEBLES = "Muebles y Enseres"
CAT_MASCOTAS = "Alimentos para Mascotas"

SIN_LACTOSA = "Sin Lactosa"

def get_alimentos_attrs(sub):
    import datetime, random
    attrs = {"fechaVencimiento": (datetime.datetime.now() + datetime.timedelta(days=random.randint(10, 365))).strftime('%Y-%m-%d')}
    if "Leche" in sub:
        attrs["tipoLeche"] = random.choice(["Entera (Blanca)", "Semidescremada (Blanca)", "Descremada (Blanca)", SIN_LACTOSA, "Protein", "Saborizada Chocolate", "Saborizada Frutilla", "Saborizada Vainilla"])
    elif "Yogur" in sub:
        attrs["tipoYogur"] = random.choice(["Batido", "Light/Diet", "Protein", "Griego", SIN_LACTOSA, "Con Cereal"])
    elif sub == "Quesos":
        attrs["formatoQueso"] = random.choice(["Laminado (Sobres)", "Trozo / Bloque", "Rallado", "Horma entera"])
        attrs["pesoQueso"] = random.choice(["100g", "150g", "200g", "250g", "380g", "400g", "500g", "1kg"])
    elif sub == "Mantequilla/Margarina":
        attrs["formatoSupermercado"] = random.choice(["Pan (125g)", "Pan (250g)", "Pote (500g)", "Bloque (1kg)"])
    elif sub == "Fiambres y Embutidos":
        attrs["formatoSupermercado"] = random.choice(["Laminado (Sobres)", "Trozo / Bloque", "Pieza entera"])
    elif sub == "Huevos":
        attrs["capacidadBandeja"] = random.choice(["12", "30"])
    return attrs

def get_alimentos_imp_attrs(sub):
    import datetime, random
    attrs = {"fechaVencimiento": (datetime.datetime.now() + datetime.timedelta(days=random.randint(90, 730))).strftime('%Y-%m-%d')}
    if "Leche" in sub:
        attrs["tipoLeche"] = random.choice(["Entera (Blanca)", "Semidescremada (Blanca)", "Descremada (Blanca)", SIN_LACTOSA, "Protein"])
    elif sub == "Té":
        attrs["formatoSupermercado"] = random.choice(["Cajita de 20 bolsitas", "Cajita de 50 bolsitas", "Cajita de 100 bolsitas", "Té en hebras (100g)", "Té en hebras (250g)"])
    elif sub == "Café":
        attrs["formatoSupermercado"] = random.choice(["Frasco pequeño (50g)", "Frasco mediano (100g)", "Frasco tradicional (170g)", "Bolsa recarga (170g)", "Café molido (250g)", "Café molido (500g)"])
    elif sub == "Aceite":
        attrs["formatoSupermercado"] = random.choice(["Botella (500ml)", "Botella (900ml)", "Botella (1 Litro)", "Bidón (3 Litros)", "Bidón (5 Litros)"])
    elif sub in ["Atún en Conserva", "Jurel en Conserva"]:
        attrs["formatoSupermercado"] = random.choice(["Tarro pequeño (170g)", "Tarro grande (425g)"])
    elif sub == "Salsa de Tomate":
        attrs["formatoSupermercado"] = random.choice(["Sachet (200g)", "Sachet (250g)", "Tarro (400g)"])
    elif sub in ["Arroz", "Fideos", "Pastas", "Legumbres", "Harina", "Azúcar", "Sal", "Avena", "Cereales", "Leche en Polvo"]:
        attrs["formatoSupermercado"] = random.choice(["250g", "400g", "500g", "1kg", "2kg", "5kg"])
    return attrs

def get_ropa_attrs(sub):
    import random
    attrs = {"genero": random.choice(["Hombre", "Mujer", "Unisex", "Niño", "Niña"])}
    if sub == "Ropa de Bebé":
        attrs["talla"] = random.choice(["0-3 meses", "3-6 meses", "6-9 meses"])
    elif sub in ["Pantalones", "Jeans"]:
        attrs["talla"] = random.choice(["30", "32", "34", "36", "38", "40", "42"])
    elif sub in ["Zapatos", "Zapatillas"]:
        attrs["talla"] = random.choice(["35", "36", "37", "38", "39", "40", "41", "42", "43"])
    else:
        attrs["talla"] = random.choice(["S", "M", "L", "XL"])
    return attrs

def get_agua_attrs(sub):
    import random
    if "Bidón" in sub:
        return {"litros": random.choice(["Bidón 5 Litros", "Bidón 10 Litros", "Bidón 12 Litros", "Bidón 20 Litros"])}
    return {"litros": random.choice(["Menos de 500ml", "500ml", "1 Litro", "1.5 a 2 Litros", "3 Litros"])}

def get_higiene_attrs(sub):
    import random
    if sub == "Pañales (Bebé)":
        return {"talla": random.choice(["RN", "P", "M", "G", "XG"])}
    if sub == "Pañales (Adulto)":
        return {"talla": random.choice(["S", "M", "L", "XL"])}
    return {}

def get_medicos_attrs(sub):
    import random
    if "Guantes" in sub:
        return {"talla": random.choice(["S", "M", "L", "XL"])}
    return {}

def get_construccion_attrs(sub):
    if sub in ["Madera", "Tablas"]:
        return {"dimensiones": "2x4 pulgadas"}
    return {}

def get_muebles_attrs(sub):
    import random
    if sub in ["Camas", "Colchones"]:
        return {"tamano": random.choice(["1 Plaza", "1.5 Plazas", "2 Plazas", "King"])}
    return {"tamano": random.choice(["Pequeño", "Mediano", "Grande"])}

def get_mascotas_attrs(sub):
    import random
    attrs = {"etapa": random.choice(["Cachorro", "Adulto", "Senior"])}
    if "Seca" in sub:
        attrs["formatoSupermercado"] = random.choice(["Bolsa (1kg)", "Bolsa (3kg)", "Saco (10kg)", "Saco (15kg)", "Saco (20kg)", "Saco (25kg)"])
    return attrs

def get_extra_attrs(cat, sub):
    dispatch = {
        CAT_ALIMENTOS: get_alimentos_attrs,
        CAT_ALIMENTOS_IMP: get_alimentos_imp_attrs,
        CAT_ROPA: get_ropa_attrs,
        CAT_AGUA: get_agua_attrs,
        CAT_HIGIENE: get_higiene_attrs,
        CAT_MEDICOS: get_medicos_attrs,
        CAT_CONSTRUCCION: get_construccion_attrs,
        CAT_MUEBLES: get_muebles_attrs,
        CAT_MASCOTAS: get_mascotas_attrs
    }
    func = dispatch.get(cat)
    if func:
        return func(sub)
    return {}

def get_envase_attrs(unidad_elegida):
    import random
    attrs = {}
    if unidad_elegida == "Pallets":
        tipo_envase = random.choice(["Cajas", "Sacos"])
        attrs["tipoEnvasePallet"] = tipo_envase
        attrs["cantidadEnvasePallet"] = random.randint(10, 50)
        if tipo_envase == "Cajas":
            attrs["tipoEnvaseCajaPallet"] = "Paquetes"
            attrs["unidadesPorEnvasePallet"] = random.randint(5, 20)
            attrs["unidadesPorPaquetePallet"] = random.randint(2, 10)
        elif tipo_envase == "Sacos":
            attrs["pesoPorEnvasePallet"] = random.randint(10, 50)
    elif unidad_elegida == "Cajas":
        attrs["tipoEnvaseCaja"] = "Paquetes"
        attrs["unidadesPorEnvase"] = random.randint(5, 20)
        attrs["unidadesPorPaquete"] = random.randint(2, 10)
    elif unidad_elegida == "Sacos":
        attrs["pesoPorSaco"] = random.randint(10, 50)
    return attrs

SUBCATEGORIAS_MAP = {
    CAT_ALIMENTOS: {
        "subs": ["Frutas", "Verduras", "Comida Preparada", "Leche de 1 Litro", "Leche Individual (200ml)", "Yogur Individual", "Yogur en Bolsa (1 Litro)", "Quesos", "Mantequilla/Margarina", "Fiambres y Embutidos", "Huevos", "Panadería", "Pastelería"],
        "unis": ["Unidades", "Kilogramos", "Cajas", "Paquetes", "Pallets", "Sacos"]
    },
    CAT_ALIMENTOS_IMP: {
        "subs": ["Arroz", "Fideos", "Pastas", "Legumbres", "Aceite", "Salsa de Tomate", "Atún en Conserva", "Jurel en Conserva", "Leche en Polvo", "Leche (Caja larga vida)", "Harina", "Azúcar", "Sal", "Té", "Café", "Avena", "Cereales"],
        "unis": ["Unidades", "Cajas", "Paquetes", "Sacos", "Pallets"]
    },
    CAT_ROPA: {
        "subs": ["Poleras", "Camisas", "Pantalones", "Jeans", "Chaquetas", "Abrigos", "Ropa Interior (Nueva)", "Zapatos", "Zapatillas", "Ropa de Bebé"],
        "unis": ["Unidades", "Cajas", "Paquetes", "Sacos"]
    },
    CAT_AGUA: {
        "subs": ["Agua Embotellada (Bidón)", "Agua Embotellada (Individual)", "Bebidas Isotónicas", "Jugos en Caja"],
        "unis": ["Unidades", "Cajas", "Paquetes", "Pallets"]
    },
    CAT_HIGIENE: {
        "subs": ["Jabón", "Gel de Ducha", "Shampoo", "Acondicionador", "Pasta Dental", "Cepillo Dental", "Papel Higiénico", "Toallas Higiénicas", "Pañales (Bebé)", "Pañales (Adulto)", "Desodorante"],
        "unis": ["Unidades", "Cajas", "Paquetes", "Pallets"]
    },
    CAT_MEDICOS: {
        "subs": ["Mascarillas", "Guantes de Látex", "Guantes de Nitrilo", "Alcohol", "Alcohol Gel", "Gasas", "Vendas", "Paracetamol", "Ibuprofeno", "Suero", "Jeringas"],
        "unis": ["Unidades", "Cajas", "Paquetes", "Pallets"]
    },
    CAT_CONSTRUCCION: {
        "subs": ["Madera", "Tablas", "Clavos", "Tornillos", "Cemento", "Zinc", "Calaminas", "Pintura", "Cables Eléctricos", "Ladrillos", "Arena", "Grava", "Yeso", "Tubos de PVC", "Fierro/Acero", "Planchas OSB", "Aislante Térmico"],
        "unis": ["Unidades", "Cajas", "Pallets", "Sacos"]
    },
    CAT_HERRAMIENTAS: {
        "subs": ["Martillo", "Serrucho", "Palas", "Picos", "Taladro", "Destornilladores", "Alicates", "Huincha de Medir", "Llave Inglesa", "Carretilla", "Esmeril", "Sierra Circular", "Hacha", "Brochas", "Rodillos"],
        "unis": ["Unidades", "Cajas"]
    },
    CAT_MUEBLES: {
        "subs": ["Camas", "Colchones", "Mesas", "Sillas", "Cocina", "Estufa", "Refrigerador", "Muebles de Guardado", "Sillones", "Estantes", "Escritorios", "Lavadora", "Microondas", "Televisor", "Sábanas y Frazadas"],
        "unis": ["Unidades"]
    },
    CAT_MASCOTAS: {
        "subs": ["Comida para Perros (Seca)", "Comida para Perros (Húmeda)", "Comida para Gatos (Seca)", "Comida para Gatos (Húmeda)", "Arena para Gatos"],
        "unis": ["Unidades", "Cajas", "Paquetes", "Sacos", "Pallets"]
    }
}

def generar_un_recurso(tipo_donante, exclude_pallets):
    import random, uuid
    cat = random.choice(list(SUBCATEGORIAS_MAP.keys()))
    info = SUBCATEGORIAS_MAP[cat]
    sub = random.choice(info["subs"])
    
    hide_estado = cat in [CAT_AGUA, CAT_HIGIENE, CAT_MEDICOS] or "Alimento" in cat
    
    valid_unis = []
    for u in info["unis"]:
        if not (exclude_pallets and u == "Pallets"):
            valid_unis.append(u)
            
    if not valid_unis:
        valid_unis = ["Unidades"]
        
    unidad_elegida = random.choice(valid_unis)
    
    cantidad_valor = random.randint(2, 20) if tipo_donante == 'JURIDICO' else random.randint(1, 5)
    estado_valor = "Nuevo" if hide_estado else random.choice(["Nuevo", "Buen estado", "Usado"])
    peso_valor = random.choice([None, random.randint(1, 20)])
    
    rec = {
        "id": str(uuid.uuid4()),
        "categoria": cat,
        "subCategoria": sub,
        "cantidad": cantidad_valor,
        "unidad": unidad_elegida,
        "unidadMedida": unidad_elegida,
        "estadoArticulo": estado_valor,
        "pesoAproximado": peso_valor
    }
    
    rec.update(get_envase_attrs(unidad_elegida))
    
    extra_attrs = get_extra_attrs(cat, sub)
    extra_attrs_clean = {}
    for k, v in extra_attrs.items():
        if v is not None:
            extra_attrs_clean[k] = v
            
    rec.update(extra_attrs_clean)
    return rec

def generar_recursos(tipo_donante, exclude_pallets=False):
    import random, json
    num_recursos = random.randint(1, 7) if tipo_donante == 'NATURAL' else random.randint(2, 30)
    recursos = []
    for _ in range(num_recursos):
        recursos.append(generar_un_recurso(tipo_donante, exclude_pallets))
    return json.dumps(recursos, ensure_ascii=False)
def get_cantidad_personal(nivel_poblacion):
    if nivel_poblacion == 'alta':
        return random.randint(60, 100)
    if nivel_poblacion == 'media':
        return random.randint(45, 75)
    return random.randint(30, 60)

def insert_admin(f):
    reg = REGION_METROPOLITANA
    com = random.choice(REGIONES_COMUNAS[reg])
    direccion_val = f"Avenida Providencia {random.randint(100, 2000)}"
    tel = f"+56 9 {random.randint(1000, 9999)} {random.randint(1000, 9999)}"
    rut = generar_rut_valido(1)
    f.write(f"INSERT INTO usuarios (id, email, password, rol, nombre_completo, rut, region, comuna, direccion, telefono, activo) VALUES (1, 'admin@donaton.cl', '$2a$10$xyz', 'ADMIN', 'Administrador Principal', '{rut}', '{reg}', '{com}', '{direccion_val}', '{tel}', 1);\n")
    return 2

def insert_acopios(f, start_id):
    curr_id = start_id
    for acopio_id in range(1, 33):
        reg = random.choice(list(REGIONES_COMUNAS.keys()))
        com = random.choice(REGIONES_COMUNAS[reg])
        direccion_val = f"Bodega {random.randint(10, 99)}"
        tel = f"+56 9 {random.randint(1000, 9999)} {random.randint(1000, 9999)}"
        rut = generar_rut_valido(curr_id)
        email = f"acopio{acopio_id}@donaton.cl"
        f.write(f"INSERT INTO usuarios (id, email, password, rol, sub_rol, nombre_completo, centro_acopio_id, rut, region, comuna, direccion, telefono, activo) VALUES ({curr_id}, '{email}', '$2a$10$xyz', 'LOGISTICA', 'RECEPCIONISTA', 'Admin Acopio {acopio_id}', {acopio_id}, '{rut}', '{reg}', '{com}', '{direccion_val}', '{tel}', 1);\n")
        curr_id += 1
    return curr_id

def insert_personal(f, start_id, conductores_por_region, coordinadores_por_region):
    curr_id = start_id
    for r in REGIONES:
        num = get_cantidad_personal(r['pob_nivel'])
        for _ in range(num):
            email = f"conductor_{curr_id}@donaton.cl"
            nombre = f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}"
            rut = generar_rut_valido(curr_id)
            com = random.choice(REGIONES_COMUNAS[r['nombre']])
            direccion_val = f"Calle Falsa {random.randint(100, 9999)}"
            tel = f"+56 9 {random.randint(1000, 9999)} {random.randint(1000, 9999)}"
            f.write(f"INSERT INTO usuarios (id, email, password, rol, sub_rol, nombre_completo, rut, region, comuna, direccion, telefono, tipo_vehiculo, matricula, activo) VALUES ({curr_id}, '{email}', '$2a$10$xyz', 'LOGISTICA', 'CONDUCTOR', '{nombre}', '{rut}', '{r['nombre']}', '{com}', '{direccion_val}', '{tel}', 'Camioneta', 'XX-YY-12', 1);\n")
            conductores_por_region[r['nombre']].append(curr_id)
            curr_id += 1
            
        for _ in range(num):
            email = f"coordinador_{curr_id}@donaton.cl"
            nombre = f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}"
            rut = generar_rut_valido(curr_id)
            com = random.choice(REGIONES_COMUNAS[r['nombre']])
            direccion_val = f"Avenida Central {random.randint(100, 9999)}"
            tel = f"+56 9 {random.randint(1000, 9999)} {random.randint(1000, 9999)}"
            f.write(f"INSERT INTO usuarios (id, email, password, rol, nombre_completo, rut, region, comuna, direccion, telefono, activo) VALUES ({curr_id}, '{email}', '$2a$10$xyz', 'COORDINADOR', '{nombre}', '{rut}', '{r['nombre']}', '{com}', '{direccion_val}', '{tel}', 1);\n")
            coordinadores_por_region[r['nombre']].append(curr_id)
            curr_id += 1
    return curr_id

def insert_donantes(f, start_id, total, is_juridico, weights, donantes_ids):
    curr_id = start_id
    for i in range(total):
        email = f"juridico_{i}@donaton.cl" if is_juridico else f"natural_{i}@donaton.cl"
        rut = generar_rut_valido(curr_id)
        reg = random.choices(REGIONES, weights=weights)[0]['nombre']
        com = random.choice(REGIONES_COMUNAS[reg])
        direccion_val = f"Calle Principal {random.randint(100, 9999)}"
        tel = f"+56 9 {random.randint(1000, 9999)} {random.randint(1000, 9999)}"
        tipo = 'JURIDICO' if is_juridico else 'NATURAL'
        
        if is_juridico:
            rs = f"{random.choice(RAZONES_SOCIALES)} SPA"
            f.write(f"INSERT INTO usuarios (id, email, password, rol, sub_rol, tipo_persona, razon_social, rut, region, comuna, direccion, telefono, activo) VALUES ({curr_id}, '{email}', '$2a$10$xyz', 'DONANTE', '{tipo}', '{tipo}', '{rs}', '{rut}', '{reg}', '{com}', '{direccion_val}', '{tel}', 1);\n")
        else:
            nombre = f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}"
            f.write(f"INSERT INTO usuarios (id, email, password, rol, sub_rol, tipo_persona, nombre_completo, rut, region, comuna, direccion, telefono, activo) VALUES ({curr_id}, '{email}', '$2a$10$xyz', 'DONANTE', '{tipo}', '{tipo}', '{nombre}', '{rut}', '{reg}', '{com}', '{direccion_val}', '{tel}', 1);\n")
        
        donantes_ids.append((curr_id, tipo, reg))
        curr_id += 1
    return curr_id

def generar_usuarios(f):
    conductores_por_region = {r['nombre']: [] for r in REGIONES}
    coordinadores_por_region = {r['nombre']: [] for r in REGIONES}
    donantes_ids = []

    f.write("USE donaton_db;\n\n")
    
    uid = insert_admin(f)
    uid = insert_acopios(f, uid)
    uid = insert_personal(f, uid, conductores_por_region, coordinadores_por_region)
    
    weights = get_region_weights()
    uid = insert_donantes(f, uid, TOTAL_DONANTES_NATURAL, False, weights, donantes_ids)
    uid = insert_donantes(f, uid, TOTAL_DONANTES_JURIDICO, True, weights, donantes_ids)

    return conductores_por_region, coordinadores_por_region, donantes_ids

def crear_donacion(don_id, donantes_ids, conductores_por_region):
    donante_id, tipo_donante, reg = random.choice(donantes_ids)
    recursos_json = generar_recursos(tipo_donante)
    
    modalidad = random.choices(["RETIRO", "ACOPIO"], weights=[70, 30])[0]
    estado = random.choices(["RECIBIDO", "EN_TRANSITO", "ASIGNADO", "PENDIENTE"], weights=[80, 5, 5, 10])[0]
    if modalidad == "ACOPIO" and estado in ["EN_TRANSITO", "ASIGNADO"]:
        estado = "RECIBIDO"
        
    fecha = random_date()
    tracking = f"DON-{don_id}-{fecha.strftime('%Y%m%d')}"
    
    acopios_region = [r for r in REGIONES if r['nombre'] == reg][0]['acopios']
    centro_acopio_id = random.choice(acopios_region)
    conductor_id = "NULL"
    lat = "NULL"
    lon = "NULL"
    dir_retiro = "NULL"
    
    if modalidad == "RETIRO":
        lat = -33.4 + random.uniform(-1, 1)
        lon = -70.6 + random.uniform(-1, 1)
        dir_retiro = "'Calle Falsa 123'"
        if estado in ["RECIBIDO", "ASIGNADO", "EN_TRANSITO"]:
            conds_region = conductores_por_region.get(reg, [])
            if conds_region:
                conductor_id = random.choice(conds_region)
        if estado == "PENDIENTE":
            centro_acopio_id = "NULL"
            
    return (f"INSERT INTO donaciones (id, nombre_articulo, recursos, modalidad_entrega, "
            f"estado, tracking_id, fecha_registro, donante_id, centro_acopio_destino_id, "
            f"conductor_id, direccion_retiro, latitud_retiro, longitud_retiro, region_retiro, comuna_retiro) "
            f"VALUES ({don_id}, 'Aporte {don_id}', '{recursos_json}', '{modalidad}', "
            f"'{estado}', '{tracking}', '{fecha.strftime('%Y-%m-%d %H:%M:%S')}', {donante_id}, "
            f"{centro_acopio_id}, {conductor_id}, {dir_retiro}, {lat}, {lon}, '{reg}', '{random.choice(REGIONES_COMUNAS[reg])}');\n")

def generar_donaciones(f, donantes_ids, conductores_por_region):
    f.write("\nUSE donaciones_db;\n")
    f.write("-- 2. DONACIONES\n")
    for don_id in range(1, TOTAL_DONACIONES + 1):
        sql = crear_donacion(don_id, donantes_ids, conductores_por_region)
        f.write(sql)

def crear_necesidad(nec_id, coordinadores_por_region, conductores_por_region, historiales):
    reg_obj = random.choice(REGIONES)
    reg = reg_obj['nombre']
    coordinadores = coordinadores_por_region.get(reg, [])
    coord_id = random.choice(coordinadores) if coordinadores else "NULL"
    
    recursos_str = generar_recursos('JURIDICO', exclude_pallets=True)
    fecha = random_date(start_days_ago=30)
    lat = -33.4 + random.uniform(-1, 1)
    lon = -70.6 + random.uniform(-1, 1)
    
    is_match = random.random() < 0.75
    estado = "PENDIENTE"
    if is_match:
        estado = random.choices(["CUBIERTA", "EN_TRANSITO", "ASIGNADO"], weights=[70, 20, 10])[0]
    
    centro_acopio_id = random.choice(reg_obj['acopios']) if is_match else "NULL"
    conds_region = conductores_por_region.get(reg, [])
    conductor_id = random.choice(conds_region) if is_match and conds_region else "NULL"
    
    comuna_nec = random.choice(REGIONES_COMUNAS[reg])
    tipo_emergencia = random.choice(["Incendio", "Inundación", "Terremoto", "Corte de suministros", "General"])
    sql_nec = (f"INSERT INTO necesidades (id, tipo_emergencia, recursos, estado, fecha_reporte, "
               f"coordinador_id, latitud, longitud, region, comuna, centro_acopio_id, conductor_id) "
               f"VALUES ({nec_id}, '{tipo_emergencia}', '{recursos_str}', '{estado}', "
               f"'{fecha.strftime('%Y-%m-%d %H:%M:%S')}', {coord_id}, {lat}, {lon}, '{reg}', '{comuna_nec}', "
               f"{centro_acopio_id}, {conductor_id});\n")
               
    if estado == "CUBIERTA":
        rec_list = json.loads(recursos_str)
        hist = (f"INSERT INTO historial_necesidades (necesidad_id, categoria, cantidad, unidad, fecha_cubierta, region, comuna, centro_acopio_id) "
                f"VALUES ({nec_id}, '{rec_list[0]['categoria']}', {rec_list[0]['cantidad']}, '{rec_list[0]['unidad']}', "
                f"'{fecha.strftime('%Y-%m-%d %H:%M:%S')}', '{reg}', '{comuna_nec}', {centro_acopio_id});\n")
        historiales.append(hist)
        
    return sql_nec

def generar_necesidades(f, coordinadores_por_region, conductores_por_region):
    f.write("\nUSE necesidades_db;\n\n")
    historiales = []
    for nec_id in range(1, TOTAL_NECESIDADES + 1):
        sql = crear_necesidad(nec_id, coordinadores_por_region, conductores_por_region, historiales)
        f.write(sql)
            
    f.write("\n-- HISTORIAL DE NECESIDADES\n")
    for h in historiales:
        f.write(h)

def main():
    print("Generando script de inyección de datos (seed_data.sql)...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("-- ==========================================\n")
        f.write("-- SCRIPT GENERADO PARA INYECCIÓN MASIVA\n")
        f.write("-- ==========================================\n\n")
        f.write("SET NAMES utf8mb4;\n\n")
        
        conductores, coordinadores, donantes = generar_usuarios(f)
        generar_donaciones(f, donantes, conductores)
        generar_necesidades(f, coordinadores, conductores)

    print(f"Script completado: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
