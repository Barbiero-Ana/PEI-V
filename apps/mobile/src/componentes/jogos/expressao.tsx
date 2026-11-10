import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import type { RodadaExpressao } from "@modolume/core";
import { embaralhar, sementeDe } from "@/lib/embaralhar";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Calculadora maluca (ordem das operações): uma calculadora com as teclas
 * embaralhadas. Cada tecla só pode ser usada uma vez; o visor mostra a conta
 * sendo montada e resolve como uma calculadora de verdade (× e ÷ primeiro).
 */

const OPERADORES = new Set(["+", "−", "×", "÷"]);
const ehOperador = (c: string) => OPERADORES.has(c);

/** Resolve a conta (números e operadores alternados); null se ainda não for válida. */
function resolver(tokens: string[]): { valor: number; passos: string[] } | null {
  if (tokens.length === 0 || tokens.length % 2 === 0) return null;
  for (let i = 0; i < tokens.length; i += 1) {
    if (i % 2 === 0 ? ehOperador(tokens[i]!) : !ehOperador(tokens[i]!)) return null;
  }
  const passos: string[] = [];
  const pilha: (number | string)[] = [Number(tokens[0])];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i]!;
    const n = Number(tokens[i + 1]);
    if (op === "×" || op === "÷") {
      const a = pilha.pop() as number;
      const r = op === "×" ? a * n : a / n;
      passos.push(`${a} ${op} ${n} = ${r}`);
      pilha.push(r);
    } else {
      pilha.push(op, n);
    }
  }
  let valor = pilha[0] as number;
  for (let i = 1; i < pilha.length; i += 2) {
    const op = pilha[i] as string;
    const n = pilha[i + 1] as number;
    const r = op === "+" ? valor + n : valor - n;
    passos.push(`${valor} ${op} ${n} = ${r}`);
    valor = r;
  }
  return { valor, passos };
}

/** Embaralha as teclas garantindo que a ordem inicial não já seja a resposta. */
function embaralharCartas(rodada: RodadaExpressao) {
  const base = sementeDe([rodada.alvo, rodada.cartas.length, rodada.cartas.join("").length]);
  for (let k = 0; k < 40; k += 1) {
    const ordem = embaralhar(rodada.cartas, base + k);
    if (resolver(ordem)?.valor !== rodada.alvo) return ordem;
  }
  return [...rodada.cartas].reverse();
}

function Tecla({
  rotulo,
  tipo,
  onPress,
  desativada,
  usada = false,
  largura = 1,
}: {
  rotulo: string;
  tipo: "numero" | "operador" | "acao" | "igual";
  onPress: () => void;
  desativada: boolean;
  usada?: boolean;
  largura?: number;
}) {
  const estilo = tipo === "numero" ? k.numero : tipo === "operador" ? k.operador : tipo === "igual" ? k.igual : k.acao;
  return (
    <Pressable
      onPress={onPress}
      disabled={desativada || usada}
      accessibilityRole="button"
      accessibilityLabel={rotulo === "⌫" ? "Apagar" : rotulo}
      style={({ pressed }) => [
        k.tecla,
        estilo,
        { flex: largura },
        (desativada || usada) && { opacity: usada ? 0.2 : 0.4 },
        pressed && { transform: [{ translateY: 3 }], borderBottomWidth: 2 },
      ]}
    >
      <Texto
        style={{
          fontFamily: fonte.tituloForte,
          fontSize: 26,
          lineHeight: 38,
          color: tipo === "numero" || tipo === "acao" ? cor.tinta : "#FFFFFF",
        }}
      >
        {rotulo}
      </Texto>
    </Pressable>
  );
}

