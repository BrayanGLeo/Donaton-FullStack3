package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.service.NecesidadesClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bff")
public class BffController {

    private final NecesidadesClientService necesidadesClientService;

    public BffController(NecesidadesClientService necesidadesClientService) {
        this.necesidadesClientService = necesidadesClientService;
    }

    @GetMapping("/necesidades")
    public ResponseEntity<String> obtenerNecesidades() {
        return necesidadesClientService.obtenerNecesidades();
    }
}
