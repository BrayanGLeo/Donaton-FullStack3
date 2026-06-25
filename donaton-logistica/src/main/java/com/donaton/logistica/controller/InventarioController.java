package com.donaton.logistica.controller;

import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.service.DespachoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import com.donaton.logistica.dto.ConsumoInventarioRequest;
import com.donaton.logistica.service.LogisticaService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/logistica/inventario")
public class InventarioController {

    private final DespachoService despachoService;
    private final LogisticaService logisticaService;

    public InventarioController(DespachoService despachoService, LogisticaService logisticaService) {
        this.despachoService = despachoService;
        this.logisticaService = logisticaService;
    }

    @GetMapping
    public ResponseEntity<List<Inventario>> obtenerInventario() {
        return ResponseEntity.ok(despachoService.obtenerInventario());
    }

    @PostMapping("/consumir")
    public ResponseEntity<Inventario> consumirInventario(@RequestBody ConsumoInventarioRequest request) {
        Inventario actualizado = logisticaService.consumirInventario(request.getRecurso(), request.getCantidad());
        return ResponseEntity.ok(actualizado);
    }
}
