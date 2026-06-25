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
}
