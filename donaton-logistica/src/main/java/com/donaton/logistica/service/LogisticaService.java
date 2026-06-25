package com.donaton.logistica.service;

import com.donaton.logistica.dto.DonacionEventDTO;
import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.repository.InventarioRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class LogisticaService {

    private static final Logger logger = LoggerFactory.getLogger(LogisticaService.class);
    private static final String KEY_CANTIDAD = "cantidad";

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
        try {
            if (evento.getRecursos() != null) {
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, Object>> recursosList = mapper.readValue(evento.getRecursos(), new TypeReference<List<Map<String, Object>>>() {});
                for (Map<String, Object> item : recursosList) {
                    String recursoNombre = (String) item.get("recurso");
                    Integer cantidad = item.get(KEY_CANTIDAD) != null ? Integer.valueOf(item.get(KEY_CANTIDAD).toString()) : 0;
                    
                    com.donaton.logistica.entity.Recepcion recepcion = new com.donaton.logistica.entity.Recepcion(
                            trackingId,
                            recursoNombre,
                            cantidad,
                            "Pendiente de recepción");
                    recepcionRepository.save(recepcion);
                }
            }
        } catch (Exception e) {
            logger.error("Error procesando donación: {}", e.getMessage());
        }
        logger.info("Donación registrada para recepción: TrackingId={}", trackingId);
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
            try {
                if (evento.getRecursos() != null) {
                    ObjectMapper mapper = new ObjectMapper();
                    List<Map<String, Object>> recursosList = mapper.readValue(evento.getRecursos(), new TypeReference<List<Map<String, Object>>>() {});
                    for (Map<String, Object> item : recursosList) {
                        String recursoNombre = (String) item.get("recurso");
                        Integer cantidad = item.get(KEY_CANTIDAD) != null ? Integer.valueOf(item.get(KEY_CANTIDAD).toString()) : 0;
                        com.donaton.logistica.entity.Recepcion recepcion = new com.donaton.logistica.entity.Recepcion(
                                trackingId,
                                recursoNombre,
                                cantidad,
                                "Pendiente de recepción");
                        recepcionRepository.save(recepcion);
                    }
                }
            } catch (Exception ex) {
                logger.error("Error procesando fallback de donación: {}", ex.getMessage());
            }
            doConfirmarIngreso(trackingId);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public List<com.donaton.logistica.entity.Recepcion> confirmarIngreso(String trackingId) {
        return doConfirmarIngreso(trackingId);
    }

    private List<com.donaton.logistica.entity.Recepcion> doConfirmarIngreso(String trackingId) {
        List<com.donaton.logistica.entity.Recepcion> recepciones = recepcionRepository.findByTrackingId(trackingId);
        
        if (recepciones == null || recepciones.isEmpty()) {
            throw new jakarta.persistence.EntityNotFoundException("Donación no encontrada");
        }

        for (com.donaton.logistica.entity.Recepcion recepcion : recepciones) {
            if ("Disponible".equals(recepcion.getEstado())) {
                continue;
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
        }

        return recepciones;
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
