package com.donaton.donaton_bff.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "donaton-necesidades")
public interface NecesidadesClient {

    @PostMapping("/api/necesidades")
    ResponseEntity<Object> reportarNecesidad(@RequestBody Object request);

    @GetMapping("/api/necesidades")
    ResponseEntity<Object> listarNecesidades();
}
