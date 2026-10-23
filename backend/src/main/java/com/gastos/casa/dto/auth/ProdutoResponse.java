package com.gastos.casa.dto;

public record ProdutoResponse(
        Long id,
        String nome,
        Long categoriaId,
        String categoriaNome,
        String categoriaCor
) {}