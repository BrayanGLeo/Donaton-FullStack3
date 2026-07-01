package com.donaton.logistica;

import com.donaton.logistica.dto.ConsumoInventarioRequest;
import com.donaton.logistica.dto.DespachoRequestDTO;
import com.donaton.logistica.dto.DonacionEventDTO;
import com.donaton.logistica.entity.CentroAcopio;
import com.donaton.logistica.entity.Despacho;
import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.entity.Recepcion;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LogisticaEntitiesDTOsTest {

    @Test
    void testCentroAcopio() {
        CentroAcopio centro = new CentroAcopio();
        centro.setId(1L);
        centro.setNombre("Centro 1");
        centro.setRegion("RM");
        centro.setComuna("Santiago");
        centro.setDireccion("Direccion 1");

        assertEquals(1L, centro.getId());
        assertEquals("Centro 1", centro.getNombre());
        assertEquals("RM", centro.getRegion());
        assertEquals("Santiago", centro.getComuna());
        assertEquals("Direccion 1", centro.getDireccion());

        CentroAcopio centro2 = new CentroAcopio("Centro 2", "V", "Valparaíso", "Dir 2");
        assertEquals("Centro 2", centro2.getNombre());
    }

    @Test
    void testDespacho() {
        Despacho despacho = new Despacho();
        despacho.setId(1L);
        despacho.setInventarioId(10L);
        despacho.setCantidadDespachada(50);
        despacho.setVehiculo("Camion");
        despacho.setEstado("En Camino");
        
        LocalDateTime now = LocalDateTime.now();
        despacho.setHorario(now);

        assertEquals(1L, despacho.getId());
        assertEquals(10L, despacho.getInventarioId());
        assertEquals(50, despacho.getCantidadDespachada());
        assertEquals("Camion", despacho.getVehiculo());
        assertEquals("En Camino", despacho.getEstado());
        assertEquals(now, despacho.getHorario());
        
        Despacho des2 = new Despacho(20L, 100, "Furgon", now, "Pendiente");
        assertEquals("Furgon", des2.getVehiculo());
    }

    @Test
    void testInventario() {
        Inventario inventario = new Inventario();
        inventario.setId(1L);
        inventario.setRecurso("Ropa");
        inventario.setCantidadTotal(50);
        
        assertEquals(1L, inventario.getId());
        assertEquals("Ropa", inventario.getRecurso());
        assertEquals(50, inventario.getCantidadTotal());

        Inventario inv2 = new Inventario("Alimentos", 100);
        assertEquals("Alimentos", inv2.getRecurso());
    }

    @Test
    void testRecepcion() {
        Recepcion recepcion = new Recepcion();
        recepcion.setId(1L);
        recepcion.setTrackingId("TRK-1");
        recepcion.setRecurso("Agua");
        recepcion.setCantidad(10);
        recepcion.setEstado("Pendiente");

        assertEquals(1L, recepcion.getId());
        assertEquals("TRK-1", recepcion.getTrackingId());
        assertEquals("Agua", recepcion.getRecurso());
        assertEquals(10, recepcion.getCantidad());
        assertEquals("Pendiente", recepcion.getEstado());

        Recepcion rec2 = new Recepcion("TRK-2", "Comida", 40, "Recibido");
        assertEquals("TRK-2", rec2.getTrackingId());
    }

    @Test
    void testConsumoInventarioRequest() {
        ConsumoInventarioRequest request = new ConsumoInventarioRequest();
        request.setRecurso("Agua");
        request.setCantidad(10);

        assertEquals("Agua", request.getRecurso());
        assertEquals(10, request.getCantidad());
        
        ConsumoInventarioRequest req2 = new ConsumoInventarioRequest("Agua", 10);
        assertEquals("Agua", req2.getRecurso());
    }

    @Test
    void testDespachoRequestDTO() {
        DespachoRequestDTO dto = new DespachoRequestDTO();
        dto.setInventarioId(1L);
        dto.setCantidad(10);
        dto.setVehiculo("Furgon");
        LocalDateTime now = LocalDateTime.now();
        dto.setHorario(now);

        assertEquals(1L, dto.getInventarioId());
        assertEquals(10, dto.getCantidad());
        assertEquals("Furgon", dto.getVehiculo());
        assertEquals(now, dto.getHorario());
        
        DespachoRequestDTO dto2 = new DespachoRequestDTO(2L, 20, "Camion", now);
        assertEquals("Camion", dto2.getVehiculo());
    }

    @Test
    void testDonacionEventDTO() {
        DonacionEventDTO dto = new DonacionEventDTO();
        dto.setId(1L);
        dto.setRecursos("Ropa");
        dto.setOrigen("Casa");
        dto.setEstado("Pendiente");
        dto.setTrackingId("TRK-123");

        assertEquals(1L, dto.getId());
        assertEquals("Ropa", dto.getRecursos());
        assertEquals("Casa", dto.getOrigen());
        assertEquals("Pendiente", dto.getEstado());
        assertEquals("TRK-123", dto.getTrackingId());
    }
}
