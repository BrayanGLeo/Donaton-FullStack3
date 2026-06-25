package com.donaton.donaton_bff.controller;

import com.donaton.donaton_bff.client.LogisticaClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/logistica")
public class LogisticaProxyController {

    private final LogisticaClient logisticaClient;

    public LogisticaProxyController(LogisticaClient logisticaClient) {
        this.logisticaClient = logisticaClient;
    }

    @GetMapping("/inventario")
    public ResponseEntity<Object> listarInventario() {
        return logisticaClient.listarInventario();
    }

    @PostMapping("/inventario/consumir")
    public ResponseEntity<Object> consumirInventario(@RequestBody Object request) {
        return logisticaClient.consumirInventario(request);
    }

    @PutMapping("/ingreso/{trackingId}")
    public ResponseEntity<Object> registrarIngreso(@PathVariable("trackingId") String trackingId) {
        return logisticaClient.registrarIngreso(trackingId);
    }

    @PostMapping("/despachos")
    public ResponseEntity<Object> asignarTransporte(@RequestBody Object request) {
        return logisticaClient.asignarTransporte(request);
    }

    @GetMapping("/despachos")
    public ResponseEntity<Object> listarDespachos() {
        return logisticaClient.listarDespachos();
    }

    @PutMapping("/despachos/{id}/entrega")
    public ResponseEntity<Object> confirmarEntrega(@PathVariable("id") Long id) {
        return logisticaClient.confirmarEntrega(id);
    }

    @GetMapping("/centros-acopio")
    public ResponseEntity<Object> listarCentrosAcopio() {
        return logisticaClient.listarCentrosAcopio();
    }

    @GetMapping("/centros-acopio/region/{region}")
    public ResponseEntity<Object> obtenerCentrosPorRegion(@PathVariable("region") String region) {
        return logisticaClient.obtenerCentrosPorRegion(region);
    }
}
