package com.donaton.donaton_donaciones.dto;

import com.donaton.donaton_donaciones.entity.Donacion;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DonacionEntitiesDTOsTest {

    @Test
    void testDonacionRequest() {
        DonacionRequest req = new DonacionRequest();
        req.setNombreArticulo("Ropa");
        req.setRecursos("Abrigo");
        req.setOrigen("Casa");
        req.setEstado("Pendiente");
        req.setDescripcion("Ropa de invierno");
        req.setFotoBase64("base64...");
        req.setModalidadEntrega("Retiro");
        req.setCentroAcopioDestinoId(1L);
        req.setDireccionRetiro("Calle 1");
        req.setDisponibilidadHoraria("Mañana");
        req.setTransporteEspecial(true);
        req.setRegionRetiro("RM");
        req.setComunaRetiro("Santiago");
        req.setLatitudRetiro(-33.0);
        req.setLongitudRetiro(-70.0);
        req.setVisibilidad("Publico");
        req.setDonanteId(2L);
        req.setConductorId(3L);

        assertEquals("Ropa", req.getNombreArticulo());
        assertEquals("Abrigo", req.getRecursos());
        assertEquals("Casa", req.getOrigen());
        assertEquals("Pendiente", req.getEstado());
        assertEquals("Ropa de invierno", req.getDescripcion());
        assertEquals("base64...", req.getFotoBase64());
        assertEquals("Retiro", req.getModalidadEntrega());
        assertEquals(1L, req.getCentroAcopioDestinoId());
        assertEquals("Calle 1", req.getDireccionRetiro());
        assertEquals("Mañana", req.getDisponibilidadHoraria());
        assertEquals(true, req.getTransporteEspecial());
        assertEquals("RM", req.getRegionRetiro());
        assertEquals("Santiago", req.getComunaRetiro());
        assertEquals(-33.0, req.getLatitudRetiro());
        assertEquals(-70.0, req.getLongitudRetiro());
        assertEquals("Publico", req.getVisibilidad());
        assertEquals(2L, req.getDonanteId());
        assertEquals(3L, req.getConductorId());
    }

    @Test
    void testDonacionEntity() {
        Donacion donacion = new Donacion();
        donacion.setId(1L);
        donacion.setNombreArticulo("Alimentos");
        donacion.setRecursos("Agua");
        donacion.setOrigen("Empresa");
        donacion.setEstado("En Camino");
        donacion.setDescripcion("10L Agua");
        donacion.setFotoBase64("abc");
        donacion.setModalidadEntrega("Despacho");
        donacion.setCentroAcopioDestinoId(10L);
        donacion.setDireccionRetiro("Dir");
        donacion.setDisponibilidadHoraria("Tarde");
        donacion.setTransporteEspecial(false);
        donacion.setRegionRetiro("V");
        donacion.setComunaRetiro("Valparaiso");
        donacion.setLatitudRetiro(1.0);
        donacion.setLongitudRetiro(2.0);
        donacion.setVisibilidad("Privado");
        donacion.setDonanteId(5L);
        donacion.setConductorId(6L);
        donacion.setTrackingId("TRK-1");
        donacion.setAcopioRecepcion("Acopio");
        
        LocalDateTime now = LocalDateTime.now();
        donacion.setFechaRegistro(now);
        donacion.setFechaActualizacion(now);

        assertEquals(1L, donacion.getId());
        assertEquals("Alimentos", donacion.getNombreArticulo());
        assertEquals("Agua", donacion.getRecursos());
        assertEquals("Empresa", donacion.getOrigen());
        assertEquals("En Camino", donacion.getEstado());
        assertEquals("10L Agua", donacion.getDescripcion());
        assertEquals("abc", donacion.getFotoBase64());
        assertEquals("Despacho", donacion.getModalidadEntrega());
        assertEquals(10L, donacion.getCentroAcopioDestinoId());
        assertEquals("Dir", donacion.getDireccionRetiro());
        assertEquals("Tarde", donacion.getDisponibilidadHoraria());
        assertEquals(false, donacion.getTransporteEspecial());
        assertEquals("V", donacion.getRegionRetiro());
        assertEquals("Valparaiso", donacion.getComunaRetiro());
        assertEquals(1.0, donacion.getLatitudRetiro());
        assertEquals(2.0, donacion.getLongitudRetiro());
        assertEquals("Privado", donacion.getVisibilidad());
        assertEquals(5L, donacion.getDonanteId());
        assertEquals(6L, donacion.getConductorId());
        assertEquals("TRK-1", donacion.getTrackingId());
        assertEquals("Acopio", donacion.getAcopioRecepcion());
        assertEquals(now, donacion.getFechaRegistro());
        assertEquals(now, donacion.getFechaActualizacion());
    }
}
