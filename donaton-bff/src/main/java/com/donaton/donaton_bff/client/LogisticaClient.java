package com.donaton.donaton_bff.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "donaton-logistica")
public interface LogisticaClient {

    @GetMapping("/api/logistica/inventario")
    ResponseEntity<Object> listarInventario();

    @PutMapping("/api/logistica/ingreso/{trackingId}")
    ResponseEntity<Object> registrarIngreso(@PathVariable("trackingId") String trackingId);

    @PostMapping("/api/logistica/despachos")
    ResponseEntity<Object> asignarTransporte(@RequestBody Object request);

    @GetMapping("/api/logistica/despachos")
    ResponseEntity<Object> listarDespachos();

    @PutMapping("/api/logistica/despachos/{id}/entrega")
    ResponseEntity<Object> confirmarEntrega(@PathVariable("id") Long id);

    @GetMapping("/api/logistica/centros-acopio")
    ResponseEntity<Object> listarCentrosAcopio();

    @GetMapping("/api/logistica/centros-acopio/region/{region}")
    ResponseEntity<Object> obtenerCentrosPorRegion(@PathVariable("region") String region);
}
