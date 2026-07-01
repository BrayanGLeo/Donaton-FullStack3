package com.donaton.donaton_donaciones.config;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RabbitMQConfigTest {

    private final RabbitMQConfig config = new RabbitMQConfig();

    @Test
    void testDonacionQueue() {
        Queue queue = config.donacionQueue();
        assertNotNull(queue);
        assertEquals(RabbitMQConfig.QUEUE, queue.getName());
        assertTrue(queue.isDurable());
    }

    @Test
    void testDonacionRecibidaQueue() {
        Queue queue = config.donacionRecibidaQueue();
        assertNotNull(queue);
        assertEquals(RabbitMQConfig.QUEUE_RECIBIDA, queue.getName());
        assertTrue(queue.isDurable());
    }

    @Test
    void testDonacionExchange() {
        TopicExchange exchange = config.donacionExchange();
        assertNotNull(exchange);
        assertEquals(RabbitMQConfig.EXCHANGE, exchange.getName());
    }

    @Test
    void testBinding() {
        Queue queue = new Queue(RabbitMQConfig.QUEUE);
        TopicExchange exchange = new TopicExchange(RabbitMQConfig.EXCHANGE);
        Binding binding = config.binding(queue, exchange);
        
        assertNotNull(binding);
        assertEquals(RabbitMQConfig.QUEUE, binding.getDestination());
        assertEquals(RabbitMQConfig.EXCHANGE, binding.getExchange());
        assertEquals(RabbitMQConfig.ROUTING_KEY, binding.getRoutingKey());
    }

    @Test
    void testBindingRecibida() {
        Queue queue = new Queue(RabbitMQConfig.QUEUE_RECIBIDA);
        TopicExchange exchange = new TopicExchange(RabbitMQConfig.EXCHANGE);
        Binding binding = config.bindingRecibida(queue, exchange);
        
        assertNotNull(binding);
        assertEquals(RabbitMQConfig.QUEUE_RECIBIDA, binding.getDestination());
        assertEquals(RabbitMQConfig.EXCHANGE, binding.getExchange());
        assertEquals(RabbitMQConfig.ROUTING_KEY_RECIBIDA, binding.getRoutingKey());
    }

    @Test
    @SuppressWarnings({"removal"})
    void testJsonMessageConverter() {
        MessageConverter converter = config.jsonMessageConverter();
        assertNotNull(converter);
        assertEquals(Jackson2JsonMessageConverter.class, converter.getClass());
    }
}
