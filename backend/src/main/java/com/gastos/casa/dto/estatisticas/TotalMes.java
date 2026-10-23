package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;

public record TotalMes(Integer mes, BigDecimal total, Long compras) {}