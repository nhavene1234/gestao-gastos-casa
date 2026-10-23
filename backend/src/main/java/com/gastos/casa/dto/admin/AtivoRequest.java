package com.gastos.casa.dto.admin;

import jakarta.validation.constraints.NotNull;

public record AtivoRequest(
        @NotNull(message = "Indique se a conta fica ativa (true) ou desativada (false)")
        Boolean ativo
) {}