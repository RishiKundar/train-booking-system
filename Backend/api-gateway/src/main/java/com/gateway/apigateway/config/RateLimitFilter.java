package com.gateway.apigateway.config;


import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Slf4j
@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createBucket(){

        Bandwidth limit = Bandwidth.classic(20, Refill.greedy(20, Duration.ofMinutes(1)));

        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(ServerWebExchange exchange){
        String forwardedFor = exchange.getRequest()
                .getHeaders().getFirst("X-Forwarded-For");

        if(forwardedFor != null && !forwardedFor.isBlank()){
            return forwardedFor.split(",")[0].trim();
        }

        if(exchange.getRequest().getRemoteAddress() != null){
            return exchange.getRequest().getRemoteAddress().getAddress().getHostAddress();
        }

        return "unknown";
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        String clientIp = getClientIp(exchange);

        Bucket bucket = buckets.computeIfAbsent(clientIp, ip -> createBucket());

        if(bucket.tryConsume(1)){
            long remaining = bucket.getAvailableTokens();
            exchange.getResponse().getHeaders().add("X-Rate-Limit-Remaining", String.valueOf(remaining));
            return chain.filter(exchange);
        }

        log.warn("Rate limit exceeded for Ip: {}", clientIp);
        exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        exchange.getResponse().getHeaders().add("X-Rate-Limit-Retry-After-Seconds","60");
        exchange.getResponse().getHeaders().add("Content-Type","application/json");


        byte[] body = """
                {
                "status":429,
                "error":"TOO_MANY_REQUEST,
                "message":"Rate Limit Exceeded. Try again in 60 seconds
                }
                """.getBytes();

        var buffer = exchange.getResponse().bufferFactory().wrap(body);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
