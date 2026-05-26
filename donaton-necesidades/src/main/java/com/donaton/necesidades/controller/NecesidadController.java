package com.donaton.necesidades.controller;

import com.donaton.necesidades.dto.NecesidadRequestDTO;
import com.donaton.necesidades.entity.Necesidad;
import com.donaton.necesidades.service.NecesidadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/necesidades")
public class NecesidadController {

    private final NecesidadService necesidadService;

    public NecesidadController(NecesidadService necesidadService) {
        this.necesidadService = necesidadService;
    }

    @PostMapping
    public ResponseEntity<Necesidad> reportarNecesidad(@Valid @RequestBody NecesidadRequestDTO request) {
        Necesidad necesidad = necesidadService.reportarNecesidad(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(necesidad);
    }

    @GetMapping
    public ResponseEntity<java.util.List<Necesidad>> obtenerNecesidades() {
        return ResponseEntity.ok(necesidadService.obtenerTodas());
    }
}
