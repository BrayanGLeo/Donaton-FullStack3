package com.donaton.donaton_bff.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "donaton-donaciones")
public interface DonacionesClient {

    @PostMapping("/api/donaciones")
    ResponseEntity<Object> registrarDonacion(@RequestBody Object request);

    @GetMapping("/api/donaciones")
    ResponseEntity<Object> listarDonaciones();

    @PutMapping("/api/donaciones/{id}/estado")
    ResponseEntity<Object> actualizarEstado(@PathVariable("id") Long id, @RequestBody Object body);
}
