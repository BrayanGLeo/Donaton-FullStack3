package com.donaton.logistica.controller;

import com.donaton.logistica.dto.DespachoRequestDTO;
import com.donaton.logistica.entity.Despacho;
import com.donaton.logistica.service.DespachoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logistica/despachos")
public class DespachoController {

    private final DespachoService despachoService;

    public DespachoController(DespachoService despachoService) {
        this.despachoService = despachoService;
    }

    @PostMapping
    public ResponseEntity<Despacho> asignarTransporte(@RequestBody DespachoRequestDTO request) {
        Despacho despacho = despachoService.asignarTransporte(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(despacho);
    }

    @GetMapping
    public ResponseEntity<java.util.List<Despacho>> obtenerDespachos() {
        return ResponseEntity.ok(despachoService.obtenerDespachos());
    }

    @PutMapping("/{id}/entrega")
    public ResponseEntity<String> confirmarEntrega(@PathVariable Long id) {
        despachoService.confirmarEntregaDespacho(id);
        return ResponseEntity.ok("Despacho confirmado como Entregada exitosamente");
    }
}
