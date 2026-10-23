package com.gastos.casa.dto.admin;

import java.time.LocalDateTime;

public record UtilizadorAdminResponse(
        Long id,
        String nome,
        String email,
        String papel,
        boolean ativo,
        LocalDateTime criadoEm
) {}