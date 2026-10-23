package com.gastos.casa.dto.estatisticas;

import java.time.LocalDate;

public record ResumoResponse(
        LocalDate data,
        PeriodoResumo dia,
        PeriodoResumo semana,
        PeriodoResumo mes,
        PeriodoResumo ano
) {}