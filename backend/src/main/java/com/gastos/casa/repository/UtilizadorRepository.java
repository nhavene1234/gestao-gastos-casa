package com.gastos.casa.repository;

import com.gastos.casa.model.Papel;
import com.gastos.casa.model.Utilizador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UtilizadorRepository extends JpaRepository<Utilizador, Long> {

    Optional<Utilizador> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    long countByAtivo(boolean ativo);

    long countByPapel(Papel papel);

    long countByPapelAndAtivoTrue(Papel papel);

    // pesquisa por nome ou email (q vazio devolve todos)
    @Query("""
            select u from Utilizador u
            where lower(u.nome) like lower(concat('%', :q, '%'))
               or lower(u.email) like lower(concat('%', :q, '%'))
            order by u.nome
            """)
    List<Utilizador> pesquisar(@Param("q") String q);
}