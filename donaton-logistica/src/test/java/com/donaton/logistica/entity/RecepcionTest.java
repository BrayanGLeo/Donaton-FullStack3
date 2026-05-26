package com.donaton.logistica.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class RecepcionTest {

    @Test
    void testRecepcionEntity() {
        Recepcion recepcion = new Recepcion();
        assertNull(recepcion.getId());
        
        recepcion.setId(10L);
        recepcion.setTrackingId("TRK-123");
        recepcion.setRecurso("Manta");
        recepcion.setCantidad(5);
        recepcion.setEstado("Pendiente");

        assertEquals(10L, recepcion.getId());
        assertEquals("TRK-123", recepcion.getTrackingId());
        assertEquals("Manta", recepcion.getRecurso());
        assertEquals(5, recepcion.getCantidad());
        assertEquals("Pendiente", recepcion.getEstado());
    }
}
