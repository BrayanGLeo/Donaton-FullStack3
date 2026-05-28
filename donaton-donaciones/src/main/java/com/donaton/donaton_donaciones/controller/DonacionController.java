package com.donaton.donaton_donaciones.controller;

import com.donaton.donaton_donaciones.dto.DonacionRequest;
import com.donaton.donaton_donaciones.entity.Donacion;
import com.donaton.donaton_donaciones.service.DonacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donaciones")
public class DonacionController {

    private final DonacionService service;

    public DonacionController(DonacionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Donacion> registrarDonacion(@RequestBody DonacionRequest donacionReq) {
        Donacion donacion = new Donacion();
        donacion.setRecurso(donacionReq.getRecurso());
        donacion.setCantidad(donacionReq.getCantidad());
        donacion.setOrigen(donacionReq.getOrigen());
        donacion.setEstado(donacionReq.getEstado());
        Donacion nuevaDonacion = service.registrarDonacion(donacion);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaDonacion);
    }

    @GetMapping
    public ResponseEntity<List<Donacion>> listarDonaciones() {
        return ResponseEntity.ok(service.obtenerTodas());
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Donacion> actualizarEstado(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Donacion actualizada = service.actualizarEstado(id, nuevoEstado);
        return ResponseEntity.ok(actualizada);
    }
}