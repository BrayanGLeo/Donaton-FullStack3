package com.donaton.necesidades.service;

import com.donaton.necesidades.dto.NecesidadRequestDTO;
import com.donaton.necesidades.entity.Necesidad;
import com.donaton.necesidades.repository.NecesidadRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class NecesidadService {
    
    private static final Logger logger = LoggerFactory.getLogger(NecesidadService.class);

    private final NecesidadRepository necesidadRepository;
    private final com.donaton.necesidades.repository.HistorialNecesidadRepository historialNecesidadRepository;

    public NecesidadService(NecesidadRepository necesidadRepository, com.donaton.necesidades.repository.HistorialNecesidadRepository historialNecesidadRepository) {
        this.necesidadRepository = necesidadRepository;
        this.historialNecesidadRepository = historialNecesidadRepository;
    }

    public Necesidad reportarNecesidad(NecesidadRequestDTO request) {
        Necesidad necesidad = new Necesidad(
                request.getRecursos(),
                request.getLatitud(),
                request.getLongitud(),
                LocalDateTime.now(ZoneId.systemDefault()),
                request.getRegion(),
                request.getComuna(),
                request.getTipoEmergencia()
        );
        necesidad.setCoordinadorId(request.getCoordinadorId());
        return necesidadRepository.save(necesidad);
    }

    public java.util.List<Necesidad> obtenerTodas() {
        return necesidadRepository.findAll();
    }

    public Necesidad actualizarEstado(Long id, String estado, String centroAcopioIdStr, String conductorIdStr) {
        Necesidad necesidad = necesidadRepository.findById(id).orElseThrow(() -> new RuntimeException("Necesidad no encontrada"));
        necesidad.setEstado(estado);
        necesidad.setFechaActualizacion(LocalDateTime.now(ZoneId.systemDefault()));
        if (conductorIdStr != null && !conductorIdStr.isEmpty()) {
            necesidad.setConductorId(Long.parseLong(conductorIdStr));
        }
        if (centroAcopioIdStr != null && !centroAcopioIdStr.isEmpty()) {
            necesidad.setCentroAcopioId(Long.parseLong(centroAcopioIdStr));
        }
        Necesidad actualizada = necesidadRepository.save(necesidad);

        if ("Cubierta".equalsIgnoreCase(estado)) {
            procesarYGuardarHistorial(necesidad, centroAcopioIdStr);
        }

        return actualizada;
    }

    private void procesarYGuardarHistorial(Necesidad necesidad, String centroAcopioIdStr) {
        try {
            Long centroId = (centroAcopioIdStr != null && !centroAcopioIdStr.isEmpty()) ? Long.parseLong(centroAcopioIdStr) : null;
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode recursosArray = mapper.readTree(necesidad.getRecursos());
            
            if (recursosArray.isArray()) {
                for (com.fasterxml.jackson.databind.JsonNode node : recursosArray) {
                    guardarItemHistorial(necesidad, centroId, node);
                }
            }
        } catch (Exception e) {
            logger.error("Error al parsear recursos para historial: {}", e.getMessage());
        }
    }

    private void guardarItemHistorial(Necesidad necesidad, Long centroId, com.fasterxml.jackson.databind.JsonNode node) {
        String categoria = node.has("categoria") ? node.get("categoria").asText() : "Recurso general";
        Double cantidad = node.has("cantidad") ? node.get("cantidad").asDouble() : 1.0;
        String unidad = node.has("unidad") ? node.get("unidad").asText() : "u.";
        
        com.donaton.necesidades.entity.HistorialNecesidad historial = new com.donaton.necesidades.entity.HistorialNecesidad();
        historial.setNecesidadId(necesidad.getId());
        historial.setCategoria(categoria);
        historial.setCantidad(cantidad);
        historial.setUnidad(unidad);
        historial.setFechaCubierta(LocalDateTime.now(ZoneId.systemDefault()));
        historial.setRegion(necesidad.getRegion());
        historial.setComuna(necesidad.getComuna());
        historial.setCentroAcopioId(centroId);
        
        historialNecesidadRepository.save(historial);
    }

    public java.util.List<com.donaton.necesidades.entity.HistorialNecesidad> obtenerHistorial() {
        return historialNecesidadRepository.findAll();
    }
}
