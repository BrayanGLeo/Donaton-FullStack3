package com.donaton.donaton_bff.service;


import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NecesidadesClientServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private NecesidadesClientService necesidadesClientService;

    @Test
    void testObtenerNecesidades() {
        ResponseEntity<String> mockResponse = new ResponseEntity<>("[]", HttpStatus.OK);
        when(restTemplate.getForEntity("http://donaton-necesidades/api/necesidades", String.class))
                .thenReturn(mockResponse);

        ResponseEntity<String> result = necesidadesClientService.obtenerNecesidades();
        
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("[]", result.getBody());
    }

    @Test
    void testActualizarEstadoNecesidad() {
        Map<String, String> payload = Map.of("estado", "Cubierta");
        ResponseEntity<String> mockResponse = new ResponseEntity<>("{\"estado\":\"Cubierta\"}", HttpStatus.OK);
        
        when(restTemplate.exchange(
                eq("http://donaton-necesidades/api/necesidades/1/estado"),
                eq(HttpMethod.PUT),
                any(HttpEntity.class),
                eq(String.class)
        )).thenReturn(mockResponse);

        ResponseEntity<String> result = necesidadesClientService.actualizarEstadoNecesidad(1L, payload);
        
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("{\"estado\":\"Cubierta\"}", result.getBody());
    }

    @Test
    void testObtenerHistorialNecesidades() {
        ResponseEntity<String> mockResponse = new ResponseEntity<>("[]", HttpStatus.OK);
        when(restTemplate.getForEntity("http://donaton-necesidades/api/necesidades/historial", String.class))
                .thenReturn(mockResponse);

        ResponseEntity<String> result = necesidadesClientService.obtenerHistorialNecesidades();
        
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("[]", result.getBody());
    }

    @Test
    void testFallbackObtenerNecesidades() {
        ResponseEntity<String> result = necesidadesClientService.fallbackObtenerNecesidades(new RuntimeException("Server down"));
        
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, result.getStatusCode());
        assertEquals("Servicio degradado", result.getBody());
    }
}
