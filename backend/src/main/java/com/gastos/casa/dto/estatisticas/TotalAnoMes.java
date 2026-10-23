package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;

public record TotalAnoMes(Integer ano, Integer mes, BigDecimal total, Long compras) {}