package com.donaton.donaton_donaciones.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SuppressWarnings("all")
public class RabbitMQConfig {

    public static final String QUEUE = "donacion_creada_queue";
    public static final String QUEUE_RECIBIDA = "donacion_recibida_queue";
    public static final String EXCHANGE = "donaton_exchange";
    public static final String ROUTING_KEY = "donacion.routing.key";
    public static final String ROUTING_KEY_RECIBIDA = "donacion.recibida.routing.key";

    @Bean
    public Queue donacionQueue() {
        return new Queue(QUEUE, true);
    }

    @Bean
    public Queue donacionRecibidaQueue() {
        return new Queue(QUEUE_RECIBIDA, true);
    }

    @Bean
    public TopicExchange donacionExchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Binding binding(Queue donacionQueue, TopicExchange donacionExchange) {
        return BindingBuilder.bind(donacionQueue).to(donacionExchange).with(ROUTING_KEY);
    }

    @Bean
    public Binding bindingRecibida(Queue donacionRecibidaQueue, TopicExchange donacionExchange) {
        return BindingBuilder.bind(donacionRecibidaQueue).to(donacionExchange).with(ROUTING_KEY_RECIBIDA);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}