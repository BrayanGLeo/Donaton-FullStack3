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
                    new CentroAcopio("Estadio Carlos Dittborn", regArica, "Arica", "18 de Septiembre 2000"),
                    new CentroAcopio("Gimnasio Epicentro 1", regArica, "Arica", "Pablo Picasso 2150"),
                    new CentroAcopio("Estadio Tierra de Campeones", regTarapaca, "Iquique", "Salvador Allende Gossens 3160"),
                    new CentroAcopio("Gimnasio Techado Municipal", regTarapaca, "Alto Hospicio", "Los Álamos 3161"),
                    new CentroAcopio("Estadio Regional Calvo y Bascuñán", regAntofa, regAntofa, "Av. Angamos 0393"),
                    new CentroAcopio("Polideportivo Centenario", regAntofa, regAntofa, "Bandera 7891"),
                    new CentroAcopio("Estadio Luis Valenzuela Hermosilla", regAtacama, "Copiapó", "Av. Copayapu s/n"),
                    new CentroAcopio("Polideportivo Municipal", regAtacama, "Vallenar", "Av. Huasco s/n"),
                    new CentroAcopio("Coliseo Monumental", regCoquimbo, "La Serena", "Av. Estadio 1450"),
                    new CentroAcopio("Estadio Francisco Sánchez Rumoroso", regCoquimbo, "Coquimbo", "Santiago Trigo 520"),
                    new CentroAcopio("Estadio Sausalito", regValpo, "Viña del Mar", "Av. Los Castaños 404"),
                    new CentroAcopio("Polideportivo Renato Raggio", regValpo, "Valparaíso", "Subida Artillería s/n"),
                    new CentroAcopio("Estadio Nacional", regMetro, "Ñuñoa", "Av. Grecia 2001"),
                    new CentroAcopio("Movistar Arena", regMetro, "Santiago", "Parque O'Higgins s/n"),
                    new CentroAcopio("Estadio El Teniente", regOhig, "Rancagua", "Freire s/n"),
                    new CentroAcopio("Gimnasio Hermógenes Lizana", regOhig, "Rancagua", "Alameda 269"),
                    new CentroAcopio("Estadio Fiscal", regMaule, "Talca", "Av. Circunvalación Norte s/n"),
                    new CentroAcopio("Gimnasio Regional", regMaule, "Talca", "2 Norte 1150"),
                    new CentroAcopio("Estadio Nelson Oyarzún", regNuble, "Chillán", "Pedro Aguirre Cerda 297"),
                    new CentroAcopio("Casa del Deporte", regNuble, "Chillán", "5 de Abril 555"),
                    new CentroAcopio("Estadio Ester Roa Rebolledo", regBiobio, "Concepción", "Av. Collao 525"),
                    new CentroAcopio("Coliseo La Tortuga", regBiobio, "Talcahuano", "Blanco Encalada 1100"),
                    new CentroAcopio("Estadio Germán Becker", regAraucania, "Temuco", "Pablo Neruda 1110"),
                    new CentroAcopio("Gimnasio Olímpico UFRO", regAraucania, "Temuco", "Uruguay 1720"),
                    new CentroAcopio("Coliseo Municipal Antonio Azurmendi", regLosRios, "Valdivia", "Pedro Montt s/n"),
                    new CentroAcopio("Parque Saval", regLosRios, "Valdivia", "Isla Teja s/n"),
                    new CentroAcopio("Arena Puerto Montt", regLosLagos, "Puerto Montt", "Egaña 1151"),
                    new CentroAcopio("Gimnasio Fiscal", regLosLagos, "Castro", "Freire 202"),
                    new CentroAcopio("Gimnasio Regional", regAysen, "Coyhaique", "Ogana 895"),
                    new CentroAcopio("Polideportivo 21 de Abril", regAysen, "Puerto Aysén", "Av. Eusebio Ibar 260"),
                    new CentroAcopio("Gimnasio Fiscal", regMagallanes, "Punta Arenas", "Uruguay 01560"),
                    new CentroAcopio("Recinto Zona Franca", regMagallanes, "Punta Arenas", "Av. Bulnes Km 3.5")
                );
                repository.saveAll(centros);
                logger.info("Centros de acopio inicializados.");
            }
        };
    }
}
