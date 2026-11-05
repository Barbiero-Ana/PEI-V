import { useEffect, useMemo, useState } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import type { RodadaTrilha } from "@modolume/core";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { embaralhar, sementeDe } from "@/lib/embaralhar";
import { Arrastavel, ZonaSoltura } from "@/lib/arraste";
import { Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";

/**
 * Trilha numérica (sequência): arrasta cada número para a sua casa, do menor
 * para o maior. Cada casa preenchida acende o caminho. O número aparece como
 * o objeto da situação: camiseta de corredor, porta de armário, senha da
 * padaria ou envelope do carteiro.
 */

type Tema = NonNullable<RodadaTrilha["tema"]>;

const CENA: Record<Tema, { titulo: string; inicio: string; fundo: string; faixa: string }> = {
  corrida: { titulo: "Camisetas dos corredores", inicio: "largada", fundo: "#FFF1E7", faixa: "#FFC9A6" },
  armarios: { titulo: "Plaquinhas dos armários", inicio: "entrada do vestiário", fundo: "#EAF7FF", faixa: "#BFE6FF" },
  senhas: { titulo: "Senhas da padaria", inicio: "começo da fila", fundo: "#F5F0FF", faixa: "#D9CCFF" },
  casas: { titulo: "Cartas para entregar", inicio: "começo da rua", fundo: "#F2EFFC", faixa: "#C9CBDD" },
};

/** O número desenhado como objeto do cenário. */
function Objeto({ v, tema, compacto }: { v: number; tema: Tema; compacto: boolean }) {
  // com 6 números, tudo um pouco menor para caber numa fileira só
  const medida = compacto ? { width: LARGURA_COMPACTA, height: Math.round(ALTURA[tema] * 0.84) } : null;
  const fonteNumero = compacto ? { fontSize: 20, lineHeight: 25 } : null;
  switch (tema) {
    case "corrida":
      return (
        <View style={[o.base, o.camiseta, medida]}>
          <View style={o.faixaCamiseta} />
          {[o.alfTL, o.alfTR, o.alfBL, o.alfBR].map((p, i) => (
            <View key={i} style={[o.alfinete, p]} />
          ))}
          <Texto style={[o.numero, fonteNumero, { color: cor.tinta }]}>{v}</Texto>
        </View>
      );
    case "armarios":
      return (
        <View style={[o.base, o.armario, medida]}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={o.ventilacao} />
          ))}
          <View style={o.plaquinha}>
            <Texto style={[o.numero, { fontSize: compacto ? 17 : 20, lineHeight: 24 }]}>{v}</Texto>
          </View>
          <View style={o.puxador} />
        </View>
      );
    case "senhas":
      return (
        <View style={[o.base, o.senha, medida]}>
          <View style={[o.picote, { left: -7 }]} />
          <View style={[o.picote, { right: -7 }]} />
          <Texto style={{ fontSize: 9, letterSpacing: 1, color: cor.textoSuave, fontFamily: fonte.textoForte }}>
            SENHA
          </Texto>
          <Texto style={[o.numero, fonteNumero, { color: cor.roxo }]}>{v}</Texto>
        </View>
      );
    case "casas":
      return (
        <View style={[o.base, o.envelope, medida]}>
          <View style={o.abaEsq} />
          <View style={o.abaDir} />
          <View style={o.selo} />
          <Texto style={[o.numero, fonteNumero, { marginTop: compacto ? 8 : 10 }]}>{v}</Texto>
        </View>
      );
  }
}

