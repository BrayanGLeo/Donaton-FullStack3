package com.donaton.necesidades.service;

import com.donaton.necesidades.dto.NecesidadRequestDTO;
import com.donaton.necesidades.entity.Necesidad;
import com.donaton.necesidades.repository.NecesidadRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NecesidadServiceTest {

    @Mock
    private NecesidadRepository necesidadRepository;

    @InjectMocks
    private NecesidadService necesidadService;

    @Test
    void testReportarNecesidad() {
        NecesidadRequestDTO request = new NecesidadRequestDTO("Alimentos", -33.0, -70.0);
        
        Necesidad mockNecesidad = new Necesidad("Alimentos", -33.0, -70.0, LocalDateTime.now());
        mockNecesidad.setId(10L);

        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(mockNecesidad);

        Necesidad resultado = necesidadService.reportarNecesidad(request);

        assertNotNull(resultado);
        assertEquals(10L, resultado.getId());
        assertEquals("Alimentos", resultado.getRecursos());
        assertEquals(-33.0, resultado.getLatitud());
        assertEquals(-70.0, resultado.getLongitud());
        
        verify(necesidadRepository, times(1)).save(any(Necesidad.class));
    }
}
