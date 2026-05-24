package com.donaton.donaton_bff.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@SpringBootTest
public class NecesidadesClientServiceTest {

    @MockBean
    private RestTemplate restTemplate;

    @Autowired
    private NecesidadesClientService necesidadesClientService;

    @Test
    void testObtenerNecesidadesExitoso() {
        String url = "http://donaton-necesidades/api/necesidades";
        String expectedResponse = "[{\"id\":1, \"descripcion\":\"Alimentos\"}]";

        // Simulamos un comportamiento exitoso del RestTemplate
        when(restTemplate.getForEntity(url, String.class))
                .thenReturn(new ResponseEntity<>(expectedResponse, HttpStatus.OK));

        // Ejecutamos el método
        ResponseEntity<String> response = necesidadesClientService.obtenerNecesidades();

        // Verificamos que se devuelva un 200 OK con los datos
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedResponse, response.getBody());
    }

    @Test
    void testFallbackActivado() {
        String url = "http://donaton-necesidades/api/necesidades";
        
        // Simulamos que el microservicio está caído lanzando una excepción
        when(restTemplate.getForEntity(url, String.class))
                .thenThrow(new RestClientException("Timeout simulado: El servicio no responde"));

        // Ejecutamos el método, el cual gracias a @SpringBootTest pasará por el proxy AOP
        // El @CircuitBreaker interceptará la excepción y llamará al fallback automáticamente
        ResponseEntity<String> response = necesidadesClientService.obtenerNecesidades();

        // Verificamos que la respuesta es exactamente la del fallback
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("Servicio degradado", response.getBody());
    }
}
