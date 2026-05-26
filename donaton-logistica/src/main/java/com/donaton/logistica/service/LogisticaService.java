package com.donaton.logistica.service;

import com.donaton.logistica.dto.DonacionEventDTO;
import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.repository.InventarioRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LogisticaService {

    private final InventarioRepository inventarioRepository;
    private final com.donaton.logistica.repository.RecepcionRepository recepcionRepository;

    public LogisticaService(InventarioRepository inventarioRepository, com.donaton.logistica.repository.RecepcionRepository recepcionRepository) {
        this.inventarioRepository = inventarioRepository;
        this.recepcionRepository = recepcionRepository;
    }

    @RabbitListener(queues = "donacion_creada_queue")
    public void procesarDonacion(DonacionEventDTO evento) {
        String trackingId = evento.getTrackingId() != null ? evento.getTrackingId() : "TRK-DON-" + evento.getId();
        com.donaton.logistica.entity.Recepcion recepcion = new com.donaton.logistica.entity.Recepcion(
                trackingId,
                evento.getRecurso(),
                evento.getCantidad(),
                "Pendiente de recepción"
        );
        recepcionRepository.save(recepcion);
        System.out.println("Donación registrada para recepción: TrackingId=" + trackingId + ", Recurso=" + recepcion.getRecurso());
    }

    @org.springframework.transaction.annotation.Transactional
    public com.donaton.logistica.entity.Recepcion confirmarIngreso(String trackingId) {
        com.donaton.logistica.entity.Recepcion recepcion = recepcionRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Donación no encontrada"));
        
        if ("Disponible".equals(recepcion.getEstado())) {
            return recepcion; // Ya fue confirmada
        }

        recepcion.setEstado("Disponible");
        recepcionRepository.save(recepcion);

        Optional<Inventario> inventarioOpt = inventarioRepository.findByRecurso(recepcion.getRecurso());
        Inventario inventario;
        if (inventarioOpt.isPresent()) {
            inventario = inventarioOpt.get();
            inventario.setCantidadTotal(inventario.getCantidadTotal() + recepcion.getCantidad());
        } else {
            inventario = new Inventario(recepcion.getRecurso(), recepcion.getCantidad());
        }
        inventarioRepository.save(inventario);
        
        return recepcion;
    }
}
