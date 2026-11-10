import { useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, View, type ViewInstance } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import type { RodadaRepartir } from "@modolume/core";
import { CABELOS, DesenhoRosto, ROSTO_PADRAO } from "../Rosto";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Dividir em partes iguais (manipulação): os itens ficam num monte; "Um para
 * cada" faz um item voar até cada amigo (ou pote). Tocar num amigo dá só para
 * ele. O que não dá para dividir igual fica no monte: é o resto.
 */

const NATIVO = Platform.OS !== "web";

/** Desenho pequeno do item. */
function Item({ tipo, t = 18 }: { tipo: RodadaRepartir["item"]; t?: number }) {
  return (
    <Svg width={t} height={t} viewBox="0 0 20 20">
      {tipo === "figurinha" ? (
        <>
          <Rect x={3} y={2} width={14} height={16} rx={2.5} fill="#FFFFFF" stroke={cor.roxo} strokeWidth={1.6} />
          <Path
            d="M10 6 L11.2 9 L14 9.3 L11.8 11.2 L12.5 14 L10 12.5 L7.5 14 L8.2 11.2 L6 9.3 L8.8 9 Z"
            fill={cor.pessego}
          />
        </>
      ) : tipo === "bala" ? (
        <>
          <Path d="M2 7 L6 10 L2 13 Z M18 7 L14 10 L18 13 Z" fill={cor.lilas} />
          <Circle cx={10} cy={10} r={5} fill={cor.roxo} />
          <Path d="M7.5 8.5 Q10 11 12.5 8.5" stroke="#FFFFFF" strokeWidth={1.2} fill="none" />
        </>
      ) : tipo === "lapis" ? (
        <>
          <Rect x={8} y={2} width={5} height={12} rx={1} fill={cor.pessego} />
          <Rect x={8} y={2} width={5} height={3} fill={cor.lilas} />
          <Path d="M8 14 L10.5 19 L13 14 Z" fill="#F6D9A6" />
          <Path d="M9.8 17.5 L10.5 19 L11.2 17.5 Z" fill={cor.tinta} />
        </>
      ) : (
        <>
          <Circle cx={10} cy={10} r={7.5} fill="#E2B57C" stroke="#B8894F" strokeWidth={1} />
          <Circle cx={8} cy={8} r={1.1} fill="#7A4A35" />
          <Circle cx={12.5} cy={11} r={1.1} fill="#7A4A35" />
          <Circle cx={8.5} cy={13} r={1} fill="#7A4A35" />
        </>
      )}
    </Svg>
  );
}

/** Pote de vidro (quando quem recebe são potes). */
function Pote() {
  return (
    <Svg width={58} height={58} viewBox="0 0 46 46">
      <Rect x={10} y={4} width={26} height={7} rx={2} fill={cor.roxo} />
      <Path
        d="M8 14 Q8 11 11 11 H35 Q38 11 38 14 V38 Q38 43 33 43 H13 Q8 43 8 38 Z"
        fill="#EAF7FF"
        stroke={cor.azul}
        strokeWidth={2}
      />
      <Path d="M13 18 V34" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
    </Svg>
  );
}

interface Voo {
  id: number;
  de: { x: number; y: number };
  para: { x: number; y: number };
  v: Animated.Value;
}

