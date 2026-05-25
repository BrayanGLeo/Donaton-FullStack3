package com.donaton.necesidades.service;

import com.donaton.necesidades.dto.NecesidadRequestDTO;
import com.donaton.necesidades.entity.Necesidad;
import com.donaton.necesidades.repository.NecesidadRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NecesidadService {

    private final NecesidadRepository necesidadRepository;

    public NecesidadService(NecesidadRepository necesidadRepository) {
        this.necesidadRepository = necesidadRepository;
    }

    public Necesidad reportarNecesidad(NecesidadRequestDTO request) {
        Necesidad necesidad = new Necesidad(
                request.getRecursos(),
                request.getLatitud(),
                request.getLongitud(),
                LocalDateTime.now()
        );
        return necesidadRepository.save(necesidad);
    }
}
