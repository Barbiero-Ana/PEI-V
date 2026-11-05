import { useState, type ReactNode } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { RodadaDinheiro } from "@modolume/core";
import { Arrastavel, ZonaSoltura, useSobre } from "@/lib/arraste";
import { Botao, Texto } from "../ui";
import { CenaCaixa, type Humor } from "../cenas/Mercado";
import { Dinheiro } from "../cenas/Dinheiro";
import { cor, criarEstilos, fonte } from "@/tema";
import type { PropsJogo } from "./tipos";
import { Acoes } from "./Acoes";

/**
 * Mercadinho (manipulação): no caixa do mercado, o aluno tira notas e moedas
 * da carteira e coloca na bandeja até pagar o valor exato. A atendente reage
 * e o visor do caixa mostra TOTAL e PAGO. Tocar no dinheiro da bandeja o
 * devolve para a carteira.
 *
 * Fase de troco (`pagoCom`): o aluno ajuda no caixa. A cliente pagou a mais e
 * ele separa o troco com o dinheiro da gaveta, vendo a conta (pagou − preço)
 * e a contagem a partir do preço, do jeito que os caixas conferem.
 */

export const reais = (v: number) => (Number.isInteger(v) ? `R$ ${v}` : `R$ ${v.toFixed(2).replace(".", ",")}`);

