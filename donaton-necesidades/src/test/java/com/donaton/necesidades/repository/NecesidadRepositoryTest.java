package com.donaton.necesidades.repository;

import com.donaton.necesidades.entity.Necesidad;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class NecesidadRepositoryTest {

    @Autowired
    private NecesidadRepository necesidadRepository;

    @Test
    void testSaveNecesidad() {
        Necesidad necesidad = new Necesidad("Ropa y Abrigo", -33.5, -70.5, LocalDateTime.now(), "Región Metropolitana", "Santiago", "Terremoto");
        Necesidad savedNecesidad = necesidadRepository.save(necesidad);

        assertNotNull(savedNecesidad.getId());
        assertEquals("Ropa y Abrigo", savedNecesidad.getRecursos());
    }
}