export function JogoTrilha({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaTrilha>) {
  const tema: Tema = rodada.tema ?? "corrida";
  const cena = CENA[tema];
  const ordem = useMemo(() => [...rodada.numeros].sort((a, b) => a - b), [rodada.numeros]);
  const cartas = useMemo(() => embaralharSemAcertar(rodada.numeros), [rodada.numeros]);
  const [casas, setCasas] = useState<(number | null)[]>(() => ordem.map(() => null));
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const n = ordem.length;

  function colocar(v: number, i: number) {
    if (bloqueado || casas[i] !== null) return;
    setSelecionado(null);
    if (ordem[i] !== v) {
      onErro(
        i === 0
          ? `O ${v} não é o menor de todos. Procure um número menor para a 1ª casa.`
          : `O ${v} não é o ${i + 1}º da fila. Dica: ${rodada.dica}`,
      );
      return;
    }
    const novas = casas.map((c, k) => (k === i ? v : c));
    setCasas(novas);
    if (novas.every((c) => c !== null)) onAcerto("Tudo em ordem, do menor para o maior!");
  }

  const usados = new Set(casas.filter((c): c is number => c !== null));
  let proxima = 0; // primeira casa ainda vazia
  while (proxima < n && casas[proxima] !== null) proxima += 1;
  const lado = n > 5 ? 46 : 54;
  const compacto = n > 5;

  return (
    <View style={{ flex: 1, gap: 14, justifyContent: "center" }}>
      <View style={[tr.campo, { backgroundColor: cena.fundo }]}>
        <Texto style={tr.rotulo}>{cena.titulo}</Texto>
        <View style={[tr.cartas, compacto && { gap: 7 }]}>
          {cartas.map((v, i) => {
            const escolhido = selecionado === v;
            return (
              <View
                key={v}
                style={{ transform: [{ rotate: `${(i % 3) - 1}deg` }, { translateY: escolhido ? -8 : 0 }] }}
              >
                {usados.has(v) ? (
                  <View
                    style={[
                      tr.vazio,
                      compacto
                        ? { width: LARGURA_COMPACTA, height: Math.round(ALTURA[tema] * 0.84) }
                        : { height: ALTURA[tema] },
                    ]}
                  />
                ) : (
                  <Arrastavel
                    desabilitado={bloqueado}
                    onSoltar={(alvo) => alvo?.startsWith("casa-") && colocar(v, Number(alvo.slice(5)))}
                    onToque={() => setSelecionado((s) => (s === v ? null : v))}
                    style={escolhido ? tr.escolhido : undefined}
                  >
                    <Objeto v={v} tema={tema} compacto={compacto} />
                  </Arrastavel>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={tr.trilha}>
        <View style={tr.cabecalho}>
          <Bandeira tipo="largada" />
          <Texto style={tr.legenda}>{`${cena.inicio} · do menor para o maior`}</Texto>
          <Bandeira tipo="chegada" />
        </View>
        <View>
          {/* pista atrás das casas; a parte já percorrida fica lilás */}
          <View style={[tr.pista, { top: lado / 2 - 5, left: lado / 2, right: lado / 2 }]}>
            <View style={[tr.percorrida, { width: `${(Math.max(0, proxima - 1) / Math.max(1, n - 1)) * 100}%` }]} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {ordem.map((_, i) => (
              <Casa
                key={i}
                indice={i}
                valor={casas[i] ?? null}
                proxima={i === proxima && !bloqueado}
                lado={lado}
                escolhendo={selecionado !== null}
                onPress={() => selecionado !== null && colocar(selecionado, i)}
              />
            ))}
          </View>
        </View>
      </View>
      <Texto style={{ fontSize: 13, color: cor.textoSuave, textAlign: "center" }}>
        {selecionado !== null
          ? `Agora toque na casa onde o ${selecionado} deve ficar.`
          : "Arraste um número até a casa, ou toque nele e depois na casa."}
      </Texto>
    </View>
  );
}

const ALTURA: Record<Tema, number> = { corrida: 64, armarios: 72, senhas: 64, casas: 50 };
const LARGURA_COMPACTA = 52;

/** Embaralha garantindo que os números não comecem já em ordem. */
function embaralharSemAcertar(numeros: number[]) {
  const base = sementeDe(numeros);
  for (let k = 0; k < 30; k += 1) {
    const t = embaralhar(numeros, base + k);
    if (t.some((v, i) => i > 0 && v < t[i - 1]!)) return t;
  }
  return [...numeros].reverse();
}

function Bandeira({ tipo }: { tipo: "largada" | "chegada" }) {
  return (
    <Svg width={22} height={26} viewBox="0 0 22 26">
      <Path d="M4 2 V24" stroke={cor.tinta} strokeWidth={2.4} strokeLinecap="round" />
      {tipo === "chegada" ? (
        <>
          <Rect x={5} y={3} width={15} height={11} rx={1.5} fill="#FFFFFF" stroke={cor.tinta} strokeWidth={1.6} />
          <Rect x={5} y={3} width={5} height={5.5} fill={cor.tinta} />
          <Rect x={15} y={3} width={5} height={5.5} fill={cor.tinta} />
          <Rect x={10} y={8.5} width={5} height={5.5} fill={cor.tinta} />
        </>
      ) : (
        <Path d="M5 3 H19 L15.5 8.5 L19 14 H5 Z" fill={cor.pessego} stroke={cor.tinta} strokeWidth={1.6} />
      )}
    </Svg>
  );
}

const NATIVO = Platform.OS !== "web";

/**
 * Uma casa da trilha. Ao receber o número, "assenta" com uma mola suave;
 * a próxima casa a preencher pulsa de leve, mostrando onde continuar.
 */
function Casa({
  indice,
  valor,
  proxima,
  lado,
  escolhendo,
  onPress,
}: {
  indice: number;
  valor: number | null;
  proxima: boolean;
  lado: number;
  escolhendo: boolean;
  onPress: () => void;
}) {
  const [entrada] = useState(() => new Animated.Value(valor === null ? 0 : 1));
  const [pulso] = useState(() => new Animated.Value(0));
  const { animacoesReduzidas } = useAcessibilidade();

  useEffect(() => {
    if (valor === null) return;
    entrada.setValue(0);
    Animated.spring(entrada, { toValue: 1, friction: 6, tension: 120, useNativeDriver: NATIVO }).start();
  }, [valor, entrada]);

  useEffect(() => {
    if (!proxima || animacoesReduzidas) {
      pulso.setValue(0);
      return;
    }
    const passo = (v: number) =>
      Animated.timing(pulso, { toValue: v, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVO });
    const l = Animated.loop(Animated.sequence([passo(1), passo(0)]));
    l.start();
    return () => l.stop();
  }, [proxima, pulso, animacoesReduzidas]);

  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      <View>
        {proxima ? (
          <Animated.View
            pointerEvents="none"
            style={[
              tr.anel,
              {
                width: lado + 12,
                height: lado + 12,
                borderRadius: (lado + 12) / 2,
                opacity: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.9] }),
                transform: [{ scale: pulso.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] }) }],
              },
            ]}
          />
        ) : null}
        <ZonaSoltura
          id={`casa-${indice}`}
          desativada={valor !== null}
          style={[
            tr.casa,
            { width: lado, height: lado, borderRadius: lado / 2 },
            escolhendo && valor === null && { borderColor: cor.roxo },
            valor !== null && { borderColor: "transparent" },
          ]}
          estiloAtivo={{ borderColor: cor.roxo, backgroundColor: cor.roxoClaro }}
        >
          <Pressable
            onPress={onPress}
            disabled={valor !== null}
            accessibilityRole="button"
            accessibilityLabel={valor !== null ? `Casa ${indice + 1}: ${valor}` : `Casa ${indice + 1}, vazia`}
            style={StyleSheet.absoluteFill}
          />
          {valor !== null ? (
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                tr.preenchida,
                {
                  borderRadius: lado / 2,
                  opacity: entrada,
                  transform: [{ scale: entrada.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
                },
              ]}
            >
              <Texto style={{ fontFamily: fonte.tituloForte, fontSize: lado > 50 ? 20 : 17, color: "#FFFFFF" }}>
                {valor}
              </Texto>
            </Animated.View>
          ) : null}
        </ZonaSoltura>
      </View>
      <Texto style={[tr.ordinal, valor !== null && { color: cor.roxo }]}>{indice + 1}º</Texto>
    </View>
  );
}

