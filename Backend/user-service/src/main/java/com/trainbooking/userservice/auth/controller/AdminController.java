package com.trainbooking.userservice.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin-only endpoints. Requires ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @GetMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Admin access test",
        description = "A simple health-check endpoint to verify ADMIN role is correctly assigned and enforced."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "ADMIN access confirmed"),
        @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid"),
        @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required")
    })
    public String adminTest() {
        return "Admin is Here";
    }
}
