package com.donaton.donaton_api_gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;
import org.springframework.web.servlet.function.RequestPredicates;

import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions;

@Configuration
public class GatewayConfig {

    @Bean(name = "donatonBffRoute")
    public RouterFunction<ServerResponse> bffRoute() {
        return GatewayRouterFunctions.route("donaton_bff_route")
            .route(RequestPredicates.path("/api/**"), HandlerFunctions.http())
            .filter(LoadBalancerFilterFunctions.lb("donaton-bff"))
            .build();
    }
}
