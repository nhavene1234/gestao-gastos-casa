package com.gastos.casa.repository;

import com.gastos.casa.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("select p from Produto p join fetch p.categoria where p.utilizador.id = :uid order by p.nome")
    List<Produto> listarDoUtilizador(@Param("uid") Long uid);

    Optional<Produto> findByIdAndUtilizadorId(Long id, Long utilizadorId);

    Optional<Produto> findByUtilizadorIdAndCategoriaIdAndNomeIgnoreCase(
            Long utilizadorId, Long categoriaId, String nome);

    boolean existsByUtilizadorIdAndCategoriaIdAndNomeIgnoreCaseAndIdNot(
            Long utilizadorId, Long categoriaId, String nome, Long id);

    boolean existsByCategoriaId(Long categoriaId);

    // ---------- limpeza de produtos sem compras ----------

    // Há alguma compra, de quem quer que seja, em produtos desta categoria?
    @Query("select count(c) > 0 from Compra c where c.produto.categoria.id = :categoriaId")
    boolean categoriaTemCompras(@Param("categoriaId") Long categoriaId);

    // Só se chama depois de confirmar que a categoria não tem compras
    @Modifying
    @Query("delete from Produto p where p.categoria.id = :categoriaId")
    int apagarPorCategoria(@Param("categoriaId") Long categoriaId);
}