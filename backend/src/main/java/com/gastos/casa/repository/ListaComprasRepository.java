package com.gastos.casa.repository;

import com.gastos.casa.model.ListaCompras;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ListaComprasRepository extends JpaRepository<ListaCompras, Long> {

    @Query("""
            select distinct l from ListaCompras l
            left join fetch l.itens i
            left join fetch i.categoria
            where l.utilizador.id = :uid
            order by l.dataPrevista desc, l.id desc
            """)
    List<ListaCompras> listarDoUtilizador(@Param("uid") Long uid);

    @Query("""
            select distinct l from ListaCompras l
            left join fetch l.itens i
            left join fetch i.categoria
            where l.id = :id and l.utilizador.id = :uid
            """)
    Optional<ListaCompras> buscarDoUtilizador(@Param("id") Long id, @Param("uid") Long uid);
}