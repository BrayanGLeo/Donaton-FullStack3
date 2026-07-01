package com.donaton.logistica.controller;

import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.service.DespachoService;
import com.donaton.logistica.service.LogisticaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventarioControllerTest {

    @Mock
    private DespachoService despachoService;

    @Mock
    private LogisticaService logisticaService;

    @Test
    void testObtenerInventario() {
        InventarioController controller = new InventarioController(despachoService, logisticaService);
        Inventario inv = new Inventario("Agua", 100);
        when(despachoService.obtenerInventario()).thenReturn(Collections.singletonList(inv));

        ResponseEntity<List<Inventario>> response = controller.obtenerInventario();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals("Agua", response.getBody().get(0).getRecurso());
    }

    @Test
    void testConsumirInventario() {
        InventarioController controller = new InventarioController(despachoService, logisticaService);
        Inventario inv = new Inventario("Agua", 50);
        when(logisticaService.consumirInventario("Agua", 50)).thenReturn(inv);

        com.donaton.logistica.dto.ConsumoInventarioRequest req = new com.donaton.logistica.dto.ConsumoInventarioRequest();
        req.setRecurso("Agua");
        req.setCantidad(50);

        ResponseEntity<Inventario> response = controller.consumirInventario(req);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(50, response.getBody().getCantidadTotal());
    }
}
