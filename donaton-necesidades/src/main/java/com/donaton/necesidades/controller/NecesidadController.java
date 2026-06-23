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

    @PutMapping("/{id}/estado")
    public ResponseEntity<Necesidad> actualizarEstado(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> payload) {
        String nuevoEstado = payload.get("estado");
        String centroAcopioIdStr = payload.get("centroAcopioId");
        String conductorIdStr = payload.get("conductorId");
        Necesidad actualizada = necesidadService.actualizarEstado(id, nuevoEstado, centroAcopioIdStr, conductorIdStr);
        return ResponseEntity.ok(actualizada);
    }

    @GetMapping("/historial")
    public ResponseEntity<java.util.List<com.donaton.necesidades.entity.HistorialNecesidad>> obtenerHistorial() {
        return ResponseEntity.ok(necesidadService.obtenerHistorial());
    }
}
