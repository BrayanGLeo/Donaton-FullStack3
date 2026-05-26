package com.donaton.logistica.controller;

import com.donaton.logistica.entity.Recepcion;
import com.donaton.logistica.service.LogisticaService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class IngresoControllerTest {

    @Mock
    private LogisticaService logisticaService;

    private IngresoController ingresoController;

    private Recepcion recepcion;

    @BeforeEach
    void setUp() {
        ingresoController = new IngresoController(logisticaService);
        recepcion = new Recepcion("TRK-DON-123", "Arroz", 20, "Disponible");
        recepcion.setId(1L);
    }

    @Test
    void testConfirmarIngreso_Exito() {
        when(logisticaService.confirmarIngreso("TRK-DON-123")).thenReturn(recepcion);

        ResponseEntity<Recepcion> response = ingresoController.confirmarIngreso("TRK-DON-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("TRK-DON-123", response.getBody().getTrackingId());
        assertEquals("Arroz", response.getBody().getRecurso());
        assertEquals(20, response.getBody().getCantidad());
        assertEquals("Disponible", response.getBody().getEstado());
    }

    @Test
    void testGlobalExceptionHandler() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();
        EntityNotFoundException ex = new EntityNotFoundException("Donación no encontrada");
        
        ResponseEntity<Map<String, String>> response = handler.handleEntityNotFoundException(ex);
        
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Donación no encontrada", response.getBody().get("error"));
    }
}
