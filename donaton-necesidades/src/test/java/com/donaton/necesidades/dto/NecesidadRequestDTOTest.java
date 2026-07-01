package com.donaton.necesidades.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class NecesidadRequestDTOTest {

    @Test
    void testGettersAndSetters() {
        NecesidadRequestDTO dto = new NecesidadRequestDTO();
        
        dto.setRecursos("Recursos");
        dto.setLatitud(-33.0);
        dto.setLongitud(-70.0);
        dto.setRegion("RM");
        dto.setComuna("Santiago");
        dto.setTipoEmergencia("Incendio");
        dto.setCoordinadorId(1L);
        
        assertEquals("Recursos", dto.getRecursos());
        assertEquals(-33.0, dto.getLatitud());
        assertEquals(-70.0, dto.getLongitud());
        assertEquals("RM", dto.getRegion());
        assertEquals("Santiago", dto.getComuna());
        assertEquals("Incendio", dto.getTipoEmergencia());
        assertEquals(1L, dto.getCoordinadorId());
    }
}
