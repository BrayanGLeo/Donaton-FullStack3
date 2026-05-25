package com.donaton.logistica.service;

import com.donaton.logistica.dto.DespachoRequestDTO;
import com.donaton.logistica.entity.Despacho;
import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.repository.DespachoRepository;
import com.donaton.logistica.repository.InventarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DespachoService {

    private final InventarioRepository inventarioRepository;
    private final DespachoRepository despachoRepository;

    public DespachoService(InventarioRepository inventarioRepository, DespachoRepository despachoRepository) {
        this.inventarioRepository = inventarioRepository;
        this.despachoRepository = despachoRepository;
    }

    @Transactional
    public Despacho asignarTransporte(DespachoRequestDTO request) {
        // Regla 1 (Stock)
        Long inventarioId = request.getInventarioId();
        if (inventarioId == null) {
            throw new IllegalArgumentException("Stock insuficiente o no validado");
        }
        Inventario inventario = inventarioRepository.findById(inventarioId)
                .orElseThrow(() -> new IllegalArgumentException("Stock insuficiente o no validado"));

        if (request.getCantidad() > inventario.getCantidadTotal()) {
            throw new IllegalArgumentException("Stock insuficiente o no validado");
        }

        // Regla 2 (Bloqueo de Vehículo)
        if (despachoRepository.existsByVehiculoAndHorario(request.getVehiculo(), request.getHorario())) {
            throw new IllegalStateException("Vehículo ya asignado en este horario");
        }

        // Regla 3 (Éxito)
        inventario.setCantidadTotal(inventario.getCantidadTotal() - request.getCantidad());
        inventarioRepository.save(inventario);

        Despacho despacho = new Despacho(
                request.getInventarioId(),
                request.getCantidad(),
                request.getVehiculo(),
                request.getHorario(),
                "En tránsito"
        );
        return despachoRepository.save(despacho);
    }

    @Transactional(readOnly = true)
    public java.util.List<Inventario> obtenerInventario() {
        return inventarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public java.util.List<Despacho> obtenerDespachos() {
        return despachoRepository.findAll();
    }
}
