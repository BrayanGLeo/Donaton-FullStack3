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
                    new CentroAcopio("Acopio Arica", regArica, "Arica", "Calle Arica 123"),
                    new CentroAcopio("Acopio Putre", regArica, "Putre", "Calle Putre 456"),
                    new CentroAcopio("Acopio Iquique", regTarapaca, "Iquique", "Av Iquique 111"),
                    new CentroAcopio("Acopio Alto Hospicio", regTarapaca, "Alto Hospicio", "Av Alto Hospicio 222"),
                    new CentroAcopio("Acopio Antofagasta", regAntofa, "Antofagasta", "Centro Antofagasta 333"),
                    new CentroAcopio("Acopio Calama", regAntofa, "Calama", "Av Calama 444"),
                    new CentroAcopio("Acopio Copiapó", regAtacama, "Copiapó", "Calle Copiapo 555"),
                    new CentroAcopio("Acopio Vallenar", regAtacama, "Vallenar", "Av Vallenar 666"),
                    new CentroAcopio("Acopio La Serena", regCoquimbo, "La Serena", "Av La Serena 777"),
                    new CentroAcopio("Acopio Coquimbo", regCoquimbo, "Coquimbo", "Calle Coquimbo 888"),
                    new CentroAcopio("Acopio Viña del Mar", regValpo, "Viña del Mar", "Av Viña 999"),
                    new CentroAcopio("Acopio Valparaíso", regValpo, "Valparaíso", "Calle Valparaiso 100"),
                    new CentroAcopio("Acopio Puente Alto", regMetro, "Puente Alto", "Av Puente Alto 101"),
                    new CentroAcopio("Acopio Maipú", regMetro, "Maipú", "Av Maipu 102"),
                    new CentroAcopio("Acopio Rancagua", regOhig, "Rancagua", "Av Rancagua 103"),
                    new CentroAcopio("Acopio San Fernando", regOhig, "San Fernando", "Av San Fernando 104"),
                    new CentroAcopio("Acopio Talca", regMaule, "Talca", "Av Talca 105"),
                    new CentroAcopio("Acopio Curicó", regMaule, "Curicó", "Av Curico 106"),
                    new CentroAcopio("Acopio Chillán", regNuble, "Chillán", "Av Chillan 107"),
                    new CentroAcopio("Acopio San Carlos", regNuble, "San Carlos", "Av San Carlos 108"),
                    new CentroAcopio("Acopio Concepción", regBiobio, "Concepción", "Av Concepcion 109"),
                    new CentroAcopio("Acopio Los Ángeles", regBiobio, "Los Ángeles", "Av Los Angeles 110"),
                    new CentroAcopio("Acopio Temuco", regAraucania, "Temuco", "Av Temuco 111"),
                    new CentroAcopio("Acopio Villarrica", regAraucania, "Villarrica", "Av Villarrica 112"),
                    new CentroAcopio("Acopio Valdivia", regLosRios, "Valdivia", "Av Valdivia 113"),
                    new CentroAcopio("Acopio La Unión", regLosRios, "La Unión", "Av La Union 114"),
                    new CentroAcopio("Acopio Puerto Montt", regLosLagos, "Puerto Montt", "Av P Montt 115"),
                    new CentroAcopio("Acopio Osorno", regLosLagos, "Osorno", "Av Osorno 116"),
                    new CentroAcopio("Acopio Coyhaique", regAysen, "Coyhaique", "Av Coyhaique 117"),
                    new CentroAcopio("Acopio Puerto Aysén", regAysen, "Puerto Aysén", "Av P Aysen 118"),
                    new CentroAcopio("Acopio Punta Arenas", regMagallanes, "Punta Arenas", "Av Punta Arenas 119"),
                    new CentroAcopio("Acopio Puerto Natales", regMagallanes, "Puerto Natales", "Av P Natales 120")
                );
                repository.saveAll(centros);
                logger.info("Centros de acopio inicializados.");
            }
        };
    }
}
