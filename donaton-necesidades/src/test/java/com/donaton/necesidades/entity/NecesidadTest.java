package com.donaton.necesidades.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.assertEquals;


class NecesidadTest {

    @Test
    void testGettersAndSetters() {
        Necesidad necesidad = new Necesidad();
        
        necesidad.setId(1L);
        necesidad.setRecursos("Recursos");
        necesidad.setLatitud(-33.0);
        necesidad.setLongitud(-70.0);
        necesidad.setEstado("Pendiente");
        
        LocalDateTime now = LocalDateTime.now();
        necesidad.setFechaReporte(now);
        necesidad.setFechaActualizacion(now);
        
        necesidad.setConductorId(2L);
        necesidad.setCentroAcopioId(3L);
        necesidad.setCoordinadorId(4L);
        necesidad.setRegion("RM");
        necesidad.setComuna("Santiago");
        necesidad.setTipoEmergencia("Incendio");
        
        assertEquals(1L, necesidad.getId());
        assertEquals("Recursos", necesidad.getRecursos());
        assertEquals(-33.0, necesidad.getLatitud());
        assertEquals(-70.0, necesidad.getLongitud());
        assertEquals("Pendiente", necesidad.getEstado());
        assertEquals(now, necesidad.getFechaReporte());
        assertEquals(now, necesidad.getFechaActualizacion());
        assertEquals(2L, necesidad.getConductorId());
        assertEquals(3L, necesidad.getCentroAcopioId());
        assertEquals(4L, necesidad.getCoordinadorId());
        assertEquals("RM", necesidad.getRegion());
        assertEquals("Santiago", necesidad.getComuna());
        assertEquals("Incendio", necesidad.getTipoEmergencia());
    }

    @Test
    void testConstructor() {
        LocalDateTime now = LocalDateTime.now();
        Necesidad necesidad = new Necesidad("Rec", -33.0, -70.0, now, "RM", "Stgo", "Incendio");
        
        assertEquals("Rec", necesidad.getRecursos());
        assertEquals(-33.0, necesidad.getLatitud());
        assertEquals(-70.0, necesidad.getLongitud());
        assertEquals(now, necesidad.getFechaReporte());
        assertEquals("RM", necesidad.getRegion());
        assertEquals("Stgo", necesidad.getComuna());
        assertEquals("Incendio", necesidad.getTipoEmergencia());
        assertEquals("Pendiente", necesidad.getEstado());
    }
}
