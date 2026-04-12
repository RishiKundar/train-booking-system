package com.gateway.apigateway.config;


import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Slf4j
@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    private static final String CORRELATIONAL_ID_HEADER = "X-Correlation-Id";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String correlationalId = exchange.getRequest().getHeaders().getFirst(CORRELATIONAL_ID_HEADER);

        if(correlationalId == null || correlationalId.isBlank()){
            correlationalId = UUID.randomUUID().toString();
        }

        final String finalCorrelationId = correlationalId;
        log.debug("Request [{}] -> {}", finalCorrelationId,exchange.getRequest().getURI().getPath());

        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .header(CORRELATIONAL_ID_HEADER,finalCorrelationId)
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    @Override
    public int getOrder() {
        return -2;
    }
}
