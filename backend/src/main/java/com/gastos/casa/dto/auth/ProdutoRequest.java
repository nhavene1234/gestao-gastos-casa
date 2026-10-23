package com.gastos.casa.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProdutoRequest(
        @NotBlank(message = "O nome do produto é obrigatório")
        @Size(max = 120, message = "O nome pode ter no máximo 120 caracteres")
        String nome,

        @NotNull(message = "A categoria é obrigatória")
        Long categoriaId
) {}