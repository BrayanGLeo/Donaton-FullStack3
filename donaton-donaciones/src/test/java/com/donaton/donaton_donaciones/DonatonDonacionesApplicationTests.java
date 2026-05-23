package com.donaton.donaton_donaciones;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Deshabilitado porque requiere MySQL y RabbitMQ corriendo en Docker para levantar el contexto. Cubierto por pruebas unitarias de Service y Controller.")
@SpringBootTest
class DonatonDonacionesApplicationTests {

    @Test
    void contextLoads() {
    }

}