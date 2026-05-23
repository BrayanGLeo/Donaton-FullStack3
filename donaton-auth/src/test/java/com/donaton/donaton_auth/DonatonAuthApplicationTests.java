package com.donaton.donaton_auth;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("Deshabilitado porque requiere MySQL corriendo en Docker para levantar el contexto. Cubierto por pruebas unitarias.")
@SpringBootTest
class DonatonAuthApplicationTests {

	@Test
	void contextLoads() {
	}

}