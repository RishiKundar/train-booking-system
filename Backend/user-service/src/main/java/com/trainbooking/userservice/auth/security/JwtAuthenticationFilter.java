package com.trainbooking.userservice.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String X_USER_ID = "X-User-Id";
    private static final String X_USER_ROLES = "X-User-Roles";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestPath = request.getRequestURI();

        // Allow auth and internal endpoints through without requiring X-User-Id
        if (requestPath.startsWith("/api/auth/") || requestPath.startsWith("/api/users/internal/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = request.getHeader(X_USER_ID);

        if (userId == null || userId.isBlank()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Missing X-User-Id header");
            return;
        }

        // Parse roles forwarded by the gateway e.g. "ADMIN,USER"
        String rolesHeader = request.getHeader(X_USER_ROLES);
        List<SimpleGrantedAuthority> authorities;

        if (rolesHeader != null && !rolesHeader.isBlank()) {
            authorities = Arrays.stream(rolesHeader.split(","))
                    .map(String::trim)
                    .filter(r -> !r.isEmpty())
                    // hasRole("ADMIN") checks for "ROLE_ADMIN" — add prefix if not already present
                    .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        } else {
            authorities = List.of();
        }

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userId, null, authorities);

        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }
}
