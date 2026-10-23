package com.gastos.casa.dto;

import java.time.LocalDateTime;

public record NotificacaoResponse(
        Long id,
        String tipo,
        String titulo,
        String mensagem,
        boolean lida,
        LocalDateTime criadoEm,
        String referencia
) {}