export function JogoDinheiro({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaDinheiro>) {
  const [pago, setPago] = useState<{ id: number; valor: number }[]>([]);
  const [contador, setContador] = useState(0);
  const [largura, setLargura] = useState(0);
  const [humor, setHumor] = useState<Humor>("esperando");
  const pagoCom = rodada.pagoCom;
  const troco = pagoCom !== undefined ? Math.round((pagoCom - rodada.preco) * 100) / 100 : null;
  const [fala, setFala] = useState(
    pagoCom !== undefined
      ? `Ela me deu ${reais(pagoCom)}, mas custa ${reais(rodada.preco)}. Me ajuda com o troco?`
      : `Oi! Deu ${reais(rodada.preco)}. Como vai pagar?`,
  );
  const total = Math.round(pago.reduce((s, p) => s + p.valor, 0) * 100) / 100;
  const alvo = troco ?? rodada.preco;

  const mudou = () => {
    if (humor === "pensando") {
      setHumor("esperando");
      setFala("Tudo bem, confira o valor de novo.");
    }
  };
  const pagar = (valor: number) => {
    if (bloqueado || pago.length >= 14) return;
    setPago((p) => [...p, { id: contador, valor }]);
    setContador((c) => c + 1);
    mudou();
  };
  const devolver = (id: number) => {
    if (bloqueado) return;
    setPago((p) => p.filter((x) => x.id !== id));
    mudou();
  };

  function conferir() {
    const dif = Math.round((total - alvo) * 100) / 100;
    if (pagoCom !== undefined && troco !== null) {
      const conta = `${reais(rodada.preco)} + ${reais(total)} = ${reais(rodada.preco + total)}`;
      if (dif === 0) {
        setHumor("feliz");
        setFala(`Isso! ${conta}. Troco certinho!`);
        return onAcerto(
          `Troco certo: ${reais(pagoCom)} − ${reais(rodada.preco)} = ${reais(troco)}. Troco é o que sobra quando se paga a mais.`,
        );
      }
      setHumor("pensando");
      setFala(
        dif < 0
          ? `${conta}. Ainda não chegou em ${reais(pagoCom)}.`
          : `${conta}. Passou dos ${reais(pagoCom)} que ela deu.`,
      );
      return onErro(
        dif < 0
          ? `Ainda falta troco. Conte a partir de ${reais(rodada.preco)} até chegar em ${reais(pagoCom)}.`
          : `Troco demais: a loja ficaria no prejuízo. Tire ${reais(dif)} da bandeja.`,
      );
    }
    if (dif === 0) {
      setHumor("feliz");
      setFala("Valor certinho, sem troco! Volte sempre.");
      return onAcerto(`Valor exato! ${reais(rodada.preco)} pagos sem precisar de troco.`);
    }
    setHumor("pensando");
    if (dif < 0) {
      setFala(`Hmm, aqui tem ${reais(total)}. Ainda falta um pouco.`);
      onErro(`Ainda faltam ${reais(-dif)} para pagar.`);
    } else {
      setFala(`Opa, aqui tem ${reais(total)}. Passou do preço.`);
      onErro(`Passou ${reais(dif)} do preço. Pegue alguma nota ou moeda de volta.`);
    }
  }

  const gaveta = troco !== null;
  const notas = rodada.valores.filter((v) => v > 1);
  const moedas = rodada.valores.filter((v) => v <= 1);

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <View onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
        {largura > 0 ? (
          <CenaCaixa
            largura={largura}
            item={rodada.item}
            preco={rodada.preco}
            visor={
              pagoCom !== undefined
                ? [
                    { rotulo: "PAGOU", valor: pagoCom },
                    { rotulo: "TROCO", valor: total },
                  ]
                : [
                    { rotulo: "TOTAL", valor: rodada.preco },
                    { rotulo: "PAGO", valor: total },
                  ]
            }
            certo={total === alvo}
            humor={humor}
            fala={fala}
          />
        ) : null}
      </View>

      {pagoCom !== undefined ? (
        <ExplicaTroco preco={rodada.preco} pagoCom={pagoCom} dado={total} revelar={bloqueado} />
      ) : null}

      {/* bandeja do balcão: o dinheiro fica empilhado por valor */}
      <ZonaSoltura id="balcao">
        <Bandeja
          vazia={pago.length === 0}
          texto={troco !== null ? "Arraste o troco da cliente para cá" : "Arraste o dinheiro para cá"}
          total={total}
          alvo={alvo}
          rotulo={troco !== null ? "Troco separado" : "Na bandeja"}
        >
          {[...pago]
            .sort((x, y) => y.valor - x.valor)
            .map((p) => (
              <Arrastavel
                key={p.id}
                desabilitado={bloqueado}
                onSoltar={(destino) => destino !== "balcao" && devolver(p.id)}
                onToque={() => devolver(p.id)}
              >
                <Dinheiro valor={p.valor} tamanho="pequeno" />
              </Arrastavel>
            ))}
        </Bandeja>
      </ZonaSoltura>

      {/* carteira (ou gaveta do caixa, na fase de troco) */}
      <View style={gaveta ? d$.gaveta : d$.carteira}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
          <Texto style={{ fontFamily: fonte.titulo, color: gaveta ? cor.tinta : "#FFFFFF", fontSize: 15 }}>
            {gaveta ? "Gaveta do caixa" : "Sua carteira"}
          </Texto>
          <Texto style={{ fontSize: 13, color: gaveta ? cor.texto : "#C9B4FF" }}>toque ou arraste</Texto>
        </View>
        <View style={d$.dinheiros}>
          {[...notas, ...moedas].map((v) => {
            const usados = pago.filter((x) => x.valor === v).length;
            return (
              <View key={v}>
                <Arrastavel
                  desabilitado={bloqueado}
                  onSoltar={(destino) => destino === "balcao" && pagar(v)}
                  onToque={() => pagar(v)}
                >
                  <Dinheiro valor={v} />
                </Arrastavel>
                {usados > 0 ? (
                  <View style={d$.usados} pointerEvents="none">
                    <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 12, color: "#FFFFFF", lineHeight: 15 }}>
                      {usados}
                    </Texto>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>

      <Acoes>
        <Botao
          titulo="Pegar de volta"
          variante="secundario"
          onPress={() => {
            setPago([]);
            mudou();
          }}
          disabled={bloqueado || pago.length === 0}
        />
        <Botao
          titulo={gaveta ? "Entregar troco" : "Pagar"}
          onPress={conferir}
          disabled={bloqueado || pago.length === 0}
          style={{ flex: 1 }}
        />
      </Acoes>
    </View>
  );
}

/**
 * Bandeja do balcão: mostra quanto já foi colocado em relação ao valor pedido
 * (barra que enche) e acende quando o dinheiro passa por cima.
 */
function Bandeja({
  vazia,
  texto,
  total,
  alvo,
  rotulo,
  children,
}: {
  vazia: boolean;
  texto: string;
  total: number;
  alvo: number;
  rotulo: string;
  children: ReactNode;
}) {
  const ativa = useSobre() === "balcao";
  const passou = total > alvo;
  const certo = total === alvo;
  const tinta = passou ? cor.pessegoEscuro : certo ? cor.roxo : cor.tinta;
  return (
    <View style={[d$.bandeja, ativa && { borderColor: cor.roxo, backgroundColor: cor.roxoClaro }]}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <Texto style={{ fontFamily: fonte.titulo, fontSize: 15, color: cor.tinta }}>{rotulo}</Texto>
        <Texto style={{ fontSize: 15, color: cor.textoSuave }}>
          <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 17, color: tinta }}>{reais(total)}</Texto> de{" "}
          {reais(alvo)}
        </Texto>
      </View>
      <View style={d$.trilho}>
        <View
          style={[
            d$.cheio,
            {
              width: `${Math.min(100, (total / alvo) * 100)}%`,
              backgroundColor: passou ? cor.pessego : cor.roxo,
            },
          ]}
        />
      </View>
      <View style={d$.prato}>
        {vazia ? (
          <View style={{ alignItems: "center", gap: 4 }}>
            <Svg width={26} height={26} viewBox="0 0 26 26">
              <Path
                d="M13 4 V20 M6 13 L13 20 L20 13"
                stroke={ativa ? cor.roxo : cor.textoFraco}
                strokeWidth={2.6}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Texto style={{ color: ativa ? cor.roxo : cor.textoSuave, fontSize: 14 }}>{texto}</Texto>
          </View>
        ) : (
          children
        )}
      </View>
      {/* a linha fica sempre reservada, para a carteira não mudar de lugar */}
      <Texto style={{ fontSize: 13, color: cor.textoSuave, textAlign: "center", opacity: vazia ? 0 : 1 }}>
        Toque numa nota ou moeda para devolver
      </Texto>
    </View>
  );
}

/**
 * O que é troco: a conta (pagou − preço) e a contagem a partir do preço até o
 * valor pago. Cada real colocado na bandeja acende um passo.
 */
function ExplicaTroco({
  preco,
  pagoCom,
  dado,
  revelar,
}: {
  preco: number;
  pagoCom: number;
  dado: number;
  revelar: boolean;
}) {
  const passo = Number.isInteger(preco) && Number.isInteger(pagoCom) ? 1 : 0.5;
  const marcos: number[] = [];
  for (let v = preco; v <= pagoCom + 0.001; v += passo) marcos.push(Math.round(v * 100) / 100);
  const chegou = Math.round((preco + dado) * 100) / 100;
  return (
    <View style={d$.explica}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Texto style={d$.explicaTexto}>Troco =</Texto>
        <Ficha texto={reais(pagoCom)} legenda="pagou" fundo={cor.azulClaro} />
        <Texto style={d$.sinal}>−</Texto>
        <Ficha texto={reais(preco)} legenda="preço" fundo={cor.pessegoClaro} />
        <Texto style={d$.sinal}>=</Texto>
        <Ficha
          texto={revelar ? reais(pagoCom - preco) : "?"}
          legenda="troco"
          fundo={revelar ? cor.roxo : cor.roxoClaro}
          claro={revelar}
        />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", rowGap: 4, marginTop: 8 }}>
        <Texto style={{ fontSize: 11, color: cor.textoSuave, marginRight: 6 }}>Conte a partir do preço:</Texto>
        {marcos.map((v, i) => {
          const aceso = i > 0 && v <= chegou + 0.001;
          return (
            <View key={v} style={{ flexDirection: "row", alignItems: "center" }}>
              {i > 0 ? <View style={[d$.elo, aceso && { backgroundColor: cor.roxo }]} /> : null}
              <View style={[d$.marco, i === 0 && d$.marcoPreco, aceso && d$.marcoAceso]}>
                <Texto style={{ fontSize: 11, fontFamily: fonte.titulo, color: aceso ? "#fff" : cor.tinta }}>
                  {Number.isInteger(v) ? v : v.toFixed(1).replace(".", ",")}
                </Texto>
              </View>
            </View>
          );
        })}
        {chegou > pagoCom ? (
          <Texto style={{ fontSize: 11, color: cor.pessegoEscuro, fontFamily: fonte.textoForte, marginLeft: 6 }}>
            passou!
          </Texto>
        ) : null}
      </View>
    </View>
  );
}

function Ficha({
  texto,
  legenda,
  fundo,
  claro = false,
}: {
  texto: string;
  legenda: string;
  fundo: string;
  claro?: boolean;
}) {
  return (
    <View style={[d$.ficha, { backgroundColor: fundo }]}>
      <Texto style={{ fontFamily: fonte.titulo, fontSize: 14, color: claro ? "#fff" : cor.tinta, lineHeight: 18 }}>
        {texto}
      </Texto>
      <Texto style={{ fontSize: 9.5, color: claro ? "#fff" : cor.textoSuave, lineHeight: 11 }}>{legenda}</Texto>
    </View>
  );
}

const d$ = criarEstilos(() => ({
  bandeja: {
    gap: 8,
    padding: 12,
    borderRadius: 18,
    backgroundColor: cor.superficie,
    borderWidth: 2,
    borderColor: cor.borda,
  },
  trilho: { height: 10, borderRadius: 5, backgroundColor: cor.trilho, overflow: "hidden" },
  cheio: { height: "100%", borderRadius: 5 },
  prato: {
    minHeight: 92,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: cor.bordaForte,
    backgroundColor: cor.fundo,
  },
  carteira: {
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#2A3488",
    borderBottomWidth: 5,
    borderBottomColor: "#1A2265",
  },
  gaveta: {
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#DCD6F2",
    borderBottomWidth: 6,
    borderBottomColor: "#B9B1DE",
  },
  dinheiros: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 12 },
  usados: {
    position: "absolute",
    right: -6,
    top: -8,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 5,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: cor.pessegoEscuro,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  explica: { padding: 10, borderRadius: 14, backgroundColor: cor.superficie, borderWidth: 1, borderColor: cor.borda },
  explicaTexto: { fontFamily: fonte.titulo, fontSize: 14, color: cor.tinta },
  sinal: { fontFamily: fonte.titulo, fontSize: 16, color: cor.textoSuave },
  ficha: { borderRadius: 9, paddingHorizontal: 8, paddingVertical: 3, alignItems: "center", minWidth: 46 },
  marco: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: cor.bordaForte,
    alignItems: "center",
    justifyContent: "center",
  },
  marcoPreco: { backgroundColor: cor.pessego, borderColor: cor.pessego },
  marcoAceso: { backgroundColor: cor.roxo, borderColor: cor.roxo },
  elo: { width: 10, height: 2, borderRadius: 1, backgroundColor: cor.inativo },
}));
