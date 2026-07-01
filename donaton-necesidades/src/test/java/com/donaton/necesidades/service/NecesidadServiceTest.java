package com.donaton.necesidades.service;

import com.donaton.necesidades.dto.NecesidadRequestDTO;
import com.donaton.necesidades.entity.HistorialNecesidad;
import com.donaton.necesidades.entity.Necesidad;
import com.donaton.necesidades.repository.HistorialNecesidadRepository;
import com.donaton.necesidades.repository.NecesidadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NecesidadServiceTest {

    @Mock
    private NecesidadRepository necesidadRepository;

    @Mock
    private HistorialNecesidadRepository historialNecesidadRepository;

    @InjectMocks
    private NecesidadService necesidadService;

    private Necesidad necesidad;

    @BeforeEach
    void setUp() {
        necesidad = new Necesidad("[{\"categoria\":\"Agua\",\"cantidad\":10}]", -33.4, -70.6, null, "RM", "Santiago", "Incendio");
        necesidad.setId(1L);
    }

    @Test
    void testReportarNecesidad() {
        NecesidadRequestDTO request = new NecesidadRequestDTO();
        request.setRecursos("[{\"categoria\":\"Agua\",\"cantidad\":10}]");
        request.setLatitud(-33.4);
        request.setLongitud(-70.6);
        request.setRegion("RM");
        request.setComuna("Santiago");
        request.setTipoEmergencia("Incendio");
        request.setCoordinadorId(5L);

        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidad);

        Necesidad resultado = necesidadService.reportarNecesidad(request);

        assertNotNull(resultado);
        assertEquals("RM", resultado.getRegion());
        verify(necesidadRepository, times(1)).save(any(Necesidad.class));
    }

    @Test
    void testObtenerTodas() {
        when(necesidadRepository.findAll()).thenReturn(List.of(necesidad));

        List<Necesidad> resultado = necesidadService.obtenerTodas();

        assertEquals(1, resultado.size());
    }

    @Test
    void testActualizarEstado_NoCubierta() {
        when(necesidadRepository.findById(1L)).thenReturn(Optional.of(necesidad));
        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidad);

        Necesidad resultado = necesidadService.actualizarEstado(1L, "En progreso", "10", "20");

        assertEquals("En progreso", resultado.getEstado());
        assertEquals(10L, resultado.getCentroAcopioId());
        assertEquals(20L, resultado.getConductorId());
        verify(historialNecesidadRepository, never()).save(any());
    }

    @Test
    void testActualizarEstado_Cubierta() {
        when(necesidadRepository.findById(1L)).thenReturn(Optional.of(necesidad));
        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidad);

        Necesidad resultado = necesidadService.actualizarEstado(1L, "Cubierta", "10", null);

        assertEquals("Cubierta", resultado.getEstado());
        
        // Verifica que se crea historial
        ArgumentCaptor<HistorialNecesidad> captor = ArgumentCaptor.forClass(HistorialNecesidad.class);
        verify(historialNecesidadRepository, times(1)).save(captor.capture());
        
        HistorialNecesidad historial = captor.getValue();
        assertEquals(1L, historial.getNecesidadId());
        assertEquals("Agua", historial.getCategoria());
        assertEquals(10.0, historial.getCantidad());
    }

    @Test
    void testActualizarEstado_Cubierta_BadJson() {
        necesidad.setRecursos("invalid json");
        when(necesidadRepository.findById(1L)).thenReturn(Optional.of(necesidad));
        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidad);

        Necesidad resultado = necesidadService.actualizarEstado(1L, "Cubierta", "10", null);

        assertEquals("Cubierta", resultado.getEstado());
        // Se traga la excepción pero no explota
        verify(historialNecesidadRepository, never()).save(any());
    }

    @Test
    void testActualizarEstado_NotFound() {
        when(necesidadRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            necesidadService.actualizarEstado(1L, "Cubierta", "10", null);
        });
    }

    @Test
    void testObtenerHistorial() {
        HistorialNecesidad h = new HistorialNecesidad();
        when(historialNecesidadRepository.findAll()).thenReturn(List.of(h));

        List<HistorialNecesidad> resultado = necesidadService.obtenerHistorial();

        assertEquals(1, resultado.size());
    }

    @Test
    void testActualizarEstado_Cubierta_DefaultsAndNullCentro() {
        // Test missing fields to trigger default values and null centroAcopio
        necesidad.setRecursos("[{}]"); 
        when(necesidadRepository.findById(1L)).thenReturn(Optional.of(necesidad));
        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidad);

        Necesidad resultado = necesidadService.actualizarEstado(1L, "Cubierta", "", "");

        assertEquals("Cubierta", resultado.getEstado());
        
        ArgumentCaptor<HistorialNecesidad> captor = ArgumentCaptor.forClass(HistorialNecesidad.class);
        verify(historialNecesidadRepository, times(1)).save(captor.capture());
        
        HistorialNecesidad historial = captor.getValue();
        assertEquals("Recurso general", historial.getCategoria());
        assertEquals(1.0, historial.getCantidad());
        assertEquals("u.", historial.getUnidad());
        assertNull(historial.getCentroAcopioId());
    }

    @Test
    void testActualizarEstado_Cubierta_GeneraHistorial() {
        Necesidad necesidadLocal = new Necesidad();
        necesidadLocal.setId(1L);
        necesidadLocal.setEstado("Pendiente");
        necesidadLocal.setRecursos("[{\"categoria\":\"Agua\",\"cantidad\":10,\"unidad\":\"L\"}, {\"categoria\":\"Ropa\",\"cantidad\":5}]");

        when(necesidadRepository.findById(1L)).thenReturn(Optional.of(necesidadLocal));
        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidadLocal);

        Necesidad resultado = necesidadService.actualizarEstado(1L, "Cubierta", null, null);

        assertEquals("Cubierta", resultado.getEstado());
        verify(historialNecesidadRepository, times(2)).save(any(HistorialNecesidad.class));
    }

    @Test
    void testActualizarEstado_Cubierta_NotArray() {
        // Test JSON that is an object instead of array
        necesidad.setRecursos("{\"categoria\":\"Agua\",\"cantidad\":10}");
        when(necesidadRepository.findById(1L)).thenReturn(Optional.of(necesidad));
        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidad);

        Necesidad resultado = necesidadService.actualizarEstado(1L, "Cubierta", null, null);

        assertEquals("Cubierta", resultado.getEstado());
        verify(historialNecesidadRepository, never()).save(any());
    }

    @Test
    void testActualizarEstado_Cubierta_NullCentroAndConductor() {
        when(necesidadRepository.findById(1L)).thenReturn(Optional.of(necesidad));
        when(necesidadRepository.save(any(Necesidad.class))).thenReturn(necesidad);

        Necesidad resultado = necesidadService.actualizarEstado(1L, "Cubierta", null, null);

        assertEquals("Cubierta", resultado.getEstado());
        
        ArgumentCaptor<HistorialNecesidad> captor = ArgumentCaptor.forClass(HistorialNecesidad.class);
        verify(historialNecesidadRepository, times(1)).save(captor.capture());
        
        HistorialNecesidad historial = captor.getValue();
        assertNull(historial.getCentroAcopioId());
        assertEquals(10.0, historial.getCantidad());
    }
}
