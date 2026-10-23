package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;

public record GastoCategoria(
        Long categoriaId,
        String categoriaNome,
        String cor,
        BigDecimal total,
        Long compras,
        BigDecimal percentagem
) {}