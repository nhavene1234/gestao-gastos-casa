package com.gastos.casa.dto.auth;

public record AuthResponse(
        String token,
        String tipo,
        Long id,
        String nome,
        String email,
        String papel
) {}