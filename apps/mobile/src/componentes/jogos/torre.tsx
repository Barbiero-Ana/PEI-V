import { useState } from "react";
import { View } from "react-native";
import type { RodadaTorre } from "@modolume/core";
import { Arrastavel, ZonaSoltura } from "@/lib/arraste";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Monte a torre (montagem): no depósito, empilha caixas de papelão sobre o
 * palete até encostar na prateleira (a marca). Arrastar uma caixa da pilha
 * para fora (ou tocar nela) a retira.
 */

/** Tons de papelão (um por tamanho, para diferenciar sem sair do realista). */
const PAPELAO: Record<number, { fundo: string; borda: string; fita: string }> = {
  1: { fundo: "#EDD3AE", borda: "#C49C68", fita: "#E2C394" },
  2: { fundo: "#E6C79C", borda: "#B98F5A", fita: "#D9B683" },
  3: { fundo: "#DDBA8A", borda: "#AE844F", fita: "#CFA772" },
  4: { fundo: "#E9C89A", borda: "#B98F5A", fita: "#DBB47E" },
  5: { fundo: "#D6B080", borda: "#A57A45", fita: "#C79D68" },
};
const caixa = (v: number) => PAPELAO[v] ?? PAPELAO[3]!;
const CHAO = 22;

/** Caixa de papelão com fita adesiva e etiqueta com o tamanho. */
function Caixa({ valor, altura, largura }: { valor: number; altura: number; largura: number }) {
  const c = caixa(valor);
  return (
    <View style={[t.caixa, { width: largura, height: altura, backgroundColor: c.fundo, borderColor: c.borda }]}>
      <View style={[t.fita, { backgroundColor: c.fita, width: Math.max(8, largura * 0.16) }]} />
      {altura >= 18 ? (
        <View style={t.etiqueta}>
          <Texto
            style={{
              fontFamily: fonte.titulo,
              fontSize: altura >= 26 ? 13 : 10,
              color: cor.tinta,
              lineHeight: altura >= 26 ? 16 : 12,
            }}
          >
            {valor}
          </Texto>
        </View>
      ) : null}
    </View>
  );
}

