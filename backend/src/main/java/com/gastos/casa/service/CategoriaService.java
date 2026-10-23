package com.gastos.casa.service;

import com.gastos.casa.dto.CategoriaRequest;
import com.gastos.casa.dto.CategoriaResponse;
import com.gastos.casa.exception.Erros;
import com.gastos.casa.model.Categoria;
import com.gastos.casa.repository.CategoriaRepository;
import com.gastos.casa.repository.ProdutoRepository;
import com.gastos.casa.repository.UtilizadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private static final String COR_PADRAO = "#64748B";
    private static final String ICONE_PADRAO = "tag";

    private final CategoriaRepository categorias;
    private final ProdutoRepository produtos;
    private final UtilizadorRepository utilizadores;

    public CategoriaService(CategoriaRepository categorias,
                            ProdutoRepository produtos,
                            UtilizadorRepository utilizadores) {
        this.categorias = categorias;
        this.produtos = produtos;
        this.utilizadores = utilizadores;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar(Long uid) {
        return categorias.listarVisiveis(uid).stream().map(this::paraResposta).toList();
    }

    @Transactional
    public CategoriaResponse criar(Long uid, CategoriaRequest req) {
        String nome = req.nome().trim();
        if (categorias.existeNomeVisivel(nome, uid, 0L)) {
            throw Erros.conflito("Já existe uma categoria com este nome");
        }

        Categoria c = new Categoria();
        c.setNome(nome);
        c.setCor(valorOu(req.cor(), COR_PADRAO));
        c.setIcone(valorOu(req.icone(), ICONE_PADRAO));
        c.setUtilizador(utilizadores.getReferenceById(uid));

        return paraResposta(categorias.save(c));
    }

    @Transactional
    public CategoriaResponse atualizar(Long uid, Long id, CategoriaRequest req) {
        Categoria c = buscarPropria(uid, id);
        String nome = req.nome().trim();

        if (categorias.existeNomeVisivel(nome, uid, id)) {
            throw Erros.conflito("Já existe uma categoria com este nome");
        }

        c.setNome(nome);
        c.setCor(valorOu(req.cor(), c.getCor()));
        c.setIcone(valorOu(req.icone(), c.getIcone()));
        return paraResposta(c);
    }

        @Transactional
    public void remover(Long uid, Long id) {
        Categoria c = buscarPropria(uid, id);

        if (produtos.categoriaTemCompras(id)) {
            throw Erros.conflito("Esta categoria tem compras registadas e não pode ser apagada");
        }

        produtos.apagarPorCategoria(id);   // produtos que ficaram sem compras
        categorias.delete(c);
    }

    private Categoria buscarPropria(Long uid, Long id) {
        Categoria c = categorias.findById(id)
                .orElseThrow(() -> Erros.naoEncontrado("Categoria não encontrada"));

        if (c.getUtilizador() == null) {
            throw Erros.proibido("As categorias padrão só podem ser alteradas pelo admin");
        }
        if (!c.getUtilizador().getId().equals(uid)) {
            throw Erros.naoEncontrado("Categoria não encontrada");
        }
        return c;
    }

    private String valorOu(String valor, String padrao) {
        return (valor == null || valor.isBlank()) ? padrao : valor.trim();
    }

    private CategoriaResponse paraResposta(Categoria c) {
        return new CategoriaResponse(
                c.getId(), c.getNome(), c.getCor(), c.getIcone(), c.getUtilizador() == null);
    }
}