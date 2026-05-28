package com.donaton.donaton_donaciones.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class DonacionTest {

    @Test
    void testGettersAndSetters() {
        Donacion donacion = new Donacion();
        LocalDateTime fecha = LocalDateTime.now();

        donacion.setId(1L);
        donacion.setRecurso("Agua Embotellada");
        donacion.setCantidad(100);
        donacion.setOrigen("Santiago Centro");
        donacion.setEstado("Pendiente");
        donacion.setFechaRegistro(fecha);

        assertEquals(1L, donacion.getId());
        assertEquals("Agua Embotellada", donacion.getRecurso());
        assertEquals(100, donacion.getCantidad());
        assertEquals("Santiago Centro", donacion.getOrigen());
        assertEquals("Pendiente", donacion.getEstado());
        assertEquals(fecha, donacion.getFechaRegistro());
    }

    @Test
    void testAllArgsConstructor() {
        LocalDateTime ahora = LocalDateTime.now();
        Donacion donacionParametrizada = new Donacion();
        donacionParametrizada.setId(1L);
        donacionParametrizada.setRecurso("Ropa");
        donacionParametrizada.setCantidad(50);
        donacionParametrizada.setOrigen("Sede Central");
        donacionParametrizada.setEstado("Pendiente");
        donacionParametrizada.setTrackingId("DON-123456");
        donacionParametrizada.setFechaRegistro(ahora);
        donacionParametrizada.setAcopioRecepcion("Acopio Norte");

        assertEquals(1L, donacionParametrizada.getId());
        assertEquals("Ropa", donacionParametrizada.getRecurso());
        assertEquals(50, donacionParametrizada.getCantidad());
        assertEquals("Sede Central", donacionParametrizada.getOrigen());
        assertEquals("Pendiente", donacionParametrizada.getEstado());
        assertEquals("DON-123456", donacionParametrizada.getTrackingId());
        assertEquals(ahora, donacionParametrizada.getFechaRegistro());
        assertEquals("Acopio Norte", donacionParametrizada.getAcopioRecepcion());
    }

    @Test
    void testNoArgsConstructor() {
        Donacion donacion = new Donacion();

        assertNull(donacion.getId());
        assertNull(donacion.getRecurso());
        assertNull(donacion.getCantidad());
        assertNull(donacion.getOrigen());
        assertNull(donacion.getEstado());
        assertNull(donacion.getFechaRegistro());
        assertNull(donacion.getAcopioRecepcion());
    }
}