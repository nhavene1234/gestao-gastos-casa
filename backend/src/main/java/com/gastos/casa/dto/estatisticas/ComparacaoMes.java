package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;

public record ComparacaoMes(int mes, String nomeMes, BigDecimal atual, BigDecimal anterior) {}