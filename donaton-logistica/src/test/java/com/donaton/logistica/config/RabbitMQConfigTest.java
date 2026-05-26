package com.donaton.logistica.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.MessageConverter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class RabbitMQConfigTest {

    @Test
    void testRabbitMQConfigBeans() {
        RabbitMQConfig config = new RabbitMQConfig();
        
        Queue queue = config.donacionCreadaQueue();
        assertNotNull(queue);
        assertEquals("donacion_creada_queue", queue.getName());
        
        MessageConverter converter = config.jsonMessageConverter();
        assertNotNull(converter);
    }
}
