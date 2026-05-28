package com.donaton.logistica.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SuppressWarnings("all")
public class RabbitMQConfig {

    @Bean
    public Queue donacionCreadaQueue() {
        return new Queue("donacion_creada_queue", true);
    }

    @Bean
    public Queue donacionRecibidaQueue() {
        return new Queue("donacion_recibida_queue", true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
