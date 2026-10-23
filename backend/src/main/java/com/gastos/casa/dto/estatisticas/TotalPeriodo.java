package com.gastos.casa.dto.estatisticas;

import java.math.BigDecimal;

// Resultado direto da consulta (total é nulo quando não há compras)
public record TotalPeriodo(BigDecimal total, Long compras) {}