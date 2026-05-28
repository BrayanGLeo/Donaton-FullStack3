package com.donaton.logistica.controller;

import com.donaton.logistica.dto.DespachoRequestDTO;
import com.donaton.logistica.entity.Despacho;
import com.donaton.logistica.service.DespachoService;
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
class DespachoControllerTest {

    @Mock
    private DespachoService despachoService;

    @Test
    void testAsignarTransporte() {
        DespachoController controller = new DespachoController(despachoService);
        DespachoRequestDTO req = new DespachoRequestDTO();
        Despacho resp = new Despacho();
        resp.setId(1L);
        when(despachoService.asignarTransporte(req)).thenReturn(resp);

        ResponseEntity<Despacho> response = controller.asignarTransporte(req);

        assertEquals(201, response.getStatusCode().value());
        assertEquals(1L, response.getBody().getId());
    }

    @Test
    void testObtenerDespachos() {
        DespachoController controller = new DespachoController(despachoService);
        Despacho resp = new Despacho();
        resp.setId(1L);
        when(despachoService.obtenerDespachos()).thenReturn(Collections.singletonList(resp));

        ResponseEntity<List<Despacho>> response = controller.obtenerDespachos();

        assertEquals(200, response.getStatusCode().value());
        assertEquals(1, response.getBody().size());
        assertEquals(1L, response.getBody().get(0).getId());
    }

    @Test
    void testConfirmarEntrega() {
        DespachoController controller = new DespachoController(despachoService);
        Despacho resp = new Despacho();
        when(despachoService.confirmarEntregaDespacho(1L)).thenReturn(resp);

        ResponseEntity<String> response = controller.confirmarEntrega(1L);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Despacho confirmado como Entregada exitosamente", response.getBody());
    }
}
