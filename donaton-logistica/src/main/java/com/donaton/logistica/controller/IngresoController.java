package com.donaton.logistica.controller;

import com.donaton.logistica.entity.Recepcion;
import com.donaton.logistica.service.LogisticaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logistica/ingreso")
public class IngresoController {

    private final LogisticaService logisticaService;

    public IngresoController(LogisticaService logisticaService) {
        this.logisticaService = logisticaService;
    }

    @PutMapping("/{trackingId}")
    public ResponseEntity<Recepcion> confirmarIngreso(@PathVariable String trackingId) {
        Recepcion recepcion = logisticaService.confirmarIngreso(trackingId);
        return ResponseEntity.ok(recepcion);
    }
}
