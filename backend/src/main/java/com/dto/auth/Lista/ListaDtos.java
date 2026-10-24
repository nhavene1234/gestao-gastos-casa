package com.gastos.casa.dto.lista;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class ListaDtos {

    private ListaDtos() {}

    // ---------- pedidos ----------

    public record ListaRequest(
            @NotBlank(message = "O título da lista é obrigatório")
            @Size(max = 100, message = "O título pode ter no máximo 100 caracteres")
            String titulo,

            @NotNull(message = "O dia das compras é obrigatório")
            LocalDate dataPrevista
    ) {}

    public record ItemRequest(
            @NotBlank(message = "O nome do item é obrigatório")
            @Size(max = 120, message = "O nome pode ter no máximo 120 caracteres")
            String nome,

            @NotNull(message = "A quantidade é obrigatória")
            @DecimalMin(value = "0.01", message = "A quantidade deve ser maior que zero")
            @DecimalMax(value = "9999.99", message = "A quantidade máxima é 9999,99")
            @Digits(integer = 4, fraction = 2, message = "A quantidade só pode ter 2 casas decimais")
            BigDecimal quantidade,

            @DecimalMin(value = "0.01", message = "O preço estimado deve ser maior que zero")
            @DecimalMax(value = "999999.99", message = "O preço máximo é 999999,99")
            @Digits(integer = 6, fraction = 2, message = "O preço só pode ter 2 casas decimais")
            BigDecimal precoEstimado,

            Long categoriaId
    ) {}

    public record CompradoRequest(
            @NotNull(message = "Indique se o item foi comprado")
            Boolean comprado
    ) {}

    public record RegistarItemRequest(
            @NotNull(message = "Item em falta")
            Long itemId,

            @NotNull(message = "Escolha a categoria de cada item")
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
            BigDecimal precoUnitario
    ) {}

    public record RegistarRequest(
            @NotNull(message = "A data da compra é obrigatória")
            LocalDate dataCompra,

            @NotEmpty(message = "Escolha pelo menos um item")
            @Valid
            List<RegistarItemRequest> itens
    ) {}

    // ---------- respostas ----------

    public record ItemResponse(
            Long id,
            String nome,
            BigDecimal quantidade,
            BigDecimal precoEstimado,
            BigDecimal totalEstimado,
            Long categoriaId,
            String categoriaNome,
            String categoriaCor,
            boolean comprado,
            boolean registado
    ) {}

    public record ListaResponse(
            Long id,
            String titulo,
            LocalDate dataPrevista,
            List<ItemResponse> itens,
            int totalItens,
            int itensComprados,
            int itensRegistados,
            int itensSemPreco,
            BigDecimal totalEstimado
    ) {}

    public record RegistarResponse(int registadas, ListaResponse lista) {}
}