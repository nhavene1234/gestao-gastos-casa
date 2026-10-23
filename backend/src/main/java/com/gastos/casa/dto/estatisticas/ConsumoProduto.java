package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ConsumoProduto(
        Long produtoId,
        String produtoNome,
        String categoriaNome,
        String categoriaCor,
        int comprasConcluidas,
        BigDecimal diasMedios,
        long diasMinimo,
        long diasMaximo,
        LocalDate ultimaCompra
) {}