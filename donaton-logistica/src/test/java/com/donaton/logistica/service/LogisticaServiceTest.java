package com.donaton.logistica.service;

import com.donaton.logistica.dto.DonacionEventDTO;
import com.donaton.logistica.entity.Inventario;
import com.donaton.logistica.repository.InventarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LogisticaServiceTest {

    @Mock
    private InventarioRepository inventarioRepository;

    @InjectMocks
    private LogisticaService logisticaService;

    private DonacionEventDTO donacionEventDTO;

    @BeforeEach
    void setUp() {
        donacionEventDTO = new DonacionEventDTO();
        donacionEventDTO.setId(1L);
        donacionEventDTO.setRecurso("Agua");
        donacionEventDTO.setCantidad(50);
        donacionEventDTO.setOrigen("Centro");
        donacionEventDTO.setEstado("Completado");
    }

    @Test
    void testProcesarDonacion_RecursoNoExiste() {
        // Arrange
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.empty());

        // Act
        logisticaService.procesarDonacion(donacionEventDTO);

        // Assert
        ArgumentCaptor<Inventario> inventarioCaptor = ArgumentCaptor.forClass(Inventario.class);
        verify(inventarioRepository, times(1)).save(inventarioCaptor.capture());
        
        Inventario inventarioGuardado = inventarioCaptor.getValue();
        assertEquals("Agua", inventarioGuardado.getRecurso());
        assertEquals(50, inventarioGuardado.getCantidadTotal());
    }

    @Test
    void testProcesarDonacion_RecursoExiste() {
        // Arrange
        Inventario inventarioExistente = new Inventario("Agua", 100);
        when(inventarioRepository.findByRecurso("Agua")).thenReturn(Optional.of(inventarioExistente));

        // Act
        logisticaService.procesarDonacion(donacionEventDTO);

        // Assert
        ArgumentCaptor<Inventario> inventarioCaptor = ArgumentCaptor.forClass(Inventario.class);
        verify(inventarioRepository, times(1)).save(inventarioCaptor.capture());
        
        Inventario inventarioGuardado = inventarioCaptor.getValue();
        assertEquals("Agua", inventarioGuardado.getRecurso());
        assertEquals(150, inventarioGuardado.getCantidadTotal()); // 100 + 50
    }
}
