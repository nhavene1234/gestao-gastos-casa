package com.gastos.casa.controller;

import com.gastos.casa.dto.auth.AuthResponse;
import com.gastos.casa.dto.auth.LoginRequest;
import com.gastos.casa.dto.auth.RegistoRequest;
import com.gastos.casa.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/registo")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registo(@Valid @RequestBody RegistoRequest req) {
        return authService.registar(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    // Devolve os dados do utilizador a partir do token
    @GetMapping("/eu")
    public Map<String, Object> eu(@AuthenticationPrincipal Jwt jwt) {
        return Map.of(
                "id", jwt.getClaim("id"),
                "nome", jwt.getClaimAsString("nome"),
                "email", jwt.getSubject(),
                "papel", jwt.getClaimAsString("papel")
        );
    }
}