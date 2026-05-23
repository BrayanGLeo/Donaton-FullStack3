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
        LocalDateTime fecha = LocalDateTime.now();

        Donacion donacion = new Donacion(2L, "Frazadas", 50, "Concepción", "En tránsito", fecha);

        assertEquals(2L, donacion.getId());
        assertEquals("Frazadas", donacion.getRecurso());
        assertEquals(50, donacion.getCantidad());
        assertEquals("Concepción", donacion.getOrigen());
        assertEquals("En tránsito", donacion.getEstado());
        assertEquals(fecha, donacion.getFechaRegistro());
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
    }
}