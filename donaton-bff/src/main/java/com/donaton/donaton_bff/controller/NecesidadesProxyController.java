package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.client.NecesidadesClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/necesidades")
public class NecesidadesProxyController {

    private final NecesidadesClient necesidadesClient;

    public NecesidadesProxyController(NecesidadesClient necesidadesClient) {
        this.necesidadesClient = necesidadesClient;
    }

    @PostMapping
    public ResponseEntity<Object> reportarNecesidad(@RequestBody Object request) {
        return necesidadesClient.reportarNecesidad(request);
    }

    @GetMapping
    public ResponseEntity<Object> listarNecesidades() {
        return necesidadesClient.listarNecesidades();
    }
}
