package com.gastos.casa.service;

import com.gastos.casa.dto.CategoriaRequest;
import com.gastos.casa.dto.CategoriaResponse;
import com.gastos.casa.exception.Erros;
import com.gastos.casa.model.Categoria;
import com.gastos.casa.repository.CategoriaRepository;
import com.gastos.casa.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// Categorias padrão do sistema (utilizador nulo), visíveis para todos
@Service
public class AdminCategoriaService {

    private static final String COR_PADRAO = "#64748B";
    private static final String ICONE_PADRAO = "tag";

    private final CategoriaRepository categorias;
    private final ProdutoRepository produtos;

    public AdminCategoriaService(CategoriaRepository categorias, ProdutoRepository produtos) {
        this.categorias = categorias;
        this.produtos = produtos;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categorias.findByUtilizadorIsNullOrderByNome().stream()
                .map(this::paraResposta).toList();
    }

    @Transactional
    public CategoriaResponse criar(CategoriaRequest req) {
        String nome = req.nome().trim();
        if (categorias.existsByUtilizadorIsNullAndNomeIgnoreCaseAndIdNot(nome, 0L)) {
            throw Erros.conflito("Já existe uma categoria padrão com este nome");
        }

        Categoria c = new Categoria();   // utilizador nulo = categoria padrão
        c.setNome(nome);
        c.setCor(valorOu(req.cor(), COR_PADRAO));
        c.setIcone(valorOu(req.icone(), ICONE_PADRAO));
        return paraResposta(categorias.save(c));
    }

    @Transactional
    public CategoriaResponse atualizar(Long id, CategoriaRequest req) {
        Categoria c = buscar(id);
        String nome = req.nome().trim();

        if (categorias.existsByUtilizadorIsNullAndNomeIgnoreCaseAndIdNot(nome, id)) {
            throw Erros.conflito("Já existe uma categoria padrão com este nome");
        }

        c.setNome(nome);
        c.setCor(valorOu(req.cor(), c.getCor()));
        c.setIcone(valorOu(req.icone(), c.getIcone()));
        return paraResposta(c);
    }

        @Transactional
    public void remover(Long id) {
        Categoria c = buscar(id);

        if (produtos.categoriaTemCompras(id)) {
            throw Erros.conflito("Há compras de utilizadores nesta categoria");
        }

        produtos.apagarPorCategoria(id);   // produtos de utilizadores que ficaram sem compras
        categorias.delete(c);
    }

    private Categoria buscar(Long id) {
        return categorias.findByIdAndUtilizadorIsNull(id)
                .orElseThrow(() -> Erros.naoEncontrado("Categoria padrão não encontrada"));
    }

    private String valorOu(String valor, String padrao) {
        return (valor == null || valor.isBlank()) ? padrao : valor.trim();
    }

    private CategoriaResponse paraResposta(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNome(), c.getCor(), c.getIcone(), true);
    }
}