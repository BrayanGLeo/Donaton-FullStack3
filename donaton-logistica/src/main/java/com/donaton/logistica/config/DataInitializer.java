package com.donaton.logistica.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.donaton.logistica.entity.CentroAcopio;
import com.donaton.logistica.repository.CentroAcopioRepository;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner initCentrosAcopio(CentroAcopioRepository repository) {
        return args -> {
            repository.deleteAll(); // Refrescar los datos para cargar las direcciones reales
            if (repository.count() == 0) {
                String regArica = "Arica y Parinacota";
                String regTarapaca = "Tarapacá";
                String regAntofa = "Antofagasta";
                String regAtacama = "Atacama";
                String regCoquimbo = "Coquimbo";
                String regValpo = "Valparaíso";
                String regMetro = "Metropolitana de Santiago";
                String regOhig = "Libertador General Bernardo O'Higgins";
                String regMaule = "Maule";
                String regNuble = "Ñuble";
                String regBiobio = "Biobío";
                String regAraucania = "La Araucanía";
                String regLosRios = "Los Ríos";
                String regLosLagos = "Los Lagos";
                String regAysen = "Aysén del General Carlos Ibáñez del Campo";
                String regMagallanes = "Magallanes y de la Antártica Chilena";

                List<CentroAcopio> centros = Arrays.asList(
                    new CentroAcopio("Gimnasio Municipal Arica", regArica, "Arica", "Rafael Sotomayor 415"),
                    new CentroAcopio("Gimnasio Municipal Putre", regArica, "Putre", "Teniente del Campo 242"),
                    new CentroAcopio("Casa del Deportista Iquique", regTarapaca, "Iquique", "Manuel Castro Ramos 2395"),
                    new CentroAcopio("Gimnasio Municipal Alto Hospicio", regTarapaca, "Alto Hospicio", "Avenida Los Álamos 3161"),
                    new CentroAcopio("Complejo Deportivo Angamos", regAntofa, "Antofagasta", "Av. Angamos 0393"),
                    new CentroAcopio("Gimnasio Techado Calama", regAntofa, "Calama", "Av. Balmaceda 3236"),
                    new CentroAcopio("Municipalidad de Copiapó", regAtacama, "Copiapó", "Chacabuco 850"),
                    new CentroAcopio("Municipalidad de Vallenar", regAtacama, "Vallenar", "Plaza de Armas s/n"),
                    new CentroAcopio("Coliseo Monumental La Serena", regCoquimbo, "La Serena", "Av. Estadio 1450"),
                    new CentroAcopio("Gimnasio Techado Coquimbo", regCoquimbo, "Coquimbo", "Santiago Trigo 520"),
                    new CentroAcopio("Gimnasio Polideportivo Viña del Mar", regValpo, "Viña del Mar", "Av. Los Castaños 404"),
                    new CentroAcopio("Municipalidad de Valparaíso", regValpo, "Valparaíso", "Condell 1490"),
                    new CentroAcopio("Gimnasio Municipal Puente Alto", regMetro, "Puente Alto", "Av. Concha y Toro 1820"),
                    new CentroAcopio("Municipalidad de Maipú", regMetro, "Maipú", "Av. 5 de Abril 0444"),
                    new CentroAcopio("Municipalidad de Rancagua", regOhig, "Rancagua", "Plaza de Los Héroes 445"),
                    new CentroAcopio("Municipalidad de San Fernando", regOhig, "San Fernando", "Cardenal Caro 250"),
                    new CentroAcopio("Municipalidad de Talca", regMaule, "Talca", "1 Norte 770"),
                    new CentroAcopio("Municipalidad de Curicó", regMaule, "Curicó", "Estado 279"),
                    new CentroAcopio("Municipalidad de Chillán", regNuble, "Chillán", "18 de Septiembre 510"),
                    new CentroAcopio("Municipalidad de San Carlos", regNuble, "San Carlos", "Independencia 444"),
                    new CentroAcopio("Municipalidad de Concepción", regBiobio, "Concepción", "O'Higgins 525"),
                    new CentroAcopio("Municipalidad de Los Ángeles", regBiobio, "Los Ángeles", "Caupolicán 399"),
                    new CentroAcopio("Gimnasio B. O'Higgins Temuco", regAraucania, "Temuco", "Manuel Bulnes 201"),
                    new CentroAcopio("Municipalidad de Villarrica", regAraucania, "Villarrica", "Pedro de Valdivia 810"),
                    new CentroAcopio("Municipalidad de Valdivia", regLosRios, "Valdivia", "Independencia 455"),
                    new CentroAcopio("Municipalidad de La Unión", regLosRios, "La Unión", "Arturo Prat 680"),
                    new CentroAcopio("Municipalidad de Puerto Montt", regLosLagos, "Puerto Montt", "San Felipe 80"),
                    new CentroAcopio("Municipalidad de Osorno", regLosLagos, "Osorno", "Av. Juan Mackenna 851"),
                    new CentroAcopio("Municipalidad de Coyhaique", regAysen, "Coyhaique", "Francisco Bilbao 357"),
                    new CentroAcopio("Municipalidad de Puerto Aysén", regAysen, "Puerto Aysén", "Esmeralda 607"),
                    new CentroAcopio("Municipalidad de Punta Arenas", regMagallanes, "Punta Arenas", "Plaza Muñoz Gamero 745"),
                    new CentroAcopio("Municipalidad de Puerto Natales", regMagallanes, "Puerto Natales", "Carlos Bories 398")
                );
                repository.saveAll(centros);
                logger.info("Centros de acopio inicializados.");
            }
        };
    }
}
