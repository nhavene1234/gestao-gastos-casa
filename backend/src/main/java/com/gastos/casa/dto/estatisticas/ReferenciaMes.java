package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;

// variacaoPercentual é nula quando o mês de referência não tem gastos
public record ReferenciaMes(
        int ano,
        int mes,
        String nomeMes,
        BigDecimal total,
        BigDecimal variacaoPercentual
) {}