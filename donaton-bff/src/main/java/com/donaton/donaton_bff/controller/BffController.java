package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.service.NecesidadesClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bff")
public class BffController {

    private final NecesidadesClientService necesidadesClientService;

    public BffController(NecesidadesClientService necesidadesClientService) {
        this.necesidadesClientService = necesidadesClientService;
    }

    @GetMapping("/necesidades")
    public ResponseEntity<String> obtenerNecesidades() {
        return necesidadesClientService.obtenerNecesidades();
    }

    @PutMapping("/necesidades/{id}/estado")
    public ResponseEntity<String> actualizarEstadoNecesidad(
            @PathVariable Long id, 
            @RequestBody java.util.Map<String, String> payload) {
        return necesidadesClientService.actualizarEstadoNecesidad(id, payload);
    }

    @GetMapping("/necesidades/historial")
    public ResponseEntity<String> obtenerHistorialNecesidades() {
        return necesidadesClientService.obtenerHistorialNecesidades();
    }
}
