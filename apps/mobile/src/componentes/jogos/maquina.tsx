import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import type { RodadaMaquina } from "@modolume/core";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { Botao, Texto } from "../ui";
import { Check } from "../Icones";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Máquina misteriosa (funções): a máquina tem dois mostradores, "×" e "+".
 * A criança ajusta os dois e testa: cada cartão de teste passa pela máquina e
 * acende quando a saída bate com a da máquina misteriosa.
 */

const MAX_MULT = 10;
const MAX_SOMA = 20;

function Mostrador({
  sinal,
  valor,
  min,
  max,
  onMudar,
  bloqueado,
  tinta,
}: {
  sinal: string;
  valor: number;
  min: number;
  max: number;
  onMudar: (v: number) => void;
  bloqueado: boolean;
  tinta: string;
}) {
  return (
    <View style={m.mostrador}>
      <View style={[m.sinal, { backgroundColor: tinta }]}>
        <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 20, color: "#FFFFFF", lineHeight: 26 }}>{sinal}</Texto>
      </View>
      <View style={m.visorMostrador}>
        <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 30, color: "#C8F7D2", lineHeight: 36 }}>{valor}</Texto>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={() => onMudar(Math.max(min, valor - 1))}
          disabled={bloqueado || valor <= min}
          accessibilityLabel={`Diminuir ${sinal}`}
          style={({ pressed }) => [m.girar, (bloqueado || valor <= min) && { opacity: 0.4 }, pressed && m.apertado]}
        >
          <Texto style={m.textoGirar}>−</Texto>
        </Pressable>
        <Pressable
          onPress={() => onMudar(Math.min(max, valor + 1))}
          disabled={bloqueado || valor >= max}
          accessibilityLabel={`Aumentar ${sinal}`}
          style={({ pressed }) => [m.girar, (bloqueado || valor >= max) && { opacity: 0.4 }, pressed && m.apertado]}
        >
          <Texto style={m.textoGirar}>+</Texto>
        </Pressable>
      </View>
    </View>
  );
}

