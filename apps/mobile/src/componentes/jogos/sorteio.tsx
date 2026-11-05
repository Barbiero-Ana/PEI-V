import { useEffect, useState } from "react";
import { Animated, Platform, Pressable, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import type { RodadaSorteio } from "@modolume/core";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, porTema, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Sorteio justo (probabilidade): tocar num potinho de cor joga uma bolinha no
 * pote de vidro; tocar numa bolinha do pote a devolve. Duas barras comparam a
 * chance pedida com a chance que o pote tem agora.
 */

type Cor = RodadaSorteio["cor"];
const CORES: Record<Cor, { nome: string; tinta: string; borda: string }> = porTema(() => ({
  roxo: { nome: "roxas", tinta: cor.roxo, borda: "#5A43D6" },
  pessego: { nome: "pêssego", tinta: cor.pessego, borda: "#D9784A" },
  azul: { nome: "azuis", tinta: cor.azul, borda: "#4C9FD4" },
}));
const ORDEM: Cor[] = ["roxo", "pessego", "azul"];
const BOLA = 34;
const NATIVO = Platform.OS !== "web";

function Bolinha({ c, t = BOLA }: { c: Cor; t?: number }) {
  const k = CORES[c];
  return (
    <Svg width={t} height={t} viewBox="0 0 34 34">
      <Circle cx={17} cy={17} r={15} fill={k.tinta} stroke={k.borda} strokeWidth={2.5} />
      <Circle cx={11.5} cy={11.5} r={4.2} fill="#FFFFFF" opacity={0.55} />
    </Svg>
  );
}

/** Bolinha que cai no pote ao entrar. */
function BolinhaCaindo({ c, onPress, desabilitada }: { c: Cor; onPress: () => void; desabilitada: boolean }) {
  const { animacoesReduzidas } = useAcessibilidade();
  const [y] = useState(() => new Animated.Value(animacoesReduzidas ? 0 : -160));
  useEffect(() => {
    if (animacoesReduzidas) return;
    Animated.spring(y, { toValue: 0, friction: 5, tension: 70, useNativeDriver: NATIVO }).start();
  }, [y, animacoesReduzidas]);
  return (
    <Animated.View style={{ transform: [{ translateY: y }] }}>
      <Pressable
        onPress={onPress}
        disabled={desabilitada}
        accessibilityRole="button"
        accessibilityLabel={`Tirar uma bolinha ${CORES[c].nome}`}
        hitSlop={2}
      >
        <Bolinha c={c} />
      </Pressable>
    </Animated.View>
  );
}

/** Barra de fração: `cheio` de `total` partes pintadas na cor. */
function BarraFracao({ cheio, total, tinta }: { cheio: number; total: number; tinta: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 3, flex: 1 }}>
      {Array.from({ length: Math.max(total, 1) }, (_, i) => (
        <View
          key={i}
          style={[s.parte, { backgroundColor: total === 0 ? cor.trilho : i < cheio ? tinta : cor.trilho }]}
        />
      ))}
    </View>
  );
}

