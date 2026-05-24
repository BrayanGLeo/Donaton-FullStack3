package com.donaton.donaton_bff.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NecesidadesClientService {

    private final RestTemplate restTemplate;

    public NecesidadesClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @CircuitBreaker(name = "necesidadesService", fallbackMethod = "fallbackObtenerNecesidades")
    public ResponseEntity<String> obtenerNecesidades() {
        String url = "http://donaton-necesidades/api/necesidades";
        return restTemplate.getForEntity(url, String.class);
    }

    public ResponseEntity<String> fallbackObtenerNecesidades(Exception e) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Servicio degradado");
    }
}
