package com.donaton.logistica.config;

import com.donaton.logistica.repository.CentroAcopioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.CommandLineRunner;

import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private CentroAcopioRepository repository;

    @InjectMocks
    private DataInitializer dataInitializer;

    @Test
    void testInitCentrosAcopio_Empty() throws Exception {
        when(repository.count()).thenReturn(0L);

        CommandLineRunner runner = dataInitializer.initCentrosAcopio(repository);
        runner.run();

        verify(repository, times(1)).deleteAll();
        verify(repository, times(1)).count();
        verify(repository, times(1)).saveAll(anyList());
    }

    @Test
    void testInitCentrosAcopio_NotEmpty() throws Exception {
        when(repository.count()).thenReturn(10L);

        CommandLineRunner runner = dataInitializer.initCentrosAcopio(repository);
        runner.run();

        verify(repository, times(1)).deleteAll();
        verify(repository, times(1)).count();
        verify(repository, times(0)).saveAll(anyList());
    }
}
