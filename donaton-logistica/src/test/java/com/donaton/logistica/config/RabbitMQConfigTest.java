package com.donaton.logistica.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RabbitMQConfigTest {

    private final RabbitMQConfig config = new RabbitMQConfig();

    @Test
    void testDonacionCreadaQueue() {
        Queue queue = config.donacionCreadaQueue();
        assertNotNull(queue);
        assertEquals("donacion_creada_queue", queue.getName());
        assertTrue(queue.isDurable());
    }

    @Test
    void testDonacionRecibidaQueue() {
        Queue queue = config.donacionRecibidaQueue();
        assertNotNull(queue);
        assertEquals("donacion_recibida_queue", queue.getName());
        assertTrue(queue.isDurable());
    }

    @Test
    @SuppressWarnings({"removal"})
    void testJsonMessageConverter() {
        MessageConverter converter = config.jsonMessageConverter();
        assertNotNull(converter);
        assertEquals(Jackson2JsonMessageConverter.class, converter.getClass());
    }
}
