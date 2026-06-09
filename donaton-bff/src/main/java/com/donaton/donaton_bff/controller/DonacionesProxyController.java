package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.client.DonacionesClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donaciones")
public class DonacionesProxyController {

    private final DonacionesClient donacionesClient;

    public DonacionesProxyController(DonacionesClient donacionesClient) {
        this.donacionesClient = donacionesClient;
    }

    @PostMapping
    public ResponseEntity<Object> registrarDonacion(@RequestBody Object request) {
        return donacionesClient.registrarDonacion(request);
    }

    @GetMapping
    public ResponseEntity<Object> listarDonaciones() {
        return donacionesClient.listarDonaciones();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Object> actualizarEstado(@PathVariable("id") Long id, @RequestBody Object body) {
        return donacionesClient.actualizarEstado(id, body);
    }
}
