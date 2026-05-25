package com.donaton.logistica.service;

import com.donaton.logistica.dto.DespachoRequestDTO;
import com.donaton.logistica.entity.Despacho;
import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.repository.DespachoRepository;
import com.donaton.logistica.repository.InventarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DespachoServiceTest {

    @Mock
    private InventarioRepository inventarioRepository;

    @Mock
    private DespachoRepository despachoRepository;

    @InjectMocks
    private DespachoService despachoService;

    private DespachoRequestDTO request;
    private Inventario inventario;

    @BeforeEach
    void setUp() {
        request = new DespachoRequestDTO();
        request.setInventarioId(1L);
        request.setCantidad(50);
        request.setVehiculo("Camion A");
        request.setHorario(LocalDateTime.now().plusDays(1));

        inventario = new Inventario();
        inventario.setId(1L);
        inventario.setRecurso("Agua");
        inventario.setCantidadTotal(100);
    }

    @Test
    void testAsignarTransporteExitoso() {
        when(inventarioRepository.findById(1L)).thenReturn(Optional.of(inventario));
        when(despachoRepository.existsByVehiculoAndHorario(request.getVehiculo(), request.getHorario())).thenReturn(false);
        
        Despacho despachoGuardado = new Despacho(1L, 50, "Camion A", request.getHorario(), "En tránsito");
        when(despachoRepository.save(any(Despacho.class))).thenReturn(despachoGuardado);

        Despacho resultado = despachoService.asignarTransporte(request);

        assertNotNull(resultado);
        assertEquals("En tránsito", resultado.getEstado());
        assertEquals(50, inventario.getCantidadTotal()); // 100 - 50 = 50
        
        verify(inventarioRepository, times(1)).save(inventario);
        verify(despachoRepository, times(1)).save(any(Despacho.class));
    }

    @Test
    void testAsignarTransporteFallaPorVehiculoOcupado() {
        when(inventarioRepository.findById(1L)).thenReturn(Optional.of(inventario));
        when(despachoRepository.existsByVehiculoAndHorario(request.getVehiculo(), request.getHorario())).thenReturn(true);

        IllegalStateException exception = assertThrows(IllegalStateException.class, () -> {
            despachoService.asignarTransporte(request);
        });

        assertEquals("Vehículo ya asignado en este horario", exception.getMessage());
        
        verify(inventarioRepository, never()).save(any(Inventario.class));
        verify(despachoRepository, never()).save(any(Despacho.class));
    }

    @Test
    void testAsignarTransporteFallaPorStockInsuficiente() {
        inventario.setCantidadTotal(10); // Inventory has 10, request is 50
        
        when(inventarioRepository.findById(1L)).thenReturn(Optional.of(inventario));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            despachoService.asignarTransporte(request);
        });

        assertEquals("Stock insuficiente o no validado", exception.getMessage());
        
        verify(despachoRepository, never()).existsByVehiculoAndHorario(anyString(), any(LocalDateTime.class));
        verify(inventarioRepository, never()).save(any(Inventario.class));
        verify(despachoRepository, never()).save(any(Despacho.class));
    }
}
