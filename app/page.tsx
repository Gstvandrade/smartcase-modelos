"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "./page.module.css";
import { supabase } from "../lib/supabase";

type LinhaModelo = {
  marca: string | null;
  modelo: string | null;
  compativeis: string | null;
};

type Item = {
  titulo: string;
  compativeis: string;
};

export default function Home() {
  const [busca, setBusca] = useState("");
  const [modelos, setModelos] = useState<Item[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tipo, setTipo] = useState("peliculas");

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);

      const tabela = tipo === "peliculas" ? "Modelos" : "Capas";

      const { data, error } = await supabase
        .from(tabela)
        .select("marca, modelo, compativeis")
        .order("modelo", { ascending: true });

      if (error) {
  console.log("ERRO COMPLETO:", error);
  alert("Erro: " + error.message);
  setCarregando(false);
  return;
}

      const lista = ((data ?? []) as LinhaModelo[])
        .map((x) => {
          const marca = x.marca ? x.marca + " " : "";
          const modelo = x.modelo ?? "";
          const titulo = (marca + modelo).trim();

          return {
            titulo: titulo,
            compativeis: (x.compativeis ?? "").trim(),
          };
        })
        .filter((x) => x.titulo.length > 0);

      setModelos(lista);
      setCarregando(false);
    };

    carregar();
  }, [tipo]);

  const resultados = useMemo(() => {
    const texto = busca.trim().toLowerCase();
    if (!texto) return [];

    // Prioriza resultado exato
    const exato = modelos.find((m) => m.titulo.toLowerCase() === texto);
    if (exato) return [exato];

    // Se não tiver exato, retorna parecidos
    return modelos
      .filter((m) => m.titulo.toLowerCase().includes(texto))
      .slice(0, 12);
  }, [busca, modelos]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* LOGO */}
<div className={styles.logoWrap}>
  <img
    src="/logo-smartcase.png"
    alt="SmartCase"
    className={styles.logo}
  />
</div>

{/* HEADER COMPLETO */}
<div className={styles.header}>
  <div className={styles.tabs}>
    <button
      onClick={() => setTipo("peliculas")}
      className={tipo === "peliculas" ? styles.activeTab : styles.tab}
    >
      Películas
    </button>

    <button
      onClick={() => setTipo("capas")}
      className={tipo === "capas" ? styles.activeTab : styles.tab}
    >
      Capas
    </button>
  </div>

  <h1 className={styles.title}>Tabela de compatibilidades</h1>

  <p className={styles.description}>
    Bem vindo a tabela de capas e películas compatíveis da Smartcase, aqui você pode encontrar produtos semelhantes que poderão te ajudar a ganhar mais nas suas vendas. Se não encontrar algum modelo específico e/ou tiver sugestões para correção e melhoria do site, utilize a aba “Sugestões” no final da página, sua colaboração é essencial para aprimorarmos o sistema!
  </p>

</div>

          <p className={styles.subtitle}>
            Pesquise abaixo o modelo que deseja encontrar
          </p>

          {/* BUSCA */}

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex: iPhone 13 Pro Max / Samsung A15"
            className={styles.searchInput}
          />

          {/* STATUS */}
          <div className={styles.helper}>
            {carregando
              ? "Carregando modelos..."
              : busca.trim()
              ? resultados.length + " resultado(s) encontrado(s)."
              : "Total de modelos cadastrados: " + modelos.length}
          </div>

          {/* RESULTADOS */}
          {!carregando && busca.trim() !== "" && resultados.length === 0 && (
            <div className={styles.helper}>Nenhum modelo encontrado.</div>
          )}

          {resultados.length > 0 && (
  <div className={styles.resultsBox}>
    {resultados.map((m) => (
      <div key={m.titulo} className={styles.resultItem}>
        <div className={styles.resultTitle}>{m.titulo}</div>

        {m.compativeis ? (
          <div className={styles.compat}>
            <span className={styles.compatLabel}>Compatíveis: </span>
            {m.compativeis}
          </div>
        ) : (
          <div className={styles.helper}>
            Sem informação de compatibilidade.
          </div>
        )}
      </div>
    ))}
  </div>
)}

          <hr className={styles.divider} />

          {/* SUGESTÕES */}
          <h2 className={styles.suggestTitle}>Sugestões</h2>

          <p className={styles.suggestText}>
            Tem alguma duvida ou sugestão pra agregar na nossa tabela? Digite
            abaixo e nos envie para futuras correções/melhorias!
          </p>

          <FormularioSugestao />
        </div>
      </div>
    </main>
  );
}

function FormularioSugestao() {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!modelo.trim()) {
      alert("Digite o modelo.");
      return;
    }

    setEnviando(true);

    const { error } = await supabase.from("sugestoes").insert([
      {
        marca: marca.trim() || null,
        modelo: modelo.trim(),
        observacao: observacao.trim() || null,
      },
    ]);

    setEnviando(false);

    if (error) {
      console.error("Erro ao enviar sugestão:", error);
      alert("Erro ao enviar sugestão.");
      return;
    }

    alert("Sugestão enviada com sucesso!");
    setMarca("");
    setModelo("");
    setObservacao("");
  };

  return (
    <form onSubmit={enviar} className={styles.form}>
      <input
        value={marca}
        onChange={(e) => setMarca(e.target.value)}
        placeholder="Marca (opcional)"
        className={styles.field}
      />

      <input
        value={modelo}
        onChange={(e) => setModelo(e.target.value)}
        placeholder="Modelo (obrigatório)"
        className={styles.field}
      />

      <textarea
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
        placeholder="Descreva sua sugestão / correção (opcional)"
        className={styles.field + " " + styles.textarea}
      />

      <button type="submit" disabled={enviando} className={styles.button}>
        {enviando ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}