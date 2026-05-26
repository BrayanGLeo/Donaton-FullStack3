package com.donaton.logistica.service;

import com.donaton.logistica.dto.DonacionEventDTO;
import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.repository.InventarioRepository;
import com.donaton.logistica.entity.Recepcion;
import com.donaton.logistica.repository.RecepcionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogisticaServiceTest {

    @Mock
    private InventarioRepository inventarioRepository;

    @Mock
    private RecepcionRepository recepcionRepository;

    private LogisticaService logisticaService;

    private DonacionEventDTO donacionEventDTO;

    @BeforeEach
    void setUp() {
        logisticaService = new LogisticaService(inventarioRepository, recepcionRepository);
        donacionEventDTO = new DonacionEventDTO();
        donacionEventDTO.setId(1L);
        donacionEventDTO.setRecurso("Agua");
        donacionEventDTO.setCantidad(50);
        donacionEventDTO.setOrigen("Centro");
        donacionEventDTO.setEstado("Completado");
    }

    @Test
    void testProcesarDonacion() {
        // Act
        logisticaService.procesarDonacion(donacionEventDTO);

        // Assert
        ArgumentCaptor<Recepcion> recepcionCaptor = ArgumentCaptor.forClass(Recepcion.class);
        verify(recepcionRepository, times(1)).save(recepcionCaptor.capture());
        
        Recepcion recepcionGuardada = recepcionCaptor.getValue();
        assertEquals("TRK-DON-1", recepcionGuardada.getTrackingId());
        assertEquals("Agua", recepcionGuardada.getRecurso());
        assertEquals(50, recepcionGuardada.getCantidad());
        assertEquals("Pendiente de recepción", recepcionGuardada.getEstado());
    }

    @Test
    void testConfirmarIngresoExitoso() {
        // Arrange
        Recepcion recepcion = new Recepcion("TRK-DON-1", "Agua", 50, "Pendiente de recepción");
        when(recepcionRepository.findByTrackingId("TRK-DON-1")).thenReturn(Optional.of(recepcion));
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.empty());

        // Act
        Recepcion result = logisticaService.confirmarIngreso("TRK-DON-1");

        // Assert
        assertEquals("Disponible", result.getEstado());
        verify(recepcionRepository, times(1)).save(recepcion);
        
        ArgumentCaptor<Inventario> inventarioCaptor = ArgumentCaptor.forClass(Inventario.class);
        verify(inventarioRepository, times(1)).save(inventarioCaptor.capture());
        assertEquals("Agua", inventarioCaptor.getValue().getRecurso());
        assertEquals(50, inventarioCaptor.getValue().getCantidadTotal());
    }

    @Test
    void testConfirmarIngresoExitosoInventarioExistente() {
        // Arrange
        Recepcion recepcion = new Recepcion("TRK-DON-1", "Agua", 50, "Pendiente de recepción");
        Inventario inventarioExistente = new Inventario("Agua", 100);
        when(recepcionRepository.findByTrackingId("TRK-DON-1")).thenReturn(Optional.of(recepcion));
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.of(inventarioExistente));

        // Act
        Recepcion result = logisticaService.confirmarIngreso("TRK-DON-1");

        // Assert
        assertEquals("Disponible", result.getEstado());
        verify(recepcionRepository, times(1)).save(recepcion);
        
        ArgumentCaptor<Inventario> inventarioCaptor = ArgumentCaptor.forClass(Inventario.class);
        verify(inventarioRepository, times(1)).save(inventarioCaptor.capture());
        assertEquals("Agua", inventarioCaptor.getValue().getRecurso());
        assertEquals(150, inventarioCaptor.getValue().getCantidadTotal());
    }

    @Test
    void testConfirmarIngresoYaConfirmado() {
        // Arrange
        Recepcion recepcion = new Recepcion("TRK-DON-1", "Agua", 50, "Disponible");
        when(recepcionRepository.findByTrackingId("TRK-DON-1")).thenReturn(Optional.of(recepcion));

        // Act
        Recepcion result = logisticaService.confirmarIngreso("TRK-DON-1");

        // Assert
        assertEquals("Disponible", result.getEstado());
        verify(recepcionRepository, never()).save(any(Recepcion.class));
        verify(inventarioRepository, never()).save(any(Inventario.class));
    }

    @Test
    void testConfirmarIngresoFallaDonacionNoEncontrada() {
        // Arrange
        when(recepcionRepository.findByTrackingId("INVALID")).thenReturn(Optional.empty());

        // Act & Assert
        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            logisticaService.confirmarIngreso("INVALID");
        });

        assertEquals("Donación no encontrada", exception.getMessage());
        verify(recepcionRepository, never()).save(any(Recepcion.class));
        verify(inventarioRepository, never()).save(any(Inventario.class));
    }
}
