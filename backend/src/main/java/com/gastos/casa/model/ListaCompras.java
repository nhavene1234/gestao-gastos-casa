package com.gastos.casa.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listas_compras")
@Getter
@Setter
@NoArgsConstructor
public class ListaCompras {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "utilizador_id")
    private Utilizador utilizador;

    @Column(nullable = false, length = 100)
    private String titulo;

    @Column(name = "data_prevista", nullable = false)
    private LocalDate dataPrevista;

    @OneToMany(mappedBy = "lista", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemLista> itens = new ArrayList<>();

    @Column(name = "criado_em", insertable = false, updatable = false)
    private LocalDateTime criadoEm;
}