export function JogoRepartir({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaRepartir>) {
  const { total, grupos, item } = rodada;
  const [monte, setMonte] = useState(total);
  const [recebidos, setRecebidos] = useState<number[]>(() => Array.from({ length: grupos }, () => 0));
  const [voos, setVoos] = useState<Voo[]>([]);
  const contador = useRef(0);
  const caixa = useRef<ViewInstance>(null);
  const refMonte = useRef<ViewInstance>(null);
  const refs = useRef<(ViewInstance | null)[]>([]);

  /** Faz itens voarem do monte até os escolhidos (e só então conta). */
  function voar(alvos: number[]) {
    if (!caixa.current || !refMonte.current) return;
    caixa.current.measureInWindow((cx, cy) => {
      refMonte.current!.measureInWindow((mx, my, mw, mh) => {
        alvos.forEach((g, k) => {
          refs.current[g]?.measureInWindow((rx, ry, rw, rh) => {
            const v = new Animated.Value(0);
            const voo: Voo = {
              id: contador.current++,
              de: { x: mx - cx + mw / 2 - 9, y: my - cy + mh / 2 - 9 },
              para: { x: rx - cx + rw / 2 - 9, y: ry - cy + rh * 0.35 - 9 },
              v,
            };
            setVoos((l) => [...l, voo]);
            Animated.timing(v, {
              toValue: 1,
              duration: 520,
              delay: k * 90,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: NATIVO,
            }).start(() => {
              setVoos((l) => l.filter((x) => x.id !== voo.id));
              setRecebidos((r) => r.map((n, i) => (i === g ? n + 1 : n)));
            });
          });
        });
      });
    });
  }

  function umParaCada() {
    if (bloqueado) return;
    if (monte < grupos) return onErro(`Sobraram ${monte}: não dá para dar mais um para cada. Isso é o resto!`);
    setMonte((m) => m - grupos);
    voar(Array.from({ length: grupos }, (_, i) => i));
  }

  function darPara(g: number) {
    if (bloqueado || monte === 0) return;
    setMonte((m) => m - 1);
    voar([g]);
  }

  function recolher() {
    setMonte(total);
    setRecebidos(Array.from({ length: grupos }, () => 0));
  }

  function conferir() {
    if (voos.length) return;
    const iguais = recebidos.every((n) => n === recebidos[0]);
    if (!iguais) return onErro("Alguém ganhou mais que os outros. Na divisão, todos recebem o mesmo tanto.");
    if (monte >= grupos) return onErro(`Ainda há ${monte} no monte: dá para dar mais um para cada.`);
    const q = recebidos[0]!;
    onAcerto(
      monte === 0
        ? `${total} ÷ ${grupos} = ${q}. Cada um ganhou ${q}, sem sobrar nada!`
        : `${total} ÷ ${grupos} = ${q} e sobram ${monte}. O resto é o que não dá para dividir igual.`,
    );
  }

  const colunas = grupos <= 3 ? grupos : grupos === 4 ? 2 : 3;
  // figurinhas grandes o bastante para contar de olho; encolhem um pouco nas contas maiores
  const tamMesa = total <= 20 ? 36 : 30;
  const tamPrato = colunas >= 3 && total > 20 ? 24 : 30;

  return (
    <View ref={caixa} collapsable={false} style={{ flex: 1, gap: 12 }}>
      <View style={r.conta}>
        <View style={r.sinal}>
          <Texto style={{ fontFamily: fonte.tituloForte, color: cor.roxo, fontSize: 18 }}>
            {total} ÷ {grupos}
          </Texto>
        </View>
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-around" }}>
          <View style={{ alignItems: "center" }}>
            <Texto style={r.contaNumero}>{Math.min(...recebidos)}</Texto>
            <Texto style={r.contaRotulo}>cada um já tem</Texto>
          </View>
          <View style={{ alignItems: "center" }}>
            <Texto style={[r.contaNumero, { color: cor.pessegoEscuro }]}>{monte}</Texto>
            <Texto style={r.contaRotulo}>na mesa</Texto>
          </View>
        </View>
      </View>

      <View ref={refMonte} collapsable={false} style={r.monte}>
        <View style={r.tampo} />
        <View style={r.itens}>
          {Array.from({ length: monte }, (_, i) => (
            <View key={i} style={{ transform: [{ rotate: `${((i * 37) % 21) - 10}deg` }] }}>
              <Item tipo={item} t={tamMesa} />
            </View>
          ))}
          {monte === 0 ? <Texto style={{ color: "#8C6A44", fontSize: 13 }}>A mesa ficou vazia</Texto> : null}
        </View>
      </View>

      {/* quem recebe (centralizado no espaço que sobra) */}
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View style={r.grupos}>
          {recebidos.map((n, g) => (
            <View key={g} style={{ width: `${100 / colunas}%`, padding: 4 }}>
              <Pressable
                ref={(el) => {
                  refs.current[g] = el;
                }}
                collapsable={false}
                onPress={() => darPara(g)}
                accessibilityLabel={`Dar um para ${rodada.quem === "potes" ? "o pote" : "a pessoa"} ${g + 1}`}
                style={({ pressed }) => [r.grupo, pressed && { backgroundColor: cor.roxoClaro }]}
              >
                {rodada.quem === "potes" ? (
                  <Pote />
                ) : (
                  <DesenhoRosto
                    rosto={{
                      ...ROSTO_PADRAO,
                      pele: (g * 2 + 1) % 6,
                      cabelo: CABELOS[g % CABELOS.length]!,
                      corCabelo: g % 5,
                      fundo: g % 6,
                    }}
                    tamanho={58}
                  />
                )}
                {/* pratinho com o que recebeu */}
                <View style={r.prato}>
                  <View style={r.recebidos}>
                    {Array.from({ length: n }, (_, i) => (
                      <Item key={i} tipo={item} t={tamPrato} />
                    ))}
                  </View>
                </View>
                <View style={[r.contador, n > 0 && { backgroundColor: cor.roxo }]}>
                  <Texto
                    style={{ fontFamily: fonte.tituloForte, fontSize: 14, color: n > 0 ? "#FFFFFF" : cor.textoSuave }}
                  >
                    {n}
                  </Texto>
                </View>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {voos.map((v) => (
        <Animated.View
          key={v.id}
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: [
              { translateX: v.v.interpolate({ inputRange: [0, 1], outputRange: [v.de.x, v.para.x] }) },
              {
                translateY: v.v.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [v.de.y, Math.min(v.de.y, v.para.y) - 30, v.para.y],
                }),
              },
              { scale: v.v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.4, 0.8] }) },
            ],
          }}
        >
          <Item tipo={item} t={tamPrato} />
        </Animated.View>
      ))}

      <Acoes>
        <Botao titulo="Recolher" variante="secundario" onPress={recolher} disabled={bloqueado || monte === total} />
        <Botao titulo="1 para cada" variante="destaque" onPress={umParaCada} disabled={bloqueado} style={{ flex: 1 }} />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado || monte === total} />
      </Acoes>
    </View>
  );
}

