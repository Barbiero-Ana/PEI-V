import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { FORMATOS_ATIVIDADE, type Missao } from "@modolume/core";
import type { ProgressoMissao } from "@/estado/jogador";
import { Cadeado, Check, Estrela, IconeMissao, Seta } from "./Icones";
import { useAbrirMissao } from "./Nuvens";
import { Rotulo, Texto, Titulo } from "./ui";
import { cor, COR_MISSAO, criarEstilos, fonte, raio } from "@/tema";

export function Estrelas({ n, tamanho = 16 }: { n: number; tamanho?: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 2 }} accessibilityLabel={`${n} de 3 estrelas`}>
      {[1, 2, 3].map((i) => (
        <Estrela key={i} cheia={i <= n} tamanho={tamanho} />
      ))}
    </View>
  );
}

export function CabecalhoTela({ rotulo, titulo, direita }: { rotulo?: string; titulo: string; direita?: ReactNode }) {
  return (
    <View style={b.cabecalho}>
      <View style={{ flex: 1 }}>
        {rotulo ? <Rotulo>{rotulo}</Rotulo> : null}
        <Titulo tamanho={26} style={{ marginTop: rotulo ? 4 : 0 }}>
          {titulo}
        </Titulo>
      </View>
      {direita}
    </View>
  );
}

export function rotuloFormato(m: Missao) {
  return FORMATOS_ATIVIDADE.find((f) => f.id === m.formato)?.rotulo ?? "";
}

/** Linha de missão, usada nas listas de nível. */
export function CartaoMissao({
  missao,
  progresso,
  bloqueado = false,
}: {
  missao: Missao;
  progresso?: ProgressoMissao;
  bloqueado?: boolean;
}) {
  const c = COR_MISSAO[missao.cor];
  const abrir = useAbrirMissao();
  return (
    <Pressable
      disabled={bloqueado}
      onPress={() => abrir(missao.id)}
      accessibilityRole="button"
      accessibilityLabel={`${missao.titulo}${bloqueado ? ", bloqueada" : ""}`}
      style={({ pressed }) => [b.missao, pressed && { backgroundColor: cor.suave }, bloqueado && { opacity: 0.55 }]}
    >
      <View style={[b.icone, { backgroundColor: c.claro }]}>
        <IconeMissao jogo={missao.jogo} tamanho={30} />
        {progresso ? (
          <View style={b.feito}>
            <Check tamanho={10} />
          </View>
        ) : null}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <Texto
            style={{ fontFamily: fonte.textoForte, fontSize: 11, color: c.texto, flexShrink: 1 }}
            numberOfLines={1}
          >
            {rotuloFormato(missao)}
          </Texto>
          <Estrelas n={progresso?.estrelas ?? 0} tamanho={17} />
        </View>
        <Titulo tamanho={16}>{missao.titulo}</Titulo>
        <Texto style={{ fontSize: 12, color: cor.textoSuave }} numberOfLines={1}>
          {missao.conteudo} · {missao.rodadas.length} fases
        </Texto>
      </View>
      {bloqueado ? <Cadeado /> : <Seta direcao="direita" cor={cor.roxo} tamanho={18} />}
    </Pressable>
  );
}

export const b = criarEstilos(() => ({
  cabecalho: { flexDirection: "row", alignItems: "flex-end", gap: 12, marginBottom: 18 },
  missao: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    borderRadius: raio.g,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  icone: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  feito: {
    position: "absolute",
    right: -4,
    top: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: cor.roxo,
    borderWidth: 2,
    borderColor: cor.superficie,
    alignItems: "center",
    justifyContent: "center",
  },
}));
