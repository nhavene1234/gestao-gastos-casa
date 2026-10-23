package com.gastos.casa.service;

import com.gastos.casa.dto.CompraRequest;
import com.gastos.casa.dto.CompraResponse;
import com.gastos.casa.exception.Erros;
import com.gastos.casa.model.Categoria;
import com.gastos.casa.model.Compra;
import com.gastos.casa.model.Produto;
import com.gastos.casa.repository.CategoriaRepository;
import com.gastos.casa.repository.CompraRepository;
import com.gastos.casa.repository.ProdutoRepository;
import com.gastos.casa.repository.UtilizadorRepository;
import com.gastos.casa.service.AlertaService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class CompraService {

    private final CompraRepository compras;
    private final ProdutoRepository produtos;
    private final CategoriaRepository categorias;
    private final UtilizadorRepository utilizadores;
    private final AlertaService alertas;

    public CompraService(CompraRepository compras,
                         ProdutoRepository produtos,
                         CategoriaRepository categorias,
                         UtilizadorRepository utilizadores,
                         AlertaService alertas) {
        this.compras = compras;
        this.produtos = produtos;
        this.categorias = categorias;
        this.utilizadores = utilizadores;
        this.alertas = alertas;
    }

    @Transactional(readOnly = true)
    public List<CompraResponse> listar(Long uid, LocalDate de, LocalDate ate, Long categoriaId) {
        return compras.filtrar(uid, de, ate, categoriaId).stream().map(this::paraResposta).toList();
    }

    @Transactional(readOnly = true)
    public CompraResponse obter(Long uid, Long id) {
        return paraResposta(buscar(uid, id));
    }

    @Transactional
    public CompraResponse criar(Long uid, CompraRequest req) {
        Compra c = new Compra();
        c.setUtilizador(utilizadores.getReferenceById(uid));
        c.setProduto(resolverProduto(uid, req));
        aplicar(c, req);
        return paraResposta(compras.save(c));
    }

    @Transactional
    public CompraResponse atualizar(Long uid, Long id, CompraRequest req) {
        Compra c = buscar(uid, id);
        Long produtoAnteriorId = c.getProduto().getId();

        c.setProduto(resolverProduto(uid, req));
        aplicar(c, req);

        if (c.getDataFimConsumo() != null && c.getDataFimConsumo().isBefore(c.getDataCompra())) {
            throw Erros.pedidoInvalido("A data de fim de consumo não pode ser anterior à data da compra");
        }

        // se a compra mudou de produto, o antigo pode ter ficado sem compras
        limparProdutoSemCompras(produtoAnteriorId, c.getProduto().getId());

        alertas.verificarMesAtual(uid, c.getDataCompra());
        return paraResposta(c);
    }

    @Transactional
    public CompraResponse definirConsumo(Long uid, Long id, LocalDate fim) {
        Compra c = buscar(uid, id);
        if (fim != null && fim.isBefore(c.getDataCompra())) {
            throw Erros.pedidoInvalido("A data de fim de consumo não pode ser anterior à data da compra");
        }
        c.setDataFimConsumo(fim);
        return paraResposta(c);
    }

    @Transactional
    public void remover(Long uid, Long id) {
        Compra c = buscar(uid, id);
        Long produtoId = c.getProduto().getId();

        compras.delete(c);
        limparProdutoSemCompras(produtoId, null);
    }

    // Um produto sem compras já não aparece em lado nenhum: remove-o
    private void limparProdutoSemCompras(Long produtoId, Long manterId) {
        if (produtoId.equals(manterId)) {
            return;
        }
        compras.flush();
        if (!compras.existsByProdutoId(produtoId)) {
            produtos.deleteById(produtoId);
        }
    }

    // ---------- auxiliares ----------

    private Compra buscar(Long uid, Long id) {
        return compras.buscarDoUtilizador(id, uid)
                .orElseThrow(() -> Erros.naoEncontrado("Compra não encontrada"));
    }

    private void aplicar(Compra c, CompraRequest req) {
        c.setQuantidade(req.quantidade());
        c.setPrecoUnitario(req.precoUnitario());
        c.setDataCompra(req.dataCompra());
        c.setNotas(req.notas() == null || req.notas().isBlank() ? null : req.notas().trim());
    }

    // Produto existente (produtoId) ou novo (produtoNome + categoriaId)
    private Produto resolverProduto(Long uid, CompraRequest req) {
        if (req.produtoId() != null) {
            return produtos.findByIdAndUtilizadorId(req.produtoId(), uid)
                    .orElseThrow(() -> Erros.naoEncontrado("Produto não encontrado"));
        }

        if (req.produtoNome() == null || req.produtoNome().isBlank() || req.categoriaId() == null) {
            throw Erros.pedidoInvalido(
                    "Indique um produto existente ou o nome do produto e a categoria");
        }

        Categoria cat = categorias.buscarVisivel(req.categoriaId(), uid)
                .orElseThrow(() -> Erros.naoEncontrado("Categoria não encontrada"));
        String nome = req.produtoNome().trim();

        return produtos.findByUtilizadorIdAndCategoriaIdAndNomeIgnoreCase(uid, cat.getId(), nome)
                .orElseGet(() -> {
                    Produto p = new Produto();
                    p.setUtilizador(utilizadores.getReferenceById(uid));
                    p.setCategoria(cat);
                    p.setNome(nome);
                    return produtos.save(p);
                });
    }

    private CompraResponse paraResposta(Compra c) {
        Produto p = c.getProduto();
        Categoria cat = p.getCategoria();

        // o preço total é calculado pela BD; aqui repetimos a conta para a resposta
        var total = c.getQuantidade().multiply(c.getPrecoUnitario()).setScale(2, RoundingMode.HALF_UP);

        Long dias = c.getDataFimConsumo() == null
                ? null
                : ChronoUnit.DAYS.between(c.getDataCompra(), c.getDataFimConsumo());

        return new CompraResponse(
                c.getId(), p.getId(), p.getNome(),
                cat.getId(), cat.getNome(), cat.getCor(),
                c.getQuantidade(), c.getPrecoUnitario(), total,
                c.getDataCompra(), c.getDataFimConsumo(), dias, c.getNotas());
    }
}
