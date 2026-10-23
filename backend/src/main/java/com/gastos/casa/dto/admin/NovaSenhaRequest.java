package com.gastos.casa.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NovaSenhaRequest(
        @NotBlank(message = "A nova senha é obrigatória")
        @Size(min = 6, max = 72, message = "A senha deve ter entre 6 e 72 caracteres")
        String novaSenha
) {}