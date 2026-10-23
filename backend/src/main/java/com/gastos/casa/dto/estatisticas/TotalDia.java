package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TotalDia(LocalDate data, BigDecimal total, Long compras) {}