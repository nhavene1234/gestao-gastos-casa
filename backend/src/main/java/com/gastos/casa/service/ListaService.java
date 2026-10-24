package com.gastos.casa.service;

import com.gastos.casa.dto.CompraRequest;
import com.gastos.casa.dto.lista.ListaDtos.CompradoRequest;
import com.gastos.casa.dto.lista.ListaDtos.ItemRequest;
import com.gastos.casa.dto.lista.ListaDtos.ItemResponse;
import com.gastos.casa.dto.lista.ListaDtos.ListaRequest;
import com.gastos.casa.dto.lista.ListaDtos.ListaResponse;
import com.gastos.casa.dto.lista.ListaDtos.RegistarItemRequest;
import com.gastos.casa.dto.lista.ListaDtos.RegistarRequest;
import com.gastos.casa.dto.lista.ListaDtos.RegistarResponse;
import com.gastos.casa.exception.Erros;
import com.gastos.casa.model.Categoria;
import com.gastos.casa.model.ItemLista;
import com.gastos.casa.model.ListaCompras;
import com.gastos.casa.repository.CategoriaRepository;
import com.gastos.casa.repository.ItemListaRepository;
import com.gastos.casa.repository.ListaComprasRepository;
import com.gastos.casa.repository.UtilizadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class ListaService {

    private static final BigDecimal ZERO = new BigDecimal("0.00");

    private final ListaComprasRepository listas;
    private final ItemListaRepository itens;
    private final CategoriaRepository categorias;
    private final UtilizadorRepository utilizadores;
    private final CompraService compraService;

    public ListaService(ListaComprasRepository listas,
                        ItemListaRepository itens,
                        CategoriaRepository categorias,
                        UtilizadorRepository utilizadores,
                        CompraService compraService) {
        this.listas = listas;
        this.itens = itens;
        this.categorias = categorias;
        this.utilizadores = utilizadores;
        this.compraService = compraService;
    }

    // ---------- listas ----------

    @Transactional(readOnly = true)
    public List<ListaResponse> listar(Long uid) {
        return listas.listarDoUtilizador(uid).stream().map(this::paraResposta).toList();
    }

    @Transactional
    public ListaResponse criar(Long uid, ListaRequest req) {
        ListaCompras l = new ListaCompras();
        l.setUtilizador(utilizadores.getReferenceById(uid));
        l.setTitulo(req.titulo().trim());
        l.setDataPrevista(req.dataPrevista());
        return paraResposta(listas.save(l));
    }

    @Transactional
    public ListaResponse atualizar(Long uid, Long id, ListaRequest req) {
        ListaCompras l = buscar(uid, id);
        l.setTitulo(req.titulo().trim());
        l.setDataPrevista(req.dataPrevista());
        return paraResposta(l);
    }

    @Transactional
    public void remover(Long uid, Long id) {
        listas.delete(buscar(uid, id));
    }

    // ---------- itens ----------

    @Transactional
    public ListaResponse adicionarItem(Long uid, Long listaId, ItemRequest req) {
        ListaCompras l = buscar(uid, listaId);

        ItemLista item = new ItemLista();
        item.setLista(l);
        preencher(uid, item, req);

        itens.save(item);
        l.getItens().add(item);
        return paraResposta(l);
    }

    @Transactional
    public ListaResponse atualizarItem(Long uid, Long listaId, Long itemId, ItemRequest req) {
        ListaCompras l = buscar(uid, listaId);
        ItemLista item = procurarItem(l, itemId);

        if (item.isRegistado()) {
            throw Erros.conflito("Este item já foi registado como compra e não pode ser alterado");
        }
        preencher(uid, item, req);
        return paraResposta(l);
    }

    @Transactional
    public ListaResponse marcarComprado(Long uid, Long listaId, Long itemId, CompradoRequest req) {
        ListaCompras l = buscar(uid, listaId);
        ItemLista item = procurarItem(l, itemId);

        if (item.isRegistado()) {
            throw Erros.conflito("Este item já foi registado como compra");
        }
        item.setComprado(req.comprado());
        return paraResposta(l);
    }

    @Transactional
    public ListaResponse removerItem(Long uid, Long listaId, Long itemId) {
        ListaCompras l = buscar(uid, listaId);
        ItemLista item = procurarItem(l, itemId);

        l.getItens().remove(item);   // orphanRemoval apaga o item
        return paraResposta(l);
    }

    // ---------- converter em compras reais ----------

    @Transactional
    public RegistarResponse registar(Long uid, Long listaId, RegistarRequest req) {
        ListaCompras l = buscar(uid, listaId);
        int total = 0;

        for (RegistarItemRequest r : req.itens()) {
            ItemLista item = procurarItem(l, r.itemId());

            if (item.isRegistado()) {
                throw Erros.conflito("O item \"" + item.getNome() + "\" já foi registado como compra");
            }

            // reaproveita toda a lógica das compras: produto novo ou existente e alerta de média
            compraService.criar(uid, new CompraRequest(
                    null,
                    item.getNome(),
                    r.categoriaId(),
                    r.quantidade(),
                    r.precoUnitario(),
                    req.dataCompra(),
                    "Da lista: " + l.getTitulo()));

            item.setComprado(true);
            item.setRegistado(true);
            total++;
        }

        return new RegistarResponse(total, paraResposta(l));
    }

    // ---------- auxiliares ----------

    private ListaCompras buscar(Long uid, Long id) {
        return listas.buscarDoUtilizador(id, uid)
                .orElseThrow(() -> Erros.naoEncontrado("Lista não encontrada"));
    }

    private ItemLista procurarItem(ListaCompras lista, Long itemId) {
        return lista.getItens().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> Erros.naoEncontrado("Item não encontrado"));
    }

    private void preencher(Long uid, ItemLista item, ItemRequest req) {
        item.setNome(req.nome().trim());
        item.setQuantidade(req.quantidade());
        item.setPrecoEstimado(req.precoEstimado());

        if (req.categoriaId() == null) {
            item.setCategoria(null);
        } else {
            Categoria c = categorias.buscarVisivel(req.categoriaId(), uid)
                    .orElseThrow(() -> Erros.naoEncontrado("Categoria não encontrada"));
            item.setCategoria(c);
        }
    }

    private ListaResponse paraResposta(ListaCompras l) {
        List<ItemResponse> lista = l.getItens().stream()
                .sorted(Comparator.comparing(ItemLista::getId))
                .map(this::paraItem)
                .toList();

        BigDecimal total = lista.stream()
                .map(ItemResponse::totalEstimado)
                .filter(Objects::nonNull)
                .reduce(ZERO, BigDecimal::add);

        return new ListaResponse(
                l.getId(),
                l.getTitulo(),
                l.getDataPrevista(),
                lista,
                lista.size(),
                (int) lista.stream().filter(ItemResponse::comprado).count(),
                (int) lista.stream().filter(ItemResponse::registado).count(),
                (int) lista.stream().filter(i -> i.precoEstimado() == null).count(),
                total);
    }

    private ItemResponse paraItem(ItemLista i) {
        BigDecimal total = i.getPrecoEstimado() == null
                ? null
                : i.getQuantidade().multiply(i.getPrecoEstimado()).setScale(2, RoundingMode.HALF_UP);
        Categoria c = i.getCategoria();

        return new ItemResponse(
                i.getId(), i.getNome(), i.getQuantidade(), i.getPrecoEstimado(), total,
                c == null ? null : c.getId(),
                c == null ? null : c.getNome(),
                c == null ? null : c.getCor(),
                i.isComprado(), i.isRegistado());
    }
}