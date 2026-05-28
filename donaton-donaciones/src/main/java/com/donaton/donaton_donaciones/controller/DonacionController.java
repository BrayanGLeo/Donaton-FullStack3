package com.donaton.donaton_donaciones.controller;

import com.donaton.donaton_donaciones.dto.DonacionRequest;
import com.donaton.donaton_donaciones.entity.Donacion;
import com.donaton.donaton_donaciones.service.DonacionService;
import com.donaton.donaton_donaciones.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donaciones")
public class DonacionController {

    private final DonacionService service;
    private final JwtUtil jwtUtil;

    public DonacionController(DonacionService service, JwtUtil jwtUtil) {
        this.service = service;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<Donacion> registrarDonacion(
            @RequestBody DonacionRequest donacionReq,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Donacion donacion = new Donacion();
        donacion.setRecurso(donacionReq.getRecurso());
        donacion.setCantidad(donacionReq.getCantidad());
        donacion.setOrigen(donacionReq.getOrigen());
        donacion.setEstado(donacionReq.getEstado());
        donacion.setCategoria(donacionReq.getCategoria());
        donacion.setDescripcion(donacionReq.getDescripcion());
        donacion.setEstadoArticulo(donacionReq.getEstadoArticulo());
        donacion.setFechaVencimiento(donacionReq.getFechaVencimiento());
        donacion.setUnidadMedida(donacionReq.getUnidadMedida());
        donacion.setPesoAproximado(donacionReq.getPesoAproximado());
        donacion.setFotoBase64(donacionReq.getFotoBase64());
        donacion.setModalidadEntrega(donacionReq.getModalidadEntrega());
        donacion.setCentroAcopioDestinoId(donacionReq.getCentroAcopioDestinoId());
        donacion.setDireccionRetiro(donacionReq.getDireccionRetiro());
        donacion.setDisponibilidadHoraria(donacionReq.getDisponibilidadHoraria());
        donacion.setTransporteEspecial(donacionReq.getTransporteEspecial());
        donacion.setRegionRetiro(donacionReq.getRegionRetiro());
        donacion.setComunaRetiro(donacionReq.getComunaRetiro());

        Long donanteId = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            donanteId = jwtUtil.extractUserId(token);
        }
        if (donanteId == null) {
            donanteId = donacionReq.getDonanteId();
        }
        donacion.setDonanteId(donanteId);

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