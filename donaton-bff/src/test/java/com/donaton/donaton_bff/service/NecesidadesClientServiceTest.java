package com.donaton.donaton_bff.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@SpringBootTest
class NecesidadesClientServiceTest {

    @MockitoBean
    private RestTemplate restTemplate;

    private final NecesidadesClientService necesidadesClientService;

    @Autowired
    public NecesidadesClientServiceTest(NecesidadesClientService necesidadesClientService) {
        this.necesidadesClientService = necesidadesClientService;
    }

    @Test
    void testObtenerNecesidadesExitoso() {
        String url = "http://donaton-necesidades/api/necesidades";
        String expectedResponse = "[{\"id\":1, \"descripcion\":\"Alimentos\"}]";

        when(restTemplate.getForEntity(url, String.class))
                .thenReturn(new ResponseEntity<>(expectedResponse, HttpStatus.OK));

        ResponseEntity<String> response = necesidadesClientService.obtenerNecesidades();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedResponse, response.getBody());
    }

    @Test
    void testFallbackActivado() {
        String url = "http://donaton-necesidades/api/necesidades";
        
        when(restTemplate.getForEntity(url, String.class))
                .thenThrow(new RestClientException("Timeout simulado: El servicio no responde"));

        ResponseEntity<String> response = necesidadesClientService.obtenerNecesidades();

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("Servicio degradado", response.getBody());
    }
}
