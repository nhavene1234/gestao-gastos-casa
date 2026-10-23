package com.gastos.casa.dto.admin;

import com.gastos.casa.model.Papel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AtualizarUtilizadorRequest(
        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 100, message = "O nome pode ter no máximo 100 caracteres")
        String nome,

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Email inválido")
        @Size(max = 120, message = "O email pode ter no máximo 120 caracteres")
        String email,

        @NotNull(message = "O papel é obrigatório (ADMIN ou UTILIZADOR)")
        Papel papel
) {}