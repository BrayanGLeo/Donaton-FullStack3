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
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
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
        donacionEventDTO.setRecursos("[{\"recurso\":\"Agua\",\"cantidad\":50}]");
        donacionEventDTO.setOrigen("Centro");
        donacionEventDTO.setEstado("Completado");
    }

    @Test
    void testProcesarDonacion() {
        logisticaService.procesarDonacion(donacionEventDTO);

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
        Recepcion recepcion = new Recepcion("TRK-DON-1", "Agua", 50, "Pendiente de recepción");
        when(recepcionRepository.findByTrackingId("TRK-DON-1")).thenReturn(java.util.Collections.singletonList(recepcion));
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.empty());

        java.util.List<Recepcion> result = logisticaService.confirmarIngreso("TRK-DON-1");

        assertEquals("Disponible", result.get(0).getEstado());
        verify(recepcionRepository, times(1)).save(recepcion);
        
        ArgumentCaptor<Inventario> inventarioCaptor = ArgumentCaptor.forClass(Inventario.class);
        verify(inventarioRepository, times(1)).save(inventarioCaptor.capture());
        assertEquals("Agua", inventarioCaptor.getValue().getRecurso());
        assertEquals(50, inventarioCaptor.getValue().getCantidadTotal());
    }

    @Test
    void testConfirmarIngresoExitosoInventarioExistente() {
        Recepcion recepcion = new Recepcion("TRK-DON-1", "Agua", 50, "Pendiente de recepción");
        Inventario inventarioExistente = new Inventario("Agua", 100);
        when(recepcionRepository.findByTrackingId("TRK-DON-1")).thenReturn(java.util.Collections.singletonList(recepcion));
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.of(inventarioExistente));

        java.util.List<Recepcion> result = logisticaService.confirmarIngreso("TRK-DON-1");

        assertEquals("Disponible", result.get(0).getEstado());
        verify(recepcionRepository, times(1)).save(recepcion);
        
        ArgumentCaptor<Inventario> inventarioCaptor = ArgumentCaptor.forClass(Inventario.class);
        verify(inventarioRepository, times(1)).save(inventarioCaptor.capture());
        assertEquals("Agua", inventarioCaptor.getValue().getRecurso());
        assertEquals(150, inventarioCaptor.getValue().getCantidadTotal());
    }

    @Test
    void testConfirmarIngresoYaConfirmado() {
        Recepcion recepcion = new Recepcion("TRK-DON-1", "Agua", 50, "Disponible");
        when(recepcionRepository.findByTrackingId("TRK-DON-1")).thenReturn(java.util.Collections.singletonList(recepcion));

        java.util.List<Recepcion> result = logisticaService.confirmarIngreso("TRK-DON-1");

        assertEquals("Disponible", result.get(0).getEstado());
        verify(recepcionRepository, never()).save(any(Recepcion.class));
        verify(inventarioRepository, never()).save(any(Inventario.class));
    }

    @Test
    void testConfirmarIngresoFallaDonacionNoEncontrada() {
        when(recepcionRepository.findByTrackingId("INVALID")).thenReturn(java.util.Collections.emptyList());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () -> {
            logisticaService.confirmarIngreso("INVALID");
        });

        assertEquals("Donación no encontrada", exception.getMessage());
        verify(recepcionRepository, never()).save(any(Recepcion.class));
        verify(inventarioRepository, never()).save(any(Inventario.class));
    }

    @Test
    void testProcesarDonacionRecibidaExitoso() {
        Recepcion recepcion = new Recepcion("TRK-DON-1", "Agua", 50, "Pendiente de recepción");
        when(recepcionRepository.findByTrackingId("TRK-DON-1")).thenReturn(java.util.Collections.singletonList(recepcion));
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.empty());

        logisticaService.procesarDonacionRecibida(donacionEventDTO);

        assertEquals("Disponible", recepcion.getEstado());
        verify(recepcionRepository, times(1)).save(recepcion);
        verify(inventarioRepository, times(1)).save(any(Inventario.class));
    }

    @Test
    void testProcesarDonacionRecibidaConFalloYRecuperacion() {
        when(recepcionRepository.findByTrackingId("TRK-DON-1"))
                .thenReturn(java.util.Collections.emptyList())
                .thenReturn(java.util.Collections.singletonList(new Recepcion("TRK-DON-1", "Agua", 50, "Pendiente de recepción")));
        
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.empty());

        logisticaService.procesarDonacionRecibida(donacionEventDTO);

        ArgumentCaptor<Recepcion> recepcionCaptor = ArgumentCaptor.forClass(Recepcion.class);
        verify(recepcionRepository, times(2)).save(recepcionCaptor.capture());
        
        assertEquals("Disponible", recepcionCaptor.getAllValues().get(1).getEstado());
        verify(inventarioRepository, times(1)).save(any(Inventario.class));
    }

    @Test
    void testProcesarDonacionConErrorParsing() {
        donacionEventDTO.setRecursos("invalid-json");
        logisticaService.procesarDonacion(donacionEventDTO);
        verify(recepcionRepository, never()).save(any(Recepcion.class));
    }

    @Test
    void testProcesarDonacionSinRecursos() {
        donacionEventDTO.setRecursos(null);
        logisticaService.procesarDonacion(donacionEventDTO);
        verify(recepcionRepository, never()).save(any(Recepcion.class));
    }

    @Test
    void testConsumirInventarioExitoso() {
        Inventario inventario = new Inventario("Agua", 100);
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.of(inventario));
        when(inventarioRepository.save(any(Inventario.class))).thenReturn(inventario);

        Inventario resultado = logisticaService.consumirInventario("Agua", 20);
        assertEquals(80, resultado.getCantidadTotal());
        verify(inventarioRepository, times(1)).save(inventario);
    }

    @Test
    void testConsumirInventarioRecursoNoEncontrado() {
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> logisticaService.consumirInventario("Agua", 20));
    }

    @Test
    void testConsumirInventarioStockInsuficiente() {
        Inventario inventario = new Inventario("Agua", 10);
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.of(inventario));

        assertThrows(IllegalArgumentException.class, () -> logisticaService.consumirInventario("Agua", 20));
    }

    @Test
    void testProcesarDonacion_WithTrackingIdAndNullCantidad() {
        donacionEventDTO.setTrackingId("CUSTOM-TRK");
        donacionEventDTO.setRecursos("[{\"recurso\":\"Ropa\"}]"); // Sin cantidad

        logisticaService.procesarDonacion(donacionEventDTO);

        ArgumentCaptor<Recepcion> captor = ArgumentCaptor.forClass(Recepcion.class);
        verify(recepcionRepository, times(1)).save(captor.capture());
        
        assertEquals("CUSTOM-TRK", captor.getValue().getTrackingId());
        assertEquals(0, captor.getValue().getCantidad());
    }

    @Test
    void testProcesarDonacionRecibida_WithTrackingIdAndNullCantidad_Fails() {
        donacionEventDTO.setTrackingId("CUSTOM-TRK2");
        donacionEventDTO.setRecursos("[{\"recurso\":\"Ropa\"}]");
        
        Recepcion recepcionFalsa = new Recepcion("CUSTOM-TRK2", "Ropa", 0, "Pendiente de recepción");
        when(recepcionRepository.findByTrackingId("CUSTOM-TRK2"))
                .thenThrow(new RuntimeException("Simulated error")) // Trigger fallback
                .thenReturn(java.util.Collections.singletonList(recepcionFalsa)); // Segunda llamada exitosa

        logisticaService.procesarDonacionRecibida(donacionEventDTO);

        ArgumentCaptor<Recepcion> captor = ArgumentCaptor.forClass(Recepcion.class);
        verify(recepcionRepository, times(2)).save(captor.capture()); // 1 in fallback, 1 in doConfirmarIngreso
        assertEquals("CUSTOM-TRK2", captor.getAllValues().get(0).getTrackingId());
        assertEquals(0, captor.getAllValues().get(0).getCantidad());
    }

    @Test
    void testProcesarDonacionRecibida_NullRecursos() {
        donacionEventDTO.setTrackingId("CUSTOM-TRK3");
        donacionEventDTO.setRecursos(null);
        
        Recepcion recepcionFalsa = new Recepcion("CUSTOM-TRK3", "General", 1, "Recibida");
        when(recepcionRepository.findByTrackingId("CUSTOM-TRK3"))
                .thenThrow(new RuntimeException("Simulated error")) // Trigger fallback
                .thenReturn(java.util.Collections.singletonList(recepcionFalsa)); // Segunda llamada exitosa

        logisticaService.procesarDonacionRecibida(donacionEventDTO);
        verify(recepcionRepository, times(1)).save(any(Recepcion.class)); // Only called once by doConfirmarIngreso
    }

    @Test
    void testProcesarDonacionRecibida_FallbackFails() {
        donacionEventDTO.setTrackingId("CUSTOM-TRK4");
        donacionEventDTO.setRecursos("INVALID_JSON_TO_TRIGGER_CATCH"); // This will throw exception in ObjectMapper
        
        Recepcion recepcionFalsa = new Recepcion("CUSTOM-TRK4", "Ropa", 0, "Pendiente de recepción");
        when(recepcionRepository.findByTrackingId("CUSTOM-TRK4"))
                .thenThrow(new RuntimeException("Simulated error")) // Trigger fallback
                .thenReturn(java.util.Collections.singletonList(recepcionFalsa)); // Segunda llamada exitosa
        
        assertDoesNotThrow(() -> logisticaService.procesarDonacionRecibida(donacionEventDTO));
    }

    @Test
    void testConfirmarIngreso_RecepcionesNull() {
        when(recepcionRepository.findByTrackingId("INVALID2")).thenReturn(null);
        assertThrows(EntityNotFoundException.class, () -> logisticaService.confirmarIngreso("INVALID2"));
    }
}