export function JogoSorteio({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaSorteio>) {
  const [bolas, setBolas] = useState<{ id: number; c: Cor }[]>([]);
  const [proximoId, setProximoId] = useState(0);
  const total = bolas.length;
  const daCor = bolas.filter((b) => b.c === rodada.cor).length;
  const alvo = CORES[rodada.cor];
  const [n, d] = rodada.chance;
  const precisa = (rodada.total * n) / d;
  const cheio = total >= rodada.total;

  function colocar(c: Cor) {
    if (bloqueado || cheio) return;
    setBolas((b) => [...b, { id: proximoId, c }]);
    setProximoId((i) => i + 1);
  }

  function tirar(id: number) {
    if (bloqueado) return;
    setBolas((b) => b.filter((x) => x.id !== id));
  }

  function conferir() {
    if (total !== rodada.total) return onErro(`O pote precisa ter ${rodada.total} bolinhas. Agora tem ${total}.`);
    if (daCor === precisa)
      return onAcerto(`Isso! ${precisa} de ${rodada.total} bolinhas são ${alvo.nome}: a chance é ${n} em ${d}.`);
    onErro(
      `Com ${daCor} ${alvo.nome} em ${rodada.total}, a chance é ${daCor} em ${rodada.total}. Precisa ser ${n} em ${d}.`,
    );
  }

  return (
    <View style={{ flex: 1, gap: 12 }}>
      {/* comparação das chances */}
      <View style={s.painel}>
        <View style={s.linhaChance}>
          <Texto style={s.rotuloChance}>Pedido</Texto>
          <BarraFracao cheio={n} total={d} tinta={alvo.tinta} />
          <Texto style={s.valorChance}>
            {n} em {d}
          </Texto>
        </View>
        <View style={s.linhaChance}>
          <Texto style={s.rotuloChance}>Seu pote</Texto>
          <BarraFracao cheio={daCor} total={total} tinta={alvo.tinta} />
          <Texto style={s.valorChance}>{total === 0 ? "—" : `${daCor} em ${total}`}</Texto>
        </View>
        {dica ? (
          <Texto style={{ fontSize: 14, color: cor.pessegoEscuro, fontFamily: fonte.textoForte, marginTop: 4 }}>
            {n} em {d} com {rodada.total} bolinhas = {precisa} {alvo.nome} e {rodada.total - precisa} de outras cores.
          </Texto>
        ) : null}
      </View>

      {/* o pote de vidro */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View style={s.pote}>
          <View style={s.tampa} />
          <View style={s.vidro}>
            <View style={s.reflexo} />
            <View style={s.bolinhas}>
              {bolas.map((b) => (
                <BolinhaCaindo key={b.id} c={b.c} onPress={() => tirar(b.id)} desabilitada={bloqueado} />
              ))}
            </View>
          </View>
          <View style={s.etiqueta}>
            <Texto style={{ fontFamily: fonte.titulo, fontSize: 14, color: cor.tinta }}>
              {total} de {rodada.total}
            </Texto>
          </View>
        </View>
      </View>

      {/* potinhos de cor: tocar joga uma bolinha */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {ORDEM.map((c) => (
          <Pressable
            key={c}
            onPress={() => colocar(c)}
            disabled={bloqueado || cheio}
            accessibilityRole="button"
            accessibilityLabel={`Colocar uma bolinha ${CORES[c].nome}`}
            style={({ pressed }) => [
              s.potinho,
              c === rodada.cor && { borderColor: CORES[c].tinta },
              (bloqueado || cheio) && { opacity: 0.5 },
              pressed && { transform: [{ scale: 0.95 }] },
            ]}
          >
            <View style={{ flexDirection: "row", marginBottom: 4 }}>
              <Bolinha c={c} t={26} />
              <View style={{ marginLeft: -8 }}>
                <Bolinha c={c} t={26} />
              </View>
            </View>
            <Texto style={{ fontFamily: fonte.textoForte, fontSize: 13, color: cor.tinta }}>+ {CORES[c].nome}</Texto>
          </Pressable>
        ))}
      </View>
      <Texto style={{ fontSize: 13, color: cor.textoSuave, textAlign: "center" }}>
        Toque numa bolinha do pote para tirar.
      </Texto>

      <Acoes>
        <Botao
          titulo="Esvaziar"
          variante="secundario"
          onPress={() => setBolas([])}
          disabled={bloqueado || total === 0}
        />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const s = criarEstilos(() => ({
  painel: {
    gap: 10,
    padding: 14,
    borderRadius: raio.m,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  linhaChance: { flexDirection: "row", alignItems: "center", gap: 10 },
  rotuloChance: { width: 70, fontSize: 13, color: cor.textoSuave, fontFamily: fonte.textoForte },
  valorChance: { width: 72, textAlign: "right", fontFamily: fonte.titulo, fontSize: 15, color: cor.tinta },
  parte: { flex: 1, height: 14, borderRadius: 4 },
  pote: { alignItems: "center" },
  tampa: {
    width: 150,
    height: 22,
    borderRadius: 8,
    backgroundColor: cor.pessego,
    borderWidth: 2.5,
    borderColor: cor.tinta,
    zIndex: 2,
  },
  vidro: {
    width: 230,
    minHeight: 200,
    marginTop: -6,
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 14,
    borderRadius: 40,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: "#EEF8FF",
    borderWidth: 3,
    borderColor: "#9CCBEA",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  reflexo: {
    position: "absolute",
    left: 14,
    top: 20,
    width: 10,
    height: 120,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
    opacity: 0.8,
  },
  bolinhas: { flexDirection: "row", flexWrap: "wrap-reverse", justifyContent: "center", gap: 4 },
  etiqueta: {
    marginTop: -16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: cor.borda,
  },
  potinho: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: cor.superficie,
    borderWidth: 2,
    borderColor: cor.borda,
  },
}));
