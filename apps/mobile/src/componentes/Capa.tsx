import { PRECOS_LOJA } from "@modolume/core";
import { memo, useEffect, useState, type ReactNode } from "react";
import { Animated, Easing, Platform, StyleSheet, View, type DimensionValue, type ViewStyle } from "react-native";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { cor, porTema } from "@/tema";

/**
 * Capa do perfil (a faixa atrás do avatar). Cada capa tem um movimento bem
 * lento e discreto: bolhas subindo, estrelas piscando, ondas indo e vindo…
 * Tudo em cores chapadas e animado no nativo (opacidade e posição).
 * Algumas capas são grátis; as que têm `preco` são compradas com luzes.
 */

/** Identificador da compra de uma capa (fica na lista de compras do jogador). */
export const compraDaCapa = (id: string) => `capa-${id}`;

export const CAPAS = porTema(
  () =>
    [
      { id: "bolhas", nome: "Bolhas", fundo: cor.roxo, escura: true },
      { id: "ceu", nome: "Céu estrelado", fundo: "#1E2A78", escura: true },
      { id: "ondas", nome: "Mar", fundo: "#8FD3FF", escura: false },
      { id: "entardecer", nome: "Entardecer", fundo: "#FFAC7A", escura: false },
      { id: "aurora", nome: "Aurora", fundo: "#2A3488", escura: true },
      // grátis
      { id: "floresta", nome: "Floresta", fundo: "#7DBE8E", escura: false },
      { id: "confete", nome: "Confete", fundo: "#C9B4FF", escura: false },
      // compradas com luzes
      { id: "doces", nome: "Doces", fundo: "#FFD3E2", escura: false, preco: PRECOS_LOJA["capa-doces"] },
      { id: "neve", nome: "Neve", fundo: "#3D7FC4", escura: true, preco: PRECOS_LOJA["capa-neve"] },
      { id: "galaxia", nome: "Galáxia", fundo: "#14134A", escura: true, preco: PRECOS_LOJA["capa-galaxia"] },
      { id: "mar", nome: "Fundo do mar", fundo: "#1D4E8F", escura: true, preco: PRECOS_LOJA["capa-mar"] },
      { id: "arcoiris", nome: "Arco-íris", fundo: "#BFE6FF", escura: false, preco: PRECOS_LOJA["capa-arcoiris"] },
    ] as { id: string; nome: string; fundo: string; escura: boolean; preco?: number }[],
);

const NATIVO = Platform.OS !== "web";

