package com.gastos.casa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "O nome da categoria é obrigatório")
        @Size(max = 60, message = "O nome pode ter no máximo 60 caracteres")
        String nome,

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "A cor deve estar no formato #RRGGBB")
        String cor,

        @Size(max = 40, message = "O ícone pode ter no máximo 40 caracteres")
        String icone
) {}