export function JogoMaquina({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaMaquina>) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [mult, setMult] = useState(1);
  const [soma, setSoma] = useState(0);
  // quantos cartões já passaram pela máquina no teste (null = sem teste)
  const [testados, setTestados] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saidas = rodada.pares.map(([e]) => e * mult + soma);
  const certos = rodada.pares.map(([, s], i) => saidas[i] === s);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function mudar(f: (v: number) => void, v: number) {
    setTestados(null);
    f(v);
  }

  function concluir() {
    if (certos.every(Boolean))
      return onAcerto(`Isso! A regra é: entrada × ${mult} + ${soma}. Funciona para todos os cartões.`);
    const errada = certos.findIndex((c) => !c);
    const [e, s] = rodada.pares[errada]!;
    onErro(`Com a sua regra, ${e} vira ${saidas[errada]}, mas a máquina dá ${s}. Ajuste o × ou o +.`);
  }

  function testar() {
    if (animacoesReduzidas) {
      setTestados(rodada.pares.length);
      return concluir();
    }
    const passo = (i: number) => {
      setTestados(i);
      if (i >= rodada.pares.length) return concluir();
      timer.current = setTimeout(() => passo(i + 1), 450);
    };
    passo(1);
  }

  return (
    <View style={{ flex: 1, gap: 12 }}>
      {/* cartões de teste */}
      <View style={m.cartoes}>
        {rodada.pares.map(([e, s], i) => {
          const passou = testados !== null && i < testados;
          const ok = passou && certos[i];
          return (
            <View
              key={i}
              style={[m.cartao, passou && (ok ? m.cartaoOk : m.cartaoErro)]}
              accessibilityLabel={`Entra ${e}, a máquina dá ${s}${passou ? `, sua regra dá ${saidas[i]}` : ""}`}
            >
              <View style={m.entra}>
                <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 20, color: cor.tinta, lineHeight: 26 }}>
                  {e}
                </Texto>
              </View>
              <Svg width={14} height={14} viewBox="0 0 14 14">
                <Path
                  d="M7 1 V12 M2 8 L7 13 L12 8"
                  stroke={cor.textoSuave}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />
              </Svg>
              <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 22, color: cor.roxo, lineHeight: 28 }}>
                {s}
              </Texto>
              <View style={[m.sua, passou && { backgroundColor: ok ? cor.roxo : cor.pessego }]}>
                {passou && ok ? <Check tamanho={11} /> : null}
                <Texto
                  style={{
                    fontFamily: fonte.textoForte,
                    fontSize: 13,
                    color: passou ? "#FFFFFF" : cor.textoSuave,
                  }}
                >
                  {passou ? saidas[i] : "?"}
                </Texto>
              </View>
            </View>
          );
        })}
      </View>
      <Texto style={{ fontSize: 13, color: cor.textoSuave, textAlign: "center" }}>
        Em cima: o que entra · roxo: o que a máquina dá · etiqueta: o que a sua regra dá
      </Texto>

      {/* a máquina */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Svg width={120} height={34} viewBox="0 0 120 34" style={{ marginBottom: -4 }}>
          <Path
            d="M10 2 H110 L80 32 H40 Z"
            fill={cor.pessego}
            stroke={cor.tinta}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          <Path d="M28 10 H92" stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
        </Svg>
        <View style={m.corpo}>
          <View style={m.luzes}>
            {[cor.pessego, cor.azul, "#7DBE7A"].map((c, i) => (
              <View
                key={c}
                style={[
                  m.luz,
                  { backgroundColor: c },
                  testados !== null && testados > i && testados <= rodada.pares.length && { borderColor: "#FFFFFF" },
                ]}
              />
            ))}
            <Texto style={{ marginLeft: "auto", color: cor.lilasNoEscuro, fontFamily: fonte.textoForte, fontSize: 13 }}>
              entrada × {mult} + {soma}
            </Texto>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Mostrador
              sinal="×"
              valor={mult}
              min={1}
              max={MAX_MULT}
              onMudar={(v) => mudar(setMult, v)}
              bloqueado={bloqueado}
              tinta={cor.roxo}
            />
            <Mostrador
              sinal="+"
              valor={soma}
              min={0}
              max={MAX_SOMA}
              onMudar={(v) => mudar(setSoma, v)}
              bloqueado={bloqueado}
              tinta={cor.pessegoEscuro}
            />
          </View>
          {dica ? (
            <Texto style={{ color: "#FFE1CC", fontSize: 14, textAlign: "center", marginTop: 10 }}>
              Quando a entrada sobe {rodada.pares[1]![0] - rodada.pares[0]![0]}, a saída sobe{" "}
              {rodada.pares[1]![1] - rodada.pares[0]![1]}.
            </Texto>
          ) : null}
        </View>
        <Svg width={90} height={22} viewBox="0 0 90 22" style={{ marginTop: -2 }}>
          <Rect x={20} y={0} width={50} height={14} rx={3} fill="#1A2160" />
          <Circle cx={45} cy={18} r={4} fill={cor.pessego} />
        </Svg>
      </View>

      <Acoes>
        <Botao
          titulo="Zerar"
          variante="secundario"
          onPress={() => {
            setMult(1);
            setSoma(0);
            setTestados(null);
          }}
          disabled={bloqueado}
        />
        <Botao titulo="Testar a máquina" onPress={testar} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const m = criarEstilos(() => ({
  cartoes: { flexDirection: "row", gap: 8 },
  cartao: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: raio.m,
    backgroundColor: cor.superficie,
    borderWidth: 2,
    borderColor: cor.borda,
  },
  cartaoOk: { borderColor: cor.roxo, backgroundColor: cor.roxoClaro },
  cartaoErro: { borderColor: cor.pessego, backgroundColor: cor.pessegoClaro },
  entra: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.fundo,
    borderWidth: 2,
    borderColor: cor.bordaForte,
  },
  sua: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 44,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: cor.suave,
  },
  corpo: {
    width: "100%",
    padding: 14,
    borderRadius: 26,
    backgroundColor: "#2A3488",
    borderBottomWidth: 8,
    borderBottomColor: "#1A2160",
  },
  luzes: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  luz: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "transparent", opacity: 0.9 },
  mostrador: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 18,
    backgroundColor: "#3A4499",
  },
  sinal: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  visorMostrador: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#1F3B2C",
  },
  girar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 4,
    borderBottomColor: "#C9C3E6",
  },
  apertado: { transform: [{ translateY: 2 }], borderBottomWidth: 2 },
  textoGirar: { fontFamily: fonte.tituloForte, fontSize: 24, color: cor.tinta, lineHeight: 30 },
}));
