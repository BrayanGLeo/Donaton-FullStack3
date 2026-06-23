package com.donaton.logistica.service;

import com.donaton.logistica.dto.DonacionEventDTO;
import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.repository.InventarioRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class LogisticaService {

    private static final Logger logger = LoggerFactory.getLogger(LogisticaService.class);

    private final InventarioRepository inventarioRepository;
    private final com.donaton.logistica.repository.RecepcionRepository recepcionRepository;

    public LogisticaService(InventarioRepository inventarioRepository,
            com.donaton.logistica.repository.RecepcionRepository recepcionRepository) {
        this.inventarioRepository = inventarioRepository;
        this.recepcionRepository = recepcionRepository;
    }

    @RabbitListener(queues = "donacion_creada_queue")
    @org.springframework.transaction.annotation.Transactional
    public void procesarDonacion(DonacionEventDTO evento) {
        String trackingId = evento.getTrackingId() != null ? evento.getTrackingId() : "TRK-DON-" + evento.getId();
        com.donaton.logistica.entity.Recepcion recepcion = new com.donaton.logistica.entity.Recepcion(
                trackingId,
                evento.getRecurso(),
                evento.getCantidad(),
                "Pendiente de recepción");
        recepcionRepository.save(recepcion);
        logger.info("Donación registrada para recepción: TrackingId={}, Recurso={}", trackingId,
                recepcion.getRecurso());
    }

    @RabbitListener(queues = "donacion_recibida_queue")
    @org.springframework.transaction.annotation.Transactional
    public void procesarDonacionRecibida(DonacionEventDTO evento) {
        String trackingId = evento.getTrackingId() != null ? evento.getTrackingId() : "TRK-DON-" + evento.getId();
        try {
            doConfirmarIngreso(trackingId);
            logger.info("Donación recibida confirmada en inventario: TrackingId={}", trackingId);
        } catch (Exception e) {
            logger.error("Error al confirmar ingreso de donación: TrackingId={}, Error={}", trackingId, e.getMessage());
            com.donaton.logistica.entity.Recepcion recepcion = new com.donaton.logistica.entity.Recepcion(
                    trackingId,
                    evento.getRecurso(),
                    evento.getCantidad(),
                    "Pendiente de recepción");
            recepcionRepository.save(recepcion);
            doConfirmarIngreso(trackingId);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public com.donaton.logistica.entity.Recepcion confirmarIngreso(String trackingId) {
        return doConfirmarIngreso(trackingId);
    }

    private com.donaton.logistica.entity.Recepcion doConfirmarIngreso(String trackingId) {
        com.donaton.logistica.entity.Recepcion recepcion = recepcionRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Donación no encontrada"));

        if ("Disponible".equals(recepcion.getEstado())) {
            return recepcion;
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

    @org.springframework.transaction.annotation.Transactional
    public Inventario consumirInventario(String recurso, Integer cantidad) {
        Inventario inventario = inventarioRepository.findByRecurso(recurso)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Recurso no encontrado en el inventario"));
        
        if (cantidad > inventario.getCantidadTotal()) {
            throw new IllegalArgumentException("Stock insuficiente para el recurso: " + recurso);
        }
        
        inventario.setCantidadTotal(inventario.getCantidadTotal() - cantidad);
        return inventarioRepository.save(inventario);
    }
}
