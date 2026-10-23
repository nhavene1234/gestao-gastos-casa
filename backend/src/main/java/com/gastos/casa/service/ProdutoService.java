package com.gastos.casa.service;

import com.gastos.casa.dto.ProdutoRequest;
import com.gastos.casa.dto.ProdutoResponse;
import com.gastos.casa.exception.Erros;
import com.gastos.casa.model.Categoria;
import com.gastos.casa.model.Produto;
import com.gastos.casa.repository.CategoriaRepository;
import com.gastos.casa.repository.CompraRepository;
import com.gastos.casa.repository.ProdutoRepository;
import com.gastos.casa.repository.UtilizadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtos;
    private final CategoriaRepository categorias;
    private final CompraRepository compras;
    private final UtilizadorRepository utilizadores;

    public ProdutoService(ProdutoRepository produtos,
                          CategoriaRepository categorias,
                          CompraRepository compras,
                          UtilizadorRepository utilizadores) {
        this.produtos = produtos;
        this.categorias = categorias;
        this.compras = compras;
        this.utilizadores = utilizadores;
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponse> listar(Long uid) {
        return produtos.listarDoUtilizador(uid).stream().map(this::paraResposta).toList();
    }

    @Transactional
    public ProdutoResponse criar(Long uid, ProdutoRequest req) {
        Categoria cat = categorias.buscarVisivel(req.categoriaId(), uid)
                .orElseThrow(() -> Erros.naoEncontrado("Categoria não encontrada"));
        String nome = req.nome().trim();

        if (produtos.existsByUtilizadorIdAndCategoriaIdAndNomeIgnoreCaseAndIdNot(
                uid, cat.getId(), nome, 0L)) {
            throw Erros.conflito("Já tem um produto com este nome nesta categoria");
        }

        Produto p = new Produto();
        p.setUtilizador(utilizadores.getReferenceById(uid));
        p.setCategoria(cat);
        p.setNome(nome);
        return paraResposta(produtos.save(p));
    }

    @Transactional
    public ProdutoResponse atualizar(Long uid, Long id, ProdutoRequest req) {
        Produto p = produtos.findByIdAndUtilizadorId(id, uid)
                .orElseThrow(() -> Erros.naoEncontrado("Produto não encontrado"));
        Categoria cat = categorias.buscarVisivel(req.categoriaId(), uid)
                .orElseThrow(() -> Erros.naoEncontrado("Categoria não encontrada"));
        String nome = req.nome().trim();

        if (produtos.existsByUtilizadorIdAndCategoriaIdAndNomeIgnoreCaseAndIdNot(
                uid, cat.getId(), nome, id)) {
            throw Erros.conflito("Já tem um produto com este nome nesta categoria");
        }

        p.setNome(nome);
        p.setCategoria(cat);
        return paraResposta(p);
    }

    @Transactional
    public void remover(Long uid, Long id) {
        Produto p = produtos.findByIdAndUtilizadorId(id, uid)
                .orElseThrow(() -> Erros.naoEncontrado("Produto não encontrado"));

        if (compras.existsByProdutoId(id)) {
            throw Erros.conflito("Este produto tem compras registadas. Apague primeiro as compras");
        }
        produtos.delete(p);
    }

    private ProdutoResponse paraResposta(Produto p) {
        Categoria c = p.getCategoria();
        return new ProdutoResponse(p.getId(), p.getNome(), c.getId(), c.getNome(), c.getCor());
    }
}