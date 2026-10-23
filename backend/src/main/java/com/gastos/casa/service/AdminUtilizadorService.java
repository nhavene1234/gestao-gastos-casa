package com.gastos.casa.service;

import com.gastos.casa.dto.admin.AdminResumoResponse;
import com.gastos.casa.dto.admin.AtualizarUtilizadorRequest;
import com.gastos.casa.dto.admin.CriarUtilizadorRequest;
import com.gastos.casa.dto.admin.UtilizadorAdminResponse;
import com.gastos.casa.exception.Erros;
import com.gastos.casa.model.Papel;
import com.gastos.casa.model.Utilizador;
import com.gastos.casa.repository.CategoriaRepository;
import com.gastos.casa.repository.CompraRepository;
import com.gastos.casa.repository.LimpezaUtilizadorRepository;
import com.gastos.casa.repository.ProdutoRepository;
import com.gastos.casa.repository.UtilizadorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUtilizadorService {

    private final UtilizadorRepository utilizadores;
    private final PasswordEncoder passwordEncoder;
    private final LimpezaUtilizadorRepository limpeza;
    private final ProdutoRepository produtos;
    private final CompraRepository compras;
    private final CategoriaRepository categorias;

    public AdminUtilizadorService(UtilizadorRepository utilizadores,
                                  PasswordEncoder passwordEncoder,
                                  LimpezaUtilizadorRepository limpeza,
                                  ProdutoRepository produtos,
                                  CompraRepository compras,
                                  CategoriaRepository categorias) {
        this.utilizadores = utilizadores;
        this.passwordEncoder = passwordEncoder;
        this.limpeza = limpeza;
        this.produtos = produtos;
        this.compras = compras;
        this.categorias = categorias;
    }

    // ---------- visão geral ----------

    @Transactional(readOnly = true)
    public AdminResumoResponse resumo() {
        long total = utilizadores.count();
        long ativos = utilizadores.countByAtivo(true);
        return new AdminResumoResponse(
                total,
                ativos,
                total - ativos,
                utilizadores.countByPapel(Papel.ADMIN),
                produtos.count(),
                compras.count(),
                categorias.countByUtilizadorIsNull());
    }

    // ---------- utilizadores ----------

    @Transactional(readOnly = true)
    public List<UtilizadorAdminResponse> listar(String pesquisa) {
        String q = (pesquisa == null) ? "" : pesquisa.trim();
        return utilizadores.pesquisar(q).stream().map(this::paraResposta).toList();
    }

    @Transactional(readOnly = true)
    public UtilizadorAdminResponse obter(Long id) {
        return paraResposta(buscar(id));
    }

    @Transactional
    public UtilizadorAdminResponse criar(CriarUtilizadorRequest req) {
        String email = normalizar(req.email());
        if (utilizadores.existsByEmail(email)) {
            throw Erros.conflito("Este email já está registado");
        }

        Utilizador u = new Utilizador();
        u.setNome(req.nome().trim());
        u.setEmail(email);
        u.setSenhaHash(passwordEncoder.encode(req.senha()));
        u.setPapel(req.papel());
        return paraResposta(utilizadores.save(u));
    }

    @Transactional
    public UtilizadorAdminResponse atualizar(Long adminId, Long id, AtualizarUtilizadorRequest req) {
        Utilizador u = buscar(id);
        String email = normalizar(req.email());

        if (utilizadores.existsByEmailAndIdNot(email, id)) {
            throw Erros.conflito("Este email já está registado");
        }

        // retirar o papel de admin
        if (u.getPapel() == Papel.ADMIN && req.papel() != Papel.ADMIN) {
            if (id.equals(adminId)) {
                throw Erros.proibido("Não pode retirar o seu próprio papel de administrador");
            }
            garantirOutroAdminAtivo(u);
        }

        u.setNome(req.nome().trim());
        u.setEmail(email);
        u.setPapel(req.papel());
        return paraResposta(u);
    }

    @Transactional
    public UtilizadorAdminResponse definirAtivo(Long adminId, Long id, boolean ativo) {
        Utilizador u = buscar(id);

        if (!ativo) {
            if (id.equals(adminId)) {
                throw Erros.proibido("Não pode desativar a sua própria conta");
            }
            garantirOutroAdminAtivo(u);
        }

        u.setAtivo(ativo);
        return paraResposta(u);
    }

    @Transactional
    public void redefinirSenha(Long id, String novaSenha) {
        Utilizador u = buscar(id);
        u.setSenhaHash(passwordEncoder.encode(novaSenha));
    }

    // Só se apaga uma conta já desativada. Remove também todos os dados dessa pessoa.
    @Transactional
    public void remover(Long adminId, Long id) {
        Utilizador u = buscar(id);

        if (id.equals(adminId)) {
            throw Erros.proibido("Não pode apagar a sua própria conta");
        }
        if (u.isAtivo()) {
            throw Erros.conflito("Desative primeiro a conta antes de a apagar");
        }

        limpeza.apagarCompras(id);
        limpeza.apagarProdutos(id);
        limpeza.apagarCategorias(id);
        limpeza.apagarNotificacoes(id);
        utilizadores.delete(u);
    }

    // ---------- auxiliares ----------

    private Utilizador buscar(Long id) {
        return utilizadores.findById(id)
                .orElseThrow(() -> Erros.naoEncontrado("Utilizador não encontrado"));
    }

    // Impede ficar sem nenhum administrador ativo
    private void garantirOutroAdminAtivo(Utilizador alvo) {
        if (alvo.getPapel() == Papel.ADMIN
                && alvo.isAtivo()
                && utilizadores.countByPapelAndAtivoTrue(Papel.ADMIN) <= 1) {
            throw Erros.conflito("Tem de existir pelo menos um administrador ativo");
        }
    }

    private String normalizar(String email) {
        return email.trim().toLowerCase();
    }

    private UtilizadorAdminResponse paraResposta(Utilizador u) {
        return new UtilizadorAdminResponse(
                u.getId(), u.getNome(), u.getEmail(), u.getPapel().name(),
                u.isAtivo(), u.getCriadoEm());
    }
}