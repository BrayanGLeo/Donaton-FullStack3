package com.donaton.logistica.controller;

import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.service.DespachoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/logistica/inventario")
public class InventarioController {

    private final DespachoService despachoService;

    public InventarioController(DespachoService despachoService) {
        this.despachoService = despachoService;
    }

    @GetMapping
    public ResponseEntity<List<Inventario>> obtenerInventario() {
        return ResponseEntity.ok(despachoService.obtenerInventario());
    }
}
