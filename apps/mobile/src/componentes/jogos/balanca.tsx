import { useEffect, useState } from "react";
import { Animated, View } from "react-native";
import type { RodadaBalanca } from "@modolume/core";
import { Arrastavel, ZonaSoltura, useSobre } from "@/lib/arraste";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { ProdutoPesado, Toldo } from "../cenas/Quitanda";
import { Acoes } from "./Acoes";

/**
 * Balança equilibrada (manipulação): arrasta pesos para o prato da direita; a
 * balança inclina com mola conforme a diferença. Reta = igualdade.
 */

interface Peso {
  id: number;
  valor: number;
}

const COR: Record<number, string> = {
  1: "#C9B4FF",
  2: "#8FD3FF",
  3: "#FFAC7A",
  4: "#7B61FF",
  5: "#1E2A78",
  6: "#9B7DFF",
  7: "#2F8FCF",
  8: "#E98A52",
};
const ESCURO = new Set([4, 5, 6, 7, 8]);

function BlocoPeso({ valor, escala = 1 }: { valor: number; escala?: number }) {
  const w = (26 + valor * 3.5) * escala;
  const h = (24 + valor * 2) * escala;
  return (
    <View style={{ alignItems: "center", width: w }}>
      <View
        style={{
          width: w / 2,
          height: 8 * escala,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          borderWidth: 3 * escala,
          borderBottomWidth: 0,
          borderColor: COR[valor],
        }}
      />
      <View
        style={{
          width: w,
          height: h,
          borderRadius: 8,
          backgroundColor: COR[valor],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Texto
          style={{
            fontFamily: fonte.titulo,
            fontSize: 13 * escala,
            lineHeight: 15 * escala,
            color: ESCURO.has(valor) ? "#fff" : cor.tinta,
          }}
        >
          {valor}
        </Texto>
        <Texto
          style={{
            fontSize: 8 * escala,
            lineHeight: 9 * escala,
            color: ESCURO.has(valor) ? "#fff" : cor.tinta,
            opacity: 0.8,
          }}
        >
          kg
        </Texto>
      </View>
    </View>
  );
}

export function JogoBalanca({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaBalanca>) {
  const [noPrato, setNoPrato] = useState<Peso[]>([]);
  const [largura, setLargura] = useState(320);
  const sobre = useSobre();
  const bandeja = rodada.bandeja.map((valor, id) => ({ id, valor }));
  const naBandeja = bandeja.filter((p) => !noPrato.some((n) => n.id === p.id));

  const esquerda = rodada.esquerda.reduce((s, v) => s + v, 0) + (rodada.misterio ?? 0);
  const direita = noPrato.reduce((s, p) => s + p.valor, 0);
  const diferenca = direita - esquerda;
  const angulo = Math.max(-14, Math.min(14, diferenca * 2.2));

  const [giro] = useState(() => new Animated.Value(angulo));
  useEffect(() => {
    Animated.spring(giro, { toValue: angulo, useNativeDriver: true, friction: 5, tension: 60 }).start();
  }, [angulo, giro]);

  const rot = giro.interpolate({ inputRange: [-90, 90], outputRange: ["-90deg", "90deg"] });
  const contra = giro.interpolate({ inputRange: [-90, 90], outputRange: ["90deg", "-90deg"] });

  const viga = largura * 0.62;
  const prato = Math.min(140, largura * 0.36);
  const escala = Math.min(1, largura / 360);
  const alturaPalco = Math.min(260, largura * 0.68);

  const por = (p: Peso) => setNoPrato((x) => [...x, p]);
  const tirar = (p: Peso) => setNoPrato((x) => x.filter((y) => y.id !== p.id));

  function conferir() {
    if (diferenca === 0) {
      onAcerto(
        rodada.misterio !== undefined
          ? `Equilibrou! ${rodada.nomeMisterio ? `A ${rodada.nomeMisterio.toLowerCase()}` : "A caixa misteriosa"} pesa ${rodada.misterio} kg.`
          : `Equilibrou! ${rodada.esquerda.join(" + ")} = ${noPrato.map((p) => p.valor).join(" + ")}`,
      );
      return;
    }
    onErro(
      diferenca > 0
        ? "O prato da direita ficou mais pesado. Tire um peso ou troque por um menor."
        : "O prato da esquerda ainda está mais pesado. Coloque mais peso na direita.",
    );
  }

  function prato_(lado: "esquerda" | "direita") {
    return (
      <Animated.View
        style={{
          position: "absolute",
          top: 4,
          [lado === "esquerda" ? "left" : "right"]: -prato / 2 + 8,
          width: prato,
          alignItems: "center",
          transformOrigin: "top",
          transform: [{ rotate: contra }],
        }}
      >
        <View style={{ width: 2, height: 22, backgroundColor: cor.textoFraco }} />
        <View
          style={{
            minHeight: 44,
            width: prato,
            flexDirection: "row",
            flexWrap: "wrap-reverse",
            justifyContent: "center",
            alignItems: "flex-end",
            gap: 3,
          }}
        >
          {lado === "esquerda" ? (
            <>
              {rodada.esquerda.map((v, i) =>
                rodada.itens?.[i] ? (
                  <ProdutoPesado key={i} nome={rodada.itens[i]!} kg={v} escala={escala} />
                ) : (
                  <BlocoPeso key={i} valor={v} escala={escala} />
                ),
              )}
              {rodada.misterio !== undefined ? (
                rodada.nomeMisterio ? (
                  <ProdutoPesado
                    nome={rodada.nomeMisterio}
                    kg={bloqueado ? rodada.misterio : "?"}
                    escala={escala * 1.1}
                  />
                ) : (
                  <View style={[b.misterio, bloqueado && { backgroundColor: cor.roxo, borderStyle: "solid" }]}>
                    <Texto style={{ fontFamily: fonte.titulo, fontSize: 18, color: bloqueado ? "#fff" : cor.roxo }}>
                      {bloqueado ? rodada.misterio : "?"}
                    </Texto>
                  </View>
                )
              ) : null}
            </>
          ) : (
            noPrato.map((p) => (
              <Arrastavel
                key={p.id}
                desabilitado={bloqueado}
                onSoltar={(alvo) => alvo !== "direita" && tirar(p)}
                onToque={() => tirar(p)}
              >
                <BlocoPeso valor={p.valor} escala={escala} />
              </Arrastavel>
            ))
          )}
        </View>
        <View
          style={{
            width: prato,
            height: 8,
            borderBottomLeftRadius: 999,
            borderBottomRightRadius: 999,
            backgroundColor: cor.textoSuave,
          }}
        />
      </Animated.View>
    );
  }

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <View style={b.palco} onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
        <View style={{ height: alturaPalco }}>
          {/* zona de soltura: metade direita inteira (alvo grande para o dedo) */}
          <ZonaSoltura
            id="direita"
            style={[b.zona, { width: largura / 2 }]}
            estiloAtivo={{ backgroundColor: cor.roxoClaro }}
          />
          <Toldo largura={largura} />
          <Texto
            style={[b.selo, diferenca === 0 && noPrato.length > 0 && { backgroundColor: cor.roxo, color: "#fff" }]}
          >
            {diferenca === 0 && noPrato.length > 0
              ? "Reta!"
              : diferenca > 0
                ? "Direita mais pesada"
                : "Esquerda mais pesada"}
          </Texto>
          {noPrato.length === 0 ? (
            <Texto style={[b.solte, sobre === "direita" && { color: cor.roxo }]}>solte aqui</Texto>
          ) : null}

          {/* base */}
          <View style={[b.coluna, { left: largura / 2 - 5, top: alturaPalco * 0.42, height: alturaPalco * 0.58 }]} />
          <View style={[b.pe, { left: largura / 2 - 60 }]} />
          {/* travessão */}
          <Animated.View
            style={[
              b.viga,
              { width: viga, left: (largura - viga) / 2, top: alturaPalco * 0.42 - 5, transform: [{ rotate: rot }] },
            ]}
          >
            {prato_("esquerda")}
            {prato_("direita")}
          </Animated.View>
          <View style={[b.pivo, { left: largura / 2 - 9, top: alturaPalco * 0.42 - 9 }]} />
        </View>
      </View>

      <View style={b.bandeja}>
        <Texto style={{ fontFamily: fonte.textoForte, color: cor.tinta }}>Pesos da quitanda</Texto>
        <Texto style={{ fontSize: 12, color: cor.textoSuave }}>Arraste até o prato da direita (ou toque).</Texto>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "flex-end",
            gap: 12,
            marginTop: 10,
            minHeight: 56,
          }}
        >
          {naBandeja.map((p) => (
            <Arrastavel
              key={p.id}
              desabilitado={bloqueado}
              onSoltar={(alvo) => alvo === "direita" && por(p)}
              onToque={() => por(p)}
            >
              <BlocoPeso valor={p.valor} />
            </Arrastavel>
          ))}
          {naBandeja.length === 0 ? <Texto style={{ color: cor.textoFraco }}>Bandeja vazia</Texto> : null}
        </View>
      </View>

      <Acoes>
        <Botao
          titulo="Esvaziar"
          variante="secundario"
          onPress={() => setNoPrato([])}
          disabled={bloqueado || noPrato.length === 0}
        />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado || noPrato.length === 0} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

const b = criarEstilos(() => ({
  palco: {
    borderRadius: raio.g,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.fundo,
    overflow: "hidden",
  },
  zona: { position: "absolute", right: 0, top: 0, bottom: 0 },
  selo: {
    position: "absolute",
    top: 26,
    right: 10,
    fontSize: 11,
    fontFamily: fonte.textoForte,
    color: cor.textoSuave,
    backgroundColor: cor.superficie,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  solte: { position: "absolute", right: 24, bottom: 12, fontSize: 12, color: cor.textoFraco },
  coluna: {
    position: "absolute",
    width: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: cor.tinta,
  },
  pe: {
    position: "absolute",
    bottom: 0,
    width: 120,
    height: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: cor.tinta,
  },
  viga: { position: "absolute", height: 10, borderRadius: 5, backgroundColor: cor.tinta },
  pivo: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 4,
    borderColor: cor.tinta,
    backgroundColor: cor.pessego,
  },
  misterio: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: cor.roxo,
    backgroundColor: cor.lilasClaro,
    alignItems: "center",
    justifyContent: "center",
  },
  bandeja: {
    padding: 14,
    borderRadius: raio.g,
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
}));
