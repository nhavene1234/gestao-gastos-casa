package com.gastos.casa.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

// Indicar produtoId (produto existente)
// OU produtoNome + categoriaId (produto novo, criado automaticamente).
public record CompraRequest(
        Long produtoId,

        @Size(max = 120, message = "O nome do produto pode ter no máximo 120 caracteres")
        String produtoNome,

        Long categoriaId,

        @NotNull(message = "A quantidade é obrigatória")
        @DecimalMin(value = "0.01", message = "A quantidade deve ser maior que zero")
        @DecimalMax(value = "9999.99", message = "A quantidade máxima é 9999,99")
        @Digits(integer = 4, fraction = 2, message = "A quantidade só pode ter 2 casas decimais")
        BigDecimal quantidade,

        @NotNull(message = "O preço unitário é obrigatório")
        @DecimalMin(value = "0.01", message = "O preço deve ser maior que zero")
        @DecimalMax(value = "999999.99", message = "O preço unitário máximo é 999999,99")
        @Digits(integer = 6, fraction = 2, message = "O preço só pode ter 2 casas decimais")
        BigDecimal precoUnitario,

        @NotNull(message = "A data da compra é obrigatória")
        LocalDate dataCompra,

        @Size(max = 255, message = "As notas podem ter no máximo 255 caracteres")
        String notas
) {}