const tr = criarEstilos(() => ({
  campo: { borderRadius: raio.g, paddingVertical: 16, paddingHorizontal: 10 },
  rotulo: { textAlign: "center", fontFamily: fonte.titulo, fontSize: 15, color: cor.tinta },
  cartas: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-end",
    gap: 12,
    marginTop: 16,
    minHeight: 84,
  },
  escolhido: { borderRadius: 8, borderWidth: 3, borderColor: cor.roxo, margin: -3 },
  vazio: {
    width: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(30,42,120,0.18)",
  },
  trilha: {
    borderRadius: raio.g,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 14,
  },
  cabecalho: { flexDirection: "row", alignItems: "center", gap: 8 },
  legenda: { flex: 1, textAlign: "center", fontSize: 13, color: cor.textoSuave, fontFamily: fonte.textoMedio },
  pista: { position: "absolute", height: 10, borderRadius: 5, backgroundColor: cor.bordaForte, overflow: "hidden" },
  percorrida: { height: "100%", borderRadius: 5, backgroundColor: cor.roxo },
  anel: { position: "absolute", left: -6, top: -6, borderWidth: 3, borderColor: cor.lilas },
  preenchida: { backgroundColor: cor.roxo, alignItems: "center", justifyContent: "center" },
  casa: {
    borderWidth: 2.5,
    borderStyle: "dashed",
    borderColor: cor.bordaForte,
    backgroundColor: cor.superficie,
    alignItems: "center",
    justifyContent: "center",
  },
  ordinal: { fontSize: 12, color: cor.textoSuave, fontFamily: fonte.textoForte },
}));

