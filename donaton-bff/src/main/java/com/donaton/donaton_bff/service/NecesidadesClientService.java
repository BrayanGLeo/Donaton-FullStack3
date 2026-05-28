package com.donaton.donaton_bff.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class NecesidadesClientService {

    private final RestTemplate restTemplate;
    private static final Logger logger = LoggerFactory.getLogger(NecesidadesClientService.class);

    public NecesidadesClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @CircuitBreaker(name = "necesidadesService", fallbackMethod = "fallbackObtenerNecesidades")
    public ResponseEntity<String> obtenerNecesidades() {
        String url = "http://donaton-necesidades/api/necesidades";
        return restTemplate.getForEntity(url, String.class);
    }

    public ResponseEntity<String> fallbackObtenerNecesidades(Exception e) {
        logger.error("Fallback activado debido a: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Servicio degradado");
    }
}
