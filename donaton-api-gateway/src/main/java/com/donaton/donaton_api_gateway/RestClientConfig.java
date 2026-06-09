package com.donaton.donaton_api_gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.cloud.gateway.server.mvc.config.GatewayMvcProperties;

@Configuration
public class RestClientConfig {

    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder().requestFactory(new JdkClientHttpRequestFactory());
    }
}
