package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;
import java.util.List;

public record ComparacaoAnualResponse(
        int ano,
        int anoAnterior,
        BigDecimal totalAno,
        BigDecimal totalAnoAnterior,
        BigDecimal variacaoPercentual,
        List<ComparacaoMes> meses
) {}