const o = criarEstilos(() => ({
  base: { width: 64, height: 64, alignItems: "center", justifyContent: "center" },
  numero: { fontFamily: fonte.titulo, fontSize: 24, lineHeight: 30, color: cor.tinta },
  camiseta: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: cor.bordaForte,
    paddingTop: 8,
  },
  faixaCamiseta: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 9,
    backgroundColor: cor.pessego,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  alfinete: { position: "absolute", width: 5, height: 5, borderRadius: 3, backgroundColor: cor.textoFraco },
  alfTL: { top: 12, left: 5 },
  alfTR: { top: 12, right: 5 },
  alfBL: { bottom: 5, left: 5 },
  alfBR: { bottom: 5, right: 5 },
  armario: {
    height: 72,
    backgroundColor: "#7CC3EE",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: cor.azulEscuro,
    justifyContent: "flex-start",
    paddingTop: 6,
    gap: 3,
  },
  ventilacao: { width: 30, height: 2.5, borderRadius: 2, backgroundColor: cor.azulEscuro, opacity: 0.6 },
  plaquinha: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    paddingHorizontal: 6,
    minWidth: 34,
    alignItems: "center",
  },
  puxador: {
    position: "absolute",
    right: 6,
    bottom: 14,
    width: 4,
    height: 12,
    borderRadius: 2,
    backgroundColor: cor.tinta,
  },
  senha: { backgroundColor: "#FFFFFF", borderRadius: 4, borderWidth: 1.5, borderColor: cor.lilas, overflow: "visible" },
  picote: { position: "absolute", top: 25, width: 12, height: 12, borderRadius: 6, backgroundColor: "#F5F0FF" },
  envelope: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: cor.bordaForte,
    overflow: "hidden",
  },
  abaEsq: {
    position: "absolute",
    top: -18,
    left: -4,
    width: 40,
    height: 30,
    backgroundColor: "#F2EFFC",
    transform: [{ rotate: "30deg" }],
  },
  abaDir: {
    position: "absolute",
    top: -18,
    right: -4,
    width: 40,
    height: 30,
    backgroundColor: "#F2EFFC",
    transform: [{ rotate: "-30deg" }],
  },
  selo: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 10,
    height: 12,
    borderRadius: 2,
    backgroundColor: cor.pessego,
  },
}));
