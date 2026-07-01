package com.donaton.necesidades.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.assertEquals;

class HistorialNecesidadTest {

    @Test
    void testGettersAndSetters() {
        HistorialNecesidad h = new HistorialNecesidad();
        
        h.setId(1L);
        h.setNecesidadId(2L);
        h.setCategoria("Agua");
        h.setCantidad(10.5);
        h.setUnidad("Litros");
        
        LocalDateTime now = LocalDateTime.now();
        h.setFechaCubierta(now);
        
        h.setRegion("RM");
        h.setComuna("Santiago");
        h.setCentroAcopioId(3L);
        
        assertEquals(1L, h.getId());
        assertEquals(2L, h.getNecesidadId());
        assertEquals("Agua", h.getCategoria());
        assertEquals(10.5, h.getCantidad());
        assertEquals("Litros", h.getUnidad());
        assertEquals(now, h.getFechaCubierta());
        assertEquals("RM", h.getRegion());
        assertEquals("Santiago", h.getComuna());
        assertEquals(3L, h.getCentroAcopioId());
    }
}
