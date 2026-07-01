import json
import random
import datetime

# --- CONSTANTES Y CONFIGURACIÓN ---
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
    {"nombre": "Valparaíso", "pob_nivel": "alta", "acopios": [11, 12]},
    {"nombre": "Metropolitana de Santiago", "pob_nivel": "alta", "acopios": [13, 14]},
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

def generar_rut(index):
    return f"{10000000 + index}-K"

def random_date(start_days_ago=60):
    now = datetime.datetime.now()
    delta = datetime.timedelta(days=random.randint(0, start_days_ago), hours=random.randint(0, 23), minutes=random.randint(0, 59))
    return now - delta

def get_region_weights():
    return [3 if r['pob_nivel'] == 'alta' else 2 if r['pob_nivel'] == 'media' else 1 for r in REGIONES]

def generar_recursos(tipo_donante):
    num_recursos = random.randint(1, 7) if tipo_donante == 'NATURAL' else random.randint(2, 30)
    recursos = []
    for _ in range(num_recursos):
        recursos.append({
            "categoria": random.choice(CATEGORIAS),
            "cantidad": random.randint(10, 500) if tipo_donante == 'JURIDICO' else random.randint(1, 20),
            "unidad": random.choice(UNIDADES)
        })
    return json.dumps(recursos)

def get_cantidad_personal(nivel_poblacion):
    if nivel_poblacion == 'alta':
        return random.randint(60, 100)
    if nivel_poblacion == 'media':
        return random.randint(45, 75)
    return random.randint(30, 60)

def insert_admin(f):
    f.write("INSERT INTO usuarios (id, email, password, rol, nombre_completo, activo) VALUES (1, 'admin@donaton.cl', '$2a$10$xyz', 'ADMIN', 'Administrador Principal', 1);\n")
    return 2

def insert_acopios(f, start_id):
    curr_id = start_id
    for acopio_id in range(1, 33):
        email = f"acopio{acopio_id}@donaton.cl"
        f.write(f"INSERT INTO usuarios (id, email, password, rol, sub_rol, nombre_completo, centro_acopio_id, activo) VALUES ({curr_id}, '{email}', '$2a$10$xyz', 'LOGISTICA', 'RECEPCIONISTA', 'Admin Acopio {acopio_id}', {acopio_id}, 1);\n")
        curr_id += 1
    return curr_id

def insert_personal(f, start_id, conductores_por_region, coordinadores_por_region):
    curr_id = start_id
    for r in REGIONES:
        num = get_cantidad_personal(r['pob_nivel'])
        for _ in range(num):
            email = f"conductor_{curr_id}@donaton.cl"
            nombre = f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}"
            rut = generar_rut(curr_id)
            f.write(f"INSERT INTO usuarios (id, email, password, rol, sub_rol, nombre_completo, rut, region, tipo_vehiculo, matricula, activo) VALUES ({curr_id}, '{email}', '$2a$10$xyz', 'LOGISTICA', 'CONDUCTOR', '{nombre}', '{rut}', '{r['nombre']}', 'Camioneta', 'XX-YY-12', 1);\n")
            conductores_por_region[r['nombre']].append(curr_id)
            curr_id += 1
            
        for _ in range(num):
            email = f"coordinador_{curr_id}@donaton.cl"
            nombre = f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}"
            rut = generar_rut(curr_id)
            f.write(f"INSERT INTO usuarios (id, email, password, rol, nombre_completo, rut, region, activo) VALUES ({curr_id}, '{email}', '$2a$10$xyz', 'COORDINADOR', '{nombre}', '{rut}', '{r['nombre']}', 1);\n")
            coordinadores_por_region[r['nombre']].append(curr_id)
            curr_id += 1
    return curr_id

def insert_donantes(f, start_id, total, is_juridico, weights, donantes_ids):
    curr_id = start_id
    for i in range(total):
        email = f"juridico_{i}@donaton.cl" if is_juridico else f"natural_{i}@donaton.cl"
        rut = generar_rut(curr_id)
        reg = random.choices(REGIONES, weights=weights)[0]['nombre']
        tipo = 'JURIDICO' if is_juridico else 'NATURAL'
        
        if is_juridico:
            rs = f"{random.choice(RAZONES_SOCIALES)} SPA"
            f.write(f"INSERT INTO usuarios (id, email, password, rol, sub_rol, tipo_persona, razon_social, rut, region, activo) VALUES ({curr_id}, '{email}', '$2a$10$xyz', 'DONANTE', '{tipo}', '{tipo}', '{rs}', '{rut}', '{reg}', 1);\n")
        else:
            nombre = f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}"
            f.write(f"INSERT INTO usuarios (id, email, password, rol, sub_rol, tipo_persona, nombre_completo, rut, region, activo) VALUES ({curr_id}, '{email}', '$2a$10$xyz', 'DONANTE', '{tipo}', '{tipo}', '{nombre}', '{rut}', '{reg}', 1);\n")
        
        donantes_ids.append((curr_id, tipo, reg))
        curr_id += 1
    return curr_id

def generar_usuarios(f):
    conductores_por_region = {r['nombre']: [] for r in REGIONES}
    coordinadores_por_region = {r['nombre']: [] for r in REGIONES}
    donantes_ids = []

    f.write("USE donaciones_db;\n\n")
    
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
            f"{centro_acopio_id}, {conductor_id}, {dir_retiro}, {lat}, {lon}, '{reg}', 'Comuna Dummy');\n")

def generar_donaciones(f, donantes_ids, conductores_por_region):
    f.write("\n-- 2. DONACIONES\n")
    for don_id in range(1, TOTAL_DONACIONES + 1):
        sql = crear_donacion(don_id, donantes_ids, conductores_por_region)
        f.write(sql)

def crear_necesidad(nec_id, coordinadores_por_region, conductores_por_region, historiales):
    reg_obj = random.choice(REGIONES)
    reg = reg_obj['nombre']
    coordinadores = coordinadores_por_region.get(reg, [])
    coord_id = random.choice(coordinadores) if coordinadores else "NULL"
    
    recursos = [{"categoria": random.choice(CATEGORIAS), "cantidad": random.randint(10, 100), "unidad": random.choice(UNIDADES)}]
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
    
    sql_nec = (f"INSERT INTO necesidades (id, tipo_emergencia, recursos, estado, fecha_reporte, "
               f"coordinador_id, latitud, longitud, region, comuna, centro_acopio_id, conductor_id) "
               f"VALUES ({nec_id}, 'Emergencia Regional', '{json.dumps(recursos)}', '{estado}', "
               f"'{fecha.strftime('%Y-%m-%d %H:%M:%S')}', {coord_id}, {lat}, {lon}, '{reg}', 'Comuna Dummy', "
               f"{centro_acopio_id}, {conductor_id});\n")
               
    if estado == "CUBIERTA":
        hist = (f"INSERT INTO historial_necesidades (necesidad_id, categoria, cantidad, unidad, fecha_cubierta, region, comuna, centro_acopio_id) "
                f"VALUES ({nec_id}, '{recursos[0]['categoria']}', {recursos[0]['cantidad']}, '{recursos[0]['unidad']}', "
                f"'{fecha.strftime('%Y-%m-%d %H:%M:%S')}', '{reg}', 'Comuna Dummy', {centro_acopio_id});\n")
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
        
        conductores, coordinadores, donantes = generar_usuarios(f)
        generar_donaciones(f, donantes, conductores)
        generar_necesidades(f, coordinadores, conductores)

    print(f"Script completado: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
