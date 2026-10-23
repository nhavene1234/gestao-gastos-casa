package com.gastos.casa.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CompraResponse(
        Long id,
        Long produtoId,
        String produtoNome,
        Long categoriaId,
        String categoriaNome,
        String categoriaCor,
        BigDecimal quantidade,
        BigDecimal precoUnitario,
        BigDecimal precoTotal,
        LocalDate dataCompra,
        LocalDate dataFimConsumo,
        Long diasConsumo,
        String notas
) {}