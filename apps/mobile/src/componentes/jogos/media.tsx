import { useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { RodadaMedia } from "@modolume/core";
import { useUltimo } from "@/lib/useUltimo";
import { Botao, Texto } from "../ui";
import { Check } from "../Icones";
import { cor, criarEstilos, fonte, porTema, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Nivelando as torres (média): arraste o livro do topo de uma pilha e solte em
 * outra (ou toque para pegar e toque para soltar). Quando todas as pilhas
 * ficam da mesma altura, essa altura é a média.
 */

const LIVRO = 22; // altura de cada livro
const VAO = 3;
const LARG = 54;
const CORES = porTema(() => [
  { capa: cor.roxo, lombada: "#5A43D6" },
  { capa: cor.pessego, lombada: "#D9784A" },
  { capa: cor.azul, lombada: "#4C9FD4" },
  { capa: cor.lilas, lombada: "#9A84E6" },
  { capa: "#7DBE7A", lombada: "#5A9C57" },
]);

function Livro({ i, destaque = false }: { i: number; destaque?: boolean }) {
  const c = CORES[i % CORES.length]!;
  return (
    <View style={[l.livro, { backgroundColor: c.capa, borderColor: destaque ? cor.tinta : c.lombada }]}>
      <View style={[l.faixa, { backgroundColor: "rgba(255,255,255,0.45)" }]} />
      <View style={[l.faixa, { backgroundColor: "rgba(255,255,255,0.25)", right: 10 }]} />
    </View>
  );
}

export function JogoMedia({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaMedia>) {
  const [colunas, setColunas] = useState(rodada.colunas);
  const [mao, setMao] = useState<{ de: number; x: number; y: number; arrastando: boolean } | null>(null);
  const [largura, setLargura] = useState(300);
  const [alturaPalco, setAlturaPalco] = useState(300);
  const n = colunas.length;
  const total = rodada.colunas.reduce((a, b) => a + b, 0);
  const media = total / n;
  const maior = Math.max(...rodada.colunas);
  const niveladas = mao === null && colunas.every((c) => c === colunas[0]);
  const estado = useUltimo({ colunas, mao, largura, bloqueado });
  const inicio = useRef({ x: 0, y: 0, i: 0 });

  const indiceEm = (x: number) => Math.max(0, Math.min(n - 1, Math.floor(x / (estado.current.largura / n))));
  const alvoArraste = mao?.arrastando ? indiceEm(mao.x) : null;

  const soltarEm = (i: number) => {
    const m = estado.current.mao;
    if (!m) return;
    setColunas((c) => c.map((v, k) => (k === i ? v + 1 : v)));
    setMao(null);
  };

  const gesto = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .minDistance(0)
        .onBegin((e) => {
          inicio.current = { x: e.x, y: e.y, i: indiceEm(e.x) };
        })
        .onUpdate((e) => {
          const { bloqueado: b, colunas: cols, mao: m } = estado.current;
          if (b) return;
          const movido = Math.hypot(e.x - inicio.current.x, e.y - inicio.current.y) > 10;
          if (!m && movido) {
            const de = inicio.current.i;
            if (cols[de] === 0) return;
            setColunas((c) => c.map((v, k) => (k === de ? v - 1 : v)));
            setMao({ de, x: e.x, y: e.y, arrastando: true });
            return;
          }
          if (m?.arrastando) setMao({ ...m, x: e.x, y: e.y });
        })
        .onEnd((e) => {
          const { bloqueado: b, colunas: cols, mao: m } = estado.current;
          if (b) return;
          const i = indiceEm(e.x);
          if (m?.arrastando) return soltarEm(i);
          // toque: pega o livro de cima ou solta o que está na mão
          if (m) return soltarEm(i);
          if (cols[i] === 0) return;
          setColunas((c) => c.map((v, k) => (k === i ? v - 1 : v)));
          setMao({ de: i, x: e.x, y: e.y, arrastando: false });
        }),
    [n], // eslint-disable-line react-hooks/exhaustive-deps
  );

  function conferir() {
    if (mao !== null) return onErro("Você está segurando um livro. Solte ele numa pilha primeiro.");
    if (niveladas)
      return onAcerto(`Isso! Todas ficaram com ${colunas[0]} ${rodada.unidade}: a média é ${total} ÷ ${n} = ${media}.`);
    onErro("As pilhas ainda têm alturas diferentes. Passe livros das mais altas para as mais baixas.");
  }

  // altura disponível para as pilhas (sem nomes e base)
  const alturaPilhas = maior * (LIVRO + VAO) + 8;
  const yNivel = (v: number) => alturaPilhas - v * (LIVRO + VAO);

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={l.painel}>
        <View style={{ flex: 1 }}>
          <Texto style={{ fontSize: 13, color: cor.textoSuave }}>Total de {rodada.unidade}</Texto>
          <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 24, color: cor.tinta, lineHeight: 30 }}>
            {total}
          </Texto>
        </View>
        <View style={l.divisor} />
        <View style={{ flex: 1 }}>
          <Texto style={{ fontSize: 13, color: cor.textoSuave }}>Pilhas</Texto>
          <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 24, color: cor.tinta, lineHeight: 30 }}>{n}</Texto>
        </View>
        <View style={l.divisor} />
        <View style={{ flex: 1.2, alignItems: "flex-end" }}>
          <Texto style={{ fontSize: 13, color: cor.textoSuave }}>Média</Texto>
          {niveladas ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 24, color: cor.roxo, lineHeight: 30 }}>
                {colunas[0]}
              </Texto>
              <View style={l.ok}>
                <Check tamanho={12} />
              </View>
            </View>
          ) : (
            <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 24, color: cor.textoFraco, lineHeight: 30 }}>
              ?
            </Texto>
          )}
        </View>
      </View>

      {/* estante */}
      <View style={{ flex: 1, justifyContent: "center" }} onLayout={(e) => setAlturaPalco(e.nativeEvent.layout.height)}>
        <View style={l.estante}>
          <GestureDetector gesture={gesto}>
            <View
              collapsable={false}
              style={{ height: Math.min(alturaPilhas + 52, alturaPalco - 30) }}
              onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
            >
              {/* linha da média: aparece com a dica ou quando niveladas */}
              {dica || niveladas ? (
                <View style={[l.linhaMedia, { top: yNivel(media) + 3 }]}>
                  <View style={l.seloMedia}>
                    <Texto style={{ fontSize: 12, color: "#FFFFFF", fontFamily: fonte.textoForte }}>
                      média {media}
                    </Texto>
                  </View>
                </View>
              ) : null}
              <View style={{ flexDirection: "row", flex: 1 }}>
                {colunas.map((qtd, i) => (
                  <View key={i} style={[l.coluna, alvoArraste === i && l.colunaAlvo]}>
                    <View style={{ height: alturaPilhas, justifyContent: "flex-end", alignItems: "center", gap: VAO }}>
                      {Array.from({ length: qtd }, (_, k) => (
                        <Livro key={k} i={i} destaque={k === qtd - 1 && mao === null} />
                      ))}
                    </View>
                    <View style={[l.contador, { backgroundColor: CORES[i % CORES.length]!.capa }]}>
                      <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 14, color: "#FFFFFF", lineHeight: 18 }}>
                        {qtd}
                      </Texto>
                    </View>
                    <Texto
                      style={{ fontSize: 13, color: cor.textoSuave, fontFamily: fonte.textoForte }}
                      numberOfLines={1}
                    >
                      {rodada.nomes[i]}
                    </Texto>
                  </View>
                ))}
              </View>
              {/* livro na mão (segue o dedo) */}
              {mao ? (
                <View pointerEvents="none" style={[l.flutuante, { left: mao.x - LARG / 2, top: mao.y - LIVRO - 10 }]}>
                  <Livro i={mao.de} destaque />
                </View>
              ) : null}
            </View>
          </GestureDetector>
        </View>
        <Texto style={{ fontSize: 13, color: cor.textoSuave, textAlign: "center", marginTop: 10 }}>
          Arraste o livro de cima de uma pilha até outra (ou toque para pegar e toque para soltar).
        </Texto>
      </View>

      <Acoes>
        <Botao
          titulo="Recomeçar"
          variante="secundario"
          onPress={() => {
            setColunas(rodada.colunas);
            setMao(null);
          }}
          disabled={bloqueado}
        />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const l = criarEstilos(() => ({
  painel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: raio.m,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  divisor: { width: 1, alignSelf: "stretch", backgroundColor: cor.borda },
  ok: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.roxo,
  },
  estante: {
    paddingTop: 14,
    paddingHorizontal: 6,
    paddingBottom: 10,
    borderRadius: 20,
    backgroundColor: "#F6E7D3",
    borderWidth: 3,
    borderColor: "#C9A07A",
    borderBottomWidth: 10,
  },
  coluna: { flex: 1, alignItems: "center", gap: 6, borderRadius: 14, paddingTop: 4 },
  colunaAlvo: { backgroundColor: "rgba(123,97,255,0.12)" },
  livro: { width: LARG, height: LIVRO, borderRadius: 5, borderWidth: 2 },
  faixa: { position: "absolute", top: 3, bottom: 3, width: 3, right: 5, borderRadius: 2 },
  contador: { minWidth: 30, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, alignItems: "center" },
  flutuante: { position: "absolute", transform: [{ rotate: "-6deg" }, { scale: 1.12 }] },
  linhaMedia: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: cor.pessegoEscuro,
    zIndex: 2,
  },
  seloMedia: {
    position: "absolute",
    right: 0,
    top: -12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: cor.pessegoEscuro,
  },
}));
