package com.gastos.casa.repository;

import com.gastos.casa.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    // ---------- Passo 4 ----------

    @Query("select c from Categoria c where c.utilizador is null or c.utilizador.id = :uid order by c.nome")
    List<Categoria> listarVisiveis(@Param("uid") Long uid);

    @Query("select c from Categoria c where c.id = :id and (c.utilizador is null or c.utilizador.id = :uid)")
    Optional<Categoria> buscarVisivel(@Param("id") Long id, @Param("uid") Long uid);

    @Query("""
            select count(c) > 0 from Categoria c
            where lower(c.nome) = lower(:nome)
              and c.id <> :excluirId
              and (c.utilizador is null or c.utilizador.id = :uid)
            """)
    boolean existeNomeVisivel(@Param("nome") String nome,
                              @Param("uid") Long uid,
                              @Param("excluirId") Long excluirId);

    // ---------- Passo 7: categorias padrão (utilizador nulo) ----------

    List<Categoria> findByUtilizadorIsNullOrderByNome();

    Optional<Categoria> findByIdAndUtilizadorIsNull(Long id);

    boolean existsByUtilizadorIsNullAndNomeIgnoreCaseAndIdNot(String nome, Long id);

    long countByUtilizadorIsNull();
}