export function JogoTorre({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaTorre>) {
  const [pilha, setPilha] = useState<{ id: number; valor: number }[]>([]);
  const [contador, setContador] = useState(0);
  const [altura, setAltura] = useState(280);

  const soma = pilha.reduce((s, b) => s + b.valor, 0);
  const maximo = rodada.alvo + 4;
  const unidade = Math.max(10, (altura - CHAO - 16) / maximo);

  const adicionar = (valor: number) => {
    if (bloqueado || soma + valor > maximo) return;
    setPilha((p) => [...p, { id: contador, valor }]);
    setContador((c) => c + 1);
  };
  const remover = (id: number) => !bloqueado && setPilha((p) => p.filter((b) => b.id !== id));

  function conferir() {
    if (soma === rodada.alvo) return onAcerto(`Isso! A pilha tem exatamente ${rodada.alvo} e encostou na prateleira.`);
    onErro(
      soma > rodada.alvo
        ? "A pilha passou da prateleira. Toque numa caixa para retirá-la."
        : `Ainda falta: a pilha tem ${soma} e a prateleira está no ${rodada.alvo}.`,
    );
  }

  const encostou = soma === rodada.alvo;

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <ZonaSoltura id="torre" style={t.area} estiloAtivo={{ borderColor: cor.roxo }}>
        <View style={{ flex: 1 }} onLayout={(e) => setAltura(e.nativeEvent.layout.height)}>
          {/* fita métrica na parede */}
          <View style={[t.metrica, { bottom: CHAO, height: maximo * unidade }]} />
          {Array.from({ length: maximo }, (_, i) => (
            <View key={i} style={[t.risco, { bottom: CHAO + (i + 1) * unidade, width: (i + 1) % 5 === 0 ? 14 : 8 }]}>
              {(i + 1) % 5 === 0 ? <Texto style={t.num}>{i + 1}</Texto> : null}
            </View>
          ))}

          {/* prateleira na altura da marca */}
          <View style={[t.prateleira, { bottom: CHAO + rodada.alvo * unidade }]}>
            <View style={[t.tabua, encostou && { backgroundColor: cor.roxo }]} />
            <View style={[t.mao, { left: 14 }]} />
            <View style={[t.mao, { right: 14 }]} />
            <View style={t.selo}>
              <Texto style={{ fontFamily: fonte.titulo, fontSize: 12, color: cor.tinta }}>
                prateleira: {rodada.alvo}
              </Texto>
            </View>
          </View>

          {/* pilha de caixas */}
          <View style={[t.pilha, { bottom: CHAO }]}>
            {pilha.map((b) => (
              <Arrastavel
                key={b.id}
                desabilitado={bloqueado}
                onSoltar={(alvo) => alvo !== "torre" && remover(b.id)}
                onToque={() => remover(b.id)}
              >
                <Caixa valor={b.valor} altura={b.valor * unidade} largura={104} />
              </Arrastavel>
            ))}
          </View>

          {/* palete e chão */}
          <View style={[t.chao, { height: CHAO }]}>
            <View style={t.palete}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={t.ripa} />
              ))}
            </View>
          </View>
          <View style={t.contador}>
            <Texto style={{ fontFamily: fonte.titulo, fontSize: 13, color: cor.tinta }}>
              altura {soma} / {rodada.alvo}
            </Texto>
          </View>
        </View>
      </ZonaSoltura>

      {/* estoque: as caixas ficam soltas na prateleira; arrastar puxa a própria caixa */}
      <View style={t.estoque}>
        <View style={t.bandeja}>
          {rodada.blocos.map((v) => (
            <View key={v} style={{ alignItems: "center", gap: 6 }}>
              <Arrastavel
                desabilitado={bloqueado}
                onSoltar={(alvo) => alvo === "torre" && adicionar(v)}
                onToque={() => adicionar(v)}
              >
                <Caixa valor={v} altura={Math.max(16, v * 12)} largura={56} />
              </Arrastavel>
            </View>
          ))}
        </View>
        <View style={t.tabuaEstoque} />
        <View style={t.bandeja}>
          {rodada.blocos.map((v) => (
            <Texto key={v} style={{ width: 56, textAlign: "center", fontSize: 11, color: cor.textoSuave }}>
              tamanho {v}
            </Texto>
          ))}
        </View>
      </View>

      <Acoes>
        <Botao
          titulo="Recomeçar"
          variante="secundario"
          onPress={() => setPilha([])}
          disabled={bloqueado || pilha.length === 0}
        />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado || pilha.length === 0} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const t = criarEstilos(() => ({
  area: {
    flex: 1,
    minHeight: 200,
    borderRadius: raio.g,
    borderWidth: 1.5,
    borderColor: cor.borda,
    backgroundColor: "#EEEAF7",
    overflow: "hidden",
  },
  metrica: {
    position: "absolute",
    left: 12,
    width: 14,
    borderRadius: 2,
    backgroundColor: "#FFE3B8",
    borderWidth: 1,
    borderColor: "#F0C98C",
  },
  risco: { position: "absolute", left: 12, height: 1.5, backgroundColor: "#B98F5A" },
  num: { position: "absolute", left: 18, top: -8, fontSize: 10, fontFamily: fonte.textoForte, color: "#8C6A44" },
  prateleira: { position: "absolute", left: 44, right: 0, height: 9 },
  tabua: { height: 9, borderTopLeftRadius: 3, borderBottomLeftRadius: 3, backgroundColor: "#B98F5A" },
  mao: {
    position: "absolute",
    top: 9,
    width: 6,
    height: 12,
    backgroundColor: "#8E86BD",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  selo: {
    position: "absolute",
    right: 10,
    top: -24,
    backgroundColor: cor.pessego,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pilha: {
    position: "absolute",
    left: "50%",
    marginLeft: -52,
    width: 104,
    flexDirection: "column-reverse",
    alignItems: "center",
  },
  caixa: { borderRadius: 3, borderWidth: 1.5, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  fita: { position: "absolute", top: 0, bottom: 0 },
  etiqueta: { backgroundColor: "#FFFFFF", borderRadius: 3, paddingHorizontal: 6, minWidth: 20, alignItems: "center" },
  chao: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "#D6CFF0", alignItems: "center" },
  palete: {
    width: 124,
    height: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#C9A07A",
    paddingHorizontal: 4,
  },
  ripa: { width: 14, height: 10, backgroundColor: "#A67C52" },
  contador: {
    position: "absolute",
    top: 8,
    left: 44,
    backgroundColor: cor.superficie,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bandeja: { flexDirection: "row", justifyContent: "center", alignItems: "flex-end", gap: 18 },
  estoque: { paddingTop: 8, paddingBottom: 6, borderRadius: raio.m, backgroundColor: "#EEEAF7" },
  tabuaEstoque: { height: 8, marginHorizontal: 16, marginBottom: 6, borderRadius: 3, backgroundColor: "#B98F5A" },
  peca: {
    width: 74,
    minHeight: 84,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    padding: 8,
    borderRadius: raio.m,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
}));
