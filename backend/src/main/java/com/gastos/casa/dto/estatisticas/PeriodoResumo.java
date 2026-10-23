package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PeriodoResumo(
        LocalDate de,
        LocalDate ate,
        BigDecimal total,
        long compras
) {}