/** Valor que vai de 0 a 1 e volta, sem parar (o "respirar" da capa). */
function useCiclo(duracao: number, atraso = 0) {
  const [v] = useState(() => new Animated.Value(0));
  const { animacoesReduzidas } = useAcessibilidade();
  useEffect(() => {
    if (animacoesReduzidas) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(atraso),
        Animated.timing(v, {
          toValue: 1,
          duration: duracao / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVO,
        }),
        Animated.timing(v, {
          toValue: 0,
          duration: duracao / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVO,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v, duracao, atraso, animacoesReduzidas]);
  return v;
}

/** Forma que flutua: desliza um pouco em x/y e varia a opacidade. */
function Flutua({
  estilo,
  duracao,
  atraso = 0,
  dx = 0,
  dy = 0,
  opacidade = [1, 1],
  escala = [1, 1],
  children,
}: {
  estilo: ViewStyle;
  duracao: number;
  atraso?: number;
  dx?: number;
  dy?: number;
  opacidade?: [number, number];
  escala?: [number, number];
  children?: ReactNode;
}) {
  const v = useCiclo(duracao, atraso);
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute" },
        estilo,
        {
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: opacidade }),
          transform: [
            { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
            { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, dy] }) },
            { scale: v.interpolate({ inputRange: [0, 1], outputRange: escala }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const bola = (t: number, c: string, left: DimensionValue, top: DimensionValue): ViewStyle => ({
  width: t,
  height: t,
  borderRadius: t / 2,
  backgroundColor: c,
  left,
  top,
});

function Estrela({ left, top, t, atraso }: { left: DimensionValue; top: DimensionValue; t: number; atraso: number }) {
  return (
    <Flutua
      estilo={bola(t, "#FFFFFF", left, top)}
      duracao={3200 + atraso}
      atraso={atraso}
      opacidade={[0.25, 0.95]}
      escala={[0.8, 1.15]}
    />
  );
}

/** Pedaço de confete, folha ou confeito: retângulo arredondado inclinado. */
const pedaco = (
  w: number,
  h: number,
  c: string,
  left: DimensionValue,
  top: DimensionValue,
  giro: number,
): ViewStyle => ({
  width: w,
  height: h,
  borderRadius: Math.min(w, h) / 2,
  backgroundColor: c,
  left,
  top,
  transform: [{ rotate: `${giro}deg` }],
});

type Item = [DimensionValue, DimensionValue, number, number];

function Conteudo({ id }: { id: string }) {
  if (id === "floresta")
    return (
      <>
        <Flutua estilo={bola(160, "rgba(46,120,80,0.28)", "-12%", "40%")} duracao={11000} dx={8} />
        <Flutua estilo={bola(130, "rgba(46,120,80,0.22)", "70%", "48%")} duracao={12000} atraso={600} dx={-8} />
        {(
          [
            ["14%", "12%", 0, 30],
            ["38%", "4%", 900, -20],
            ["62%", "16%", 400, 45],
            ["84%", "6%", 1400, -35],
            ["26%", "40%", 700, 15],
          ] as Item[]
        ).map(([l, t, a, g], i) => (
          <Flutua
            key={i}
            estilo={pedaco(16, 9, i % 2 ? "#F6C344" : "#FFAC7A", l, t, g)}
            duracao={7000 + i * 500}
            atraso={a}
            dx={i % 2 ? 10 : -10}
            dy={34}
            opacidade={[1, 0.3]}
          />
        ))}
      </>
    );
  if (id === "confete") {
    const cores = ["#FFAC7A", "#7B61FF", "#FF7CA7", "#8FD3FF", "#F6C344", "#FFFFFF", "#7B61FF"];
    return (
      <>
        {(
          [
            ["10%", "18%", 0, 20],
            ["24%", "58%", 500, -30],
            ["40%", "26%", 900, 45],
            ["56%", "62%", 300, -15],
            ["70%", "20%", 1200, 30],
            ["86%", "50%", 700, -40],
            ["48%", "80%", 1500, 10],
          ] as Item[]
        ).map(([l, t, a, g], i) => (
          <Flutua
            key={i}
            estilo={pedaco(12, 7, cores[i]!, l, t, g)}
            duracao={5000 + i * 400}
            atraso={a}
            dy={-12}
            dx={i % 2 ? 6 : -6}
            opacidade={[0.5, 1]}
          />
        ))}
      </>
    );
  }
  if (id === "galaxia")
    return (
      <>
        {(
          [
            ["8%", "24%", 2, 0],
            ["22%", "70%", 3, 800],
            ["36%", "18%", 2, 1300],
            ["52%", "56%", 2, 400],
            ["90%", "30%", 3, 1000],
            ["12%", "86%", 2, 1600],
          ] as Item[]
        ).map(([l, t, s, a], i) => (
          <Estrela key={i} left={l} top={t} t={s} atraso={a} />
        ))}
        <Flutua estilo={bola(70, "#FFAC7A", "66%", "22%")} duracao={10000} dy={6}>
          <View
            style={{
              position: "absolute",
              left: -24,
              top: 26,
              width: 118,
              height: 18,
              borderRadius: 60,
              borderWidth: 3,
              borderColor: "rgba(201,180,255,0.85)",
              transform: [{ rotate: "-14deg" }],
            }}
          />
        </Flutua>
        <Flutua estilo={bola(18, "#8FD3FF", "30%", "40%")} duracao={8000} atraso={500} dx={8} dy={-4} />
      </>
    );
  if (id === "neve")
    return (
      <>
        {(
          [
            ["8%", "6%", 6, 0],
            ["22%", "30%", 4, 700],
            ["36%", "2%", 5, 1200],
            ["50%", "36%", 4, 300],
            ["64%", "10%", 6, 900],
            ["78%", "34%", 4, 1500],
            ["90%", "4%", 5, 500],
          ] as Item[]
        ).map(([l, t, s, a], i) => (
          <Flutua
            key={i}
            estilo={bola(s, "#FFFFFF", l, t)}
            duracao={6000 + i * 400}
            atraso={a}
            dy={40}
            dx={i % 2 ? 8 : -8}
            opacidade={[1, 0.4]}
          />
        ))}
        <View
          style={{
            position: "absolute",
            left: "-20%",
            width: "140%",
            height: 90,
            bottom: -66,
            borderRadius: 300,
            backgroundColor: "#EAF7FF",
          }}
        />
      </>
    );
  if (id === "mar")
    return (
      <>
        {[0, 1, 2, 3].map((i) => (
          <Flutua
            key={`a${i}`}
            estilo={{
              left: `${10 + i * 24}%`,
              bottom: -10,
              width: 12,
              height: 60 + (i % 2) * 24,
              borderRadius: 8,
              backgroundColor: i % 2 ? "#3FAE8A" : "#2E8C72",
            }}
            duracao={5000 + i * 700}
            atraso={i * 300}
            dx={i % 2 ? 6 : -6}
          />
        ))}
        {(
          [
            ["20%", "50%", 10, 0],
            ["46%", "62%", 7, 900],
            ["72%", "40%", 12, 400],
            ["86%", "66%", 6, 1300],
          ] as Item[]
        ).map(([l, t, s, a], i) => (
          <Flutua
            key={`b${i}`}
            estilo={{ ...bola(s, "transparent", l, t), borderWidth: 2, borderColor: "rgba(255,255,255,0.7)" }}
            duracao={6000 + i * 500}
            atraso={a}
            dy={-40}
            opacidade={[0.9, 0.2]}
          />
        ))}
      </>
    );
  if (id === "arcoiris")
    return (
      <>
        {["#FF7CA7", "#FFAC7A", "#F6C344", "#7DBE8E", "#7B61FF"].map((c, i) => (
          <View
            key={c}
            style={{
              position: "absolute",
              left: "50%",
              bottom: -150 + i * 12,
              width: 300 - i * 24,
              height: 300 - i * 24,
              marginLeft: -(150 - i * 12),
              borderRadius: 200,
              borderWidth: 12,
              borderColor: c,
            }}
          />
        ))}
        <Flutua
          estilo={{ left: "8%", top: "22%", width: 80, height: 26, borderRadius: 13, backgroundColor: "#FFFFFF" }}
          duracao={12000}
          dx={24}
        />
        <Flutua
          estilo={{ left: "70%", top: "60%", width: 70, height: 22, borderRadius: 11, backgroundColor: "#FFFFFF" }}
          duracao={13000}
          atraso={1000}
          dx={-20}
        />
      </>
    );
  if (id === "doces") {
    const cores = ["#7B61FF", "#FFAC7A", "#8FD3FF", "#FF7CA7", "#F6C344", "#7B61FF", "#7DBE8E"];
    return (
      <>
        <Flutua estilo={bola(120, "rgba(255,255,255,0.35)", "62%", "-30%")} duracao={10000} dx={-8} dy={8} />
        {(
          [
            ["8%", "24%", 0, 30],
            ["20%", "64%", 600, -20],
            ["34%", "30%", 1100, 60],
            ["48%", "70%", 300, -45],
            ["60%", "42%", 900, 15],
            ["76%", "72%", 1400, -30],
            ["88%", "34%", 500, 40],
          ] as Item[]
        ).map(([l, t, a, g], i) => (
          <Flutua
            key={i}
            estilo={pedaco(14, 6, cores[i]!, l, t, g)}
            duracao={6000 + i * 300}
            atraso={a}
            dy={-6}
            escala={[1, 1.15]}
          />
        ))}
      </>
    );
  }
  if (id === "ceu")
    return (
      <>
        {[
          ["8%", "30%", 3, 0],
          ["20%", "62%", 2, 900],
          ["31%", "22%", 4, 400],
          ["44%", "48%", 2, 1500],
          ["58%", "18%", 3, 700],
          ["66%", "66%", 2, 1200],
          ["78%", "34%", 4, 200],
          ["90%", "58%", 3, 1700],
          ["14%", "84%", 2, 600],
          ["86%", "14%", 2, 1100],
        ].map(([l, t, s, a], i) => (
          <Estrela key={i} left={l as DimensionValue} top={t as DimensionValue} t={s as number} atraso={a as number} />
        ))}
        <Flutua estilo={bola(70, "rgba(201,180,255,0.16)", "64%", "-20%")} duracao={9000} dx={-10} dy={6} />
      </>
    );
  if (id === "ondas")
    return (
      <>
        <Flutua
          estilo={{
            left: "-30%",
            width: "160%",
            height: 140,
            bottom: -96,
            borderRadius: 400,
            backgroundColor: "rgba(255,255,255,0.35)",
          }}
          duracao={7000}
          dx={40}
          dy={-4}
        />
        <Flutua
          estilo={{
            left: "-40%",
            width: "170%",
            height: 140,
            bottom: -112,
            borderRadius: 400,
            backgroundColor: "rgba(30,42,120,0.18)",
          }}
          duracao={8600}
          atraso={600}
          dx={-46}
          dy={4}
        />
        <Flutua
          estilo={bola(14, "rgba(255,255,255,0.6)", "18%", "30%")}
          duracao={6000}
          dy={-8}
          opacidade={[0.4, 0.9]}
        />
        <Flutua
          estilo={bola(9, "rgba(255,255,255,0.6)", "80%", "22%")}
          duracao={7000}
          atraso={900}
          dy={-6}
          opacidade={[0.3, 0.8]}
        />
      </>
    );
  if (id === "entardecer")
    return (
      <>
        <Flutua estilo={bola(96, "#FFD9A0", "58%", "26%")} duracao={8000} escala={[1, 1.06]} />
        <Flutua
          estilo={{
            left: "6%",
            top: "28%",
            width: 90,
            height: 26,
            borderRadius: 13,
            backgroundColor: "rgba(255,255,255,0.55)",
          }}
          duracao={12000}
          dx={30}
        />
        <Flutua
          estilo={{
            left: "30%",
            top: "58%",
            width: 64,
            height: 20,
            borderRadius: 10,
            backgroundColor: "rgba(255,255,255,0.4)",
          }}
          duracao={14000}
          atraso={1500}
          dx={-24}
        />
        <Flutua
          estilo={{
            left: "-10%",
            width: "120%",
            height: 60,
            bottom: -40,
            borderRadius: 300,
            backgroundColor: "rgba(123,97,255,0.22)",
          }}
          duracao={10000}
          dx={14}
        />
      </>
    );
  if (id === "aurora")
    return (
      <>
        <Flutua
          estilo={{
            left: "-20%",
            top: "10%",
            width: "80%",
            height: 60,
            borderRadius: 60,
            backgroundColor: "rgba(143,211,255,0.28)",
          }}
          duracao={9000}
          dx={40}
          dy={6}
          opacidade={[0.6, 1]}
        />
        <Flutua
          estilo={{
            left: "35%",
            top: "38%",
            width: "80%",
            height: 54,
            borderRadius: 54,
            backgroundColor: "rgba(201,180,255,0.3)",
          }}
          duracao={11000}
          atraso={800}
          dx={-36}
          dy={-6}
          opacidade={[0.5, 1]}
        />
        <Flutua
          estilo={{
            left: "5%",
            top: "60%",
            width: "60%",
            height: 40,
            borderRadius: 40,
            backgroundColor: "rgba(255,124,167,0.18)",
          }}
          duracao={10000}
          atraso={1600}
          dx={30}
          opacidade={[0.4, 0.9]}
        />
        <Estrela left="82%" top="18%" t={3} atraso={300} />
        <Estrela left="12%" top="20%" t={2} atraso={1200} />
      </>
    );
  // bolhas subindo devagar
  return (
    <>
      <Flutua estilo={bola(180, "rgba(255,255,255,0.08)", "-10%", "-45%")} duracao={10000} dx={12} dy={10} />
      <Flutua
        estilo={bola(120, "rgba(255,172,122,0.25)", "72%", "50%")}
        duracao={9000}
        atraso={500}
        dx={-10}
        dy={-14}
      />
      <Flutua estilo={bola(22, "rgba(255,255,255,0.22)", "30%", "64%")} duracao={7000} dy={-22} opacidade={[0.3, 1]} />
      <Flutua
        estilo={bola(14, "rgba(255,255,255,0.25)", "62%", "30%")}
        duracao={6000}
        atraso={1200}
        dy={-16}
        opacidade={[0.3, 1]}
      />
      <Flutua
        estilo={bola(10, "rgba(201,180,255,0.6)", "84%", "18%")}
        duracao={8000}
        atraso={400}
        dy={-10}
        opacidade={[0.4, 1]}
      />
    </>
  );
}

/** Desenha a capa escolhida ocupando todo o espaço do pai. */
export const Capa = memo(function Capa({ indice = 0, style }: { indice?: number; style?: ViewStyle }) {
  const capa = (CAPAS[indice] ?? CAPAS[0])!;
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: capa.fundo, overflow: "hidden" }, style]}
      pointerEvents="none"
    >
      <Conteudo id={capa.id} />
    </View>
  );
});
