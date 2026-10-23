package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;

// mediaHabitual, diferencaMedia e variacaoMediaPercentual são nulos
// quando não há histórico suficiente
public record ComparacaoMesResponse(
        int ano,
        int mes,
        String nomeMes,
        BigDecimal total,
        long compras,
        BigDecimal mediaHabitual,
        BigDecimal diferencaMedia,
        BigDecimal variacaoMediaPercentual,
        boolean acimaDaMedia,
        ReferenciaMes mesAnterior,
        ReferenciaMes mesmoMesAnoAnterior
) {}