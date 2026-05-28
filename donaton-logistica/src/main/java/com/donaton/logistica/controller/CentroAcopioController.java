package com.donaton.logistica.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.donaton.logistica.entity.CentroAcopio;
import com.donaton.logistica.repository.CentroAcopioRepository;

import java.util.List;

@RestController
@RequestMapping("/api/logistica/centros-acopio")
public class CentroAcopioController {

    private final CentroAcopioRepository centroAcopioRepository;

    public CentroAcopioController(CentroAcopioRepository centroAcopioRepository) {
        this.centroAcopioRepository = centroAcopioRepository;
    }

    @GetMapping
    public ResponseEntity<List<CentroAcopio>> obtenerTodos() {
        return ResponseEntity.ok(centroAcopioRepository.findAll());
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<CentroAcopio>> obtenerPorRegion(@PathVariable String region) {
        return ResponseEntity.ok(centroAcopioRepository.findByRegion(region));
    }
}