export function JogoExpressao({ rodada, onErro, onAcerto, bloqueado, dica = false }: PropsJogo<RodadaExpressao>) {
  const cartas = useMemo(() => embaralharCartas(rodada), [rodada]);
  const [usadas, setUsadas] = useState<number[]>([]); // índices das teclas, na ordem em que foram tocadas
  const tokens = usadas.map((i) => cartas[i]!);
  const esperaNumero = tokens.length % 2 === 0;
  const completa = tokens.length === cartas.length;
  const conta = resolver(tokens);

  function tocar(i: number) {
    if (bloqueado || usadas.includes(i)) return;
    setUsadas((u) => [...u, i]);
  }

  function conferir() {
    if (!completa) return onErro("Use todas as teclas para montar a conta.");
    if (!conta) return onErro("A conta precisa alternar número e sinal.");
    if (conta.valor === rodada.alvo)
      return onAcerto(`Isso! ${tokens.join(" ")} = ${rodada.alvo}. Primeiro ${conta.passos.join(", depois ")}.`);
    onErro(`Essa conta dá ${conta.valor}: ${conta.passos.join(", depois ")}. Precisa dar ${rodada.alvo}.`);
  }

  const numeros = cartas.map((c, i) => ({ c, i })).filter((x) => !ehOperador(x.c));
  const operadores = cartas.map((c, i) => ({ c, i })).filter((x) => ehOperador(x.c));

  return (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View style={k.corpo}>
          {/* visor */}
          <View style={k.visor}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Texto style={k.visorRotulo}>Meta</Texto>
              <Texto style={k.visorRotulo}>{conta && completa ? "Resultado" : " "}</Texto>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
              <Texto style={[k.visorTexto, { fontSize: 22, lineHeight: 32, color: "#7FD79A" }]}>{rodada.alvo}</Texto>
              {conta && completa ? (
                <Texto
                  style={[
                    k.visorTexto,
                    { fontSize: 22, lineHeight: 32, color: conta.valor === rodada.alvo ? "#C8F7D2" : "#FFB59A" },
                  ]}
                >
                  = {conta.valor}
                </Texto>
              ) : null}
            </View>
            {/* a conta encolhe para caber numa linha, em vez de ser cortada */}
            <Texto
              style={[k.visorTexto, { fontSize: 34, lineHeight: 48, textAlign: "right", marginTop: 4 }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {tokens.length ? tokens.join(" ") : "0"}
              {!completa ? " _" : ""}
            </Texto>
          </View>

          {dica && conta ? (
            <View style={k.passos}>
              {conta.passos.map((p, i) => (
                <Texto key={i} style={{ fontSize: 14, color: cor.pessegoEscuro, fontFamily: fonte.textoForte }}>
                  {i + 1}º {p}
                </Texto>
              ))}
            </View>
          ) : null}

          {/* teclado */}
          <View style={{ gap: 10, marginTop: 14 }}>
            <View style={k.fileira}>
              {numeros.map(({ c, i }) => (
                <Tecla
                  key={i}
                  rotulo={c}
                  tipo="numero"
                  onPress={() => tocar(i)}
                  usada={usadas.includes(i)}
                  desativada={bloqueado || !esperaNumero}
                />
              ))}
            </View>
            <View style={k.fileira}>
              {operadores.map(({ c, i }) => (
                <Tecla
                  key={i}
                  rotulo={c}
                  tipo="operador"
                  onPress={() => tocar(i)}
                  usada={usadas.includes(i)}
                  desativada={bloqueado || esperaNumero || completa}
                />
              ))}
              <Tecla
                rotulo="⌫"
                tipo="acao"
                onPress={() => setUsadas((u) => u.slice(0, -1))}
                desativada={bloqueado || usadas.length === 0}
              />
              <Tecla rotulo="=" tipo="igual" onPress={conferir} desativada={bloqueado || !completa} />
            </View>
          </View>
        </View>
        <Texto style={{ fontSize: 13, color: cor.textoSuave, textAlign: "center", marginTop: 10 }}>
          Cada tecla só pode ser usada uma vez. A calculadora faz × e ÷ antes de + e −.
        </Texto>
      </View>

      <Acoes>
        <Botao
          titulo="Limpar"
          variante="secundario"
          onPress={() => setUsadas([])}
          disabled={bloqueado || usadas.length === 0}
        />
        <Botao titulo="Calcular" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const k = criarEstilos(() => ({
  corpo: {
    padding: 16,
    borderRadius: 28,
    backgroundColor: "#2A3488",
    borderBottomWidth: 8,
    borderBottomColor: "#1A2160",
  },
  visor: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#1F3B2C",
    borderWidth: 3,
    borderColor: "#0F2419",
  },
  visorRotulo: { fontSize: 13, color: "#7FB894", fontFamily: fonte.textoForte },
  visorTexto: { fontFamily: fonte.tituloForte, color: "#C8F7D2" },
  passos: { marginTop: 10, padding: 10, borderRadius: raio.m, backgroundColor: cor.pessegoClaro, gap: 2 },
  fileira: { flexDirection: "row", gap: 10 },
  tecla: {
    height: 62,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 5,
  },
  numero: { backgroundColor: "#FFFFFF", borderBottomColor: "#C9C3E6" },
  operador: { backgroundColor: cor.pessego, borderBottomColor: "#D9784A" },
  acao: { backgroundColor: cor.lilas, borderBottomColor: "#9A84E6" },
  igual: { backgroundColor: cor.roxo, borderBottomColor: "#4A31C9" },
}));
