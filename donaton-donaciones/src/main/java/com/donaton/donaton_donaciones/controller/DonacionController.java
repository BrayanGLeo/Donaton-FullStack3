package com.donaton.donaton_donaciones.controller;

import com.donaton.donaton_donaciones.entity.Donacion;
import com.donaton.donaton_donaciones.service.DonacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donaciones")
public class DonacionController {

    private final DonacionService service;

    public DonacionController(DonacionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Donacion> registrarDonacion(@RequestBody Donacion donacion) {
        Donacion nuevaDonacion = service.registrarDonacion(donacion);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaDonacion);
    }
}