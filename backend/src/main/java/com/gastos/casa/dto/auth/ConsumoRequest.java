package com.gastos.casa.dto;

import java.time.LocalDate;

// dataFimConsumo = null reabre o consumo (volta a "em uso")
public record ConsumoRequest(LocalDate dataFimConsumo) {}