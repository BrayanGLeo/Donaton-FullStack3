package com.donaton.necesidades;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class DonatonNecesidadesApplicationTests {

    @Test
    void contextLoads() {
        DonatonNecesidadesApplication.main(new String[]{});
    }
}