const r = criarEstilos(() => ({
  pedido: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: raio.m,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  sinal: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: cor.roxoClaro },
  conta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: raio.m,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  contaNumero: { fontFamily: fonte.tituloForte, fontSize: 20, color: cor.roxo, lineHeight: 24 },
  contaRotulo: { fontSize: 11, color: cor.textoSuave },
  monte: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: "#E9C9A0",
    borderBottomWidth: 8,
    borderBottomColor: "#C49C68",
    minHeight: 80,
    justifyContent: "center",
  },
  tampo: { position: "absolute", left: 8, right: 8, top: 6, height: 3, borderRadius: 2, backgroundColor: "#F3DDBF" },
  prato: {
    alignSelf: "stretch",
    marginHorizontal: 6,
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: cor.borda,
    justifyContent: "center",
    paddingVertical: 4,
  },
  contador: {
    minWidth: 30,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: cor.suave,
    alignItems: "center",
  },
  rotulo: { fontFamily: fonte.textoForte, fontSize: 12, color: cor.pessegoEscuro, marginBottom: 6 },
  itens: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center" },
  grupos: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  grupo: {
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    borderRadius: raio.m,
    backgroundColor: cor.lilasClaro,
    borderWidth: 1,
    borderColor: cor.borda,
    minHeight: 160,
    paddingVertical: 12,
  },
  recebidos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 3,
    minHeight: 26,
    paddingHorizontal: 6,
  },
}));
