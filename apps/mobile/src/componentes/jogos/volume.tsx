import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import * as THREE from "three";
import type { RodadaVolume } from "@modolume/core";
import { Palco3D, type Cena } from "../3d/Palco3D";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, porTema, raio } from "@/tema";
import { j } from "./cubos";
import type { PropsJogo } from "./tipos";
import { useUltimo } from "@/lib/useUltimo";

/**
 * Cubinhos escondidos (exploração 3D): pilhas de cubos com alguns escondidos
 * atrás ou embaixo. O aluno gira, separa as camadas no ar para contar e
 * responde. Nas fases "faltam", o contorno mostra o bloco completo e é
 * preciso calcular quantos cubos ainda cabem (c × l × a − os que já estão).
 */

const CORES_CAMADA = [0x7b61ff, 0xffac7a, 0x8fd3ff, 0xc9b4ff];
const SEPARACAO = 0.9;
const COR_CHIP = porTema(() => [cor.roxo, cor.pessego, cor.azulEscuro, cor.lilas]);

export function JogoVolume({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaVolume>) {
  const [resposta, setResposta] = useState(0);
  const [separado, setSeparado] = useState(false);
  const mundo = useRef<{ cena: Cena; camadas: THREE.Group[]; materiais: THREE.Material[][]; abertura: number } | null>(
    null,
  );
  const [foco, setFoco] = useState<number | null>(null);
  const vivo = useRef(true);
  const estado = useUltimo({ bloqueado });

  const linhas = rodada.alturas.length;
  const colunas = Math.max(...rodada.alturas.map((l) => l.length));
  const presentes = rodada.alturas.flat().reduce((a, b) => a + b, 0);
  const altura = rodada.completo?.a ?? Math.max(...rodada.alturas.flat());
  const certo =
    rodada.pergunta === "total" ? presentes : rodada.completo!.c * rodada.completo!.l * rodada.completo!.a - presentes;

  useEffect(
    () => () => {
      vivo.current = false;
    },
    [],
  );

  function montar(cena: Cena) {
    const ox = (colunas - 1) / 2;
    const oz = (linhas - 1) / 2;
    const geo = new THREE.BoxGeometry(0.94, 0.94, 0.94);
    const bordas = new THREE.EdgesGeometry(geo);
    const camadas: THREE.Group[] = [];
    const materiais: THREE.Material[][] = [];
    for (let y = 0; y < altura; y += 1) {
      const g = new THREE.Group();
      g.position.y = y;
      camadas.push(g);
      materiais.push([]);
      cena.scene.add(g);
    }
    rodada.alturas.forEach((linha, z) =>
      linha.forEach((h, x) => {
        for (let y = 0; y < h; y += 1) {
          const mat = new THREE.MeshStandardMaterial({
            color: CORES_CAMADA[y % CORES_CAMADA.length],
            roughness: 0.55,
            transparent: true,
          });
          const cubo = new THREE.Mesh(geo, mat);
          cubo.position.set(x - ox, 0.5, z - oz);
          const matLinha = new THREE.LineBasicMaterial({ color: 0x1e2a78, transparent: true, opacity: 0.55 });
          const linhasCubo = new THREE.LineSegments(bordas, matLinha);
          materiais[y]!.push(mat, matLinha);
          linhasCubo.position.copy(cubo.position);
          camadas[y]!.add(cubo, linhasCubo);
        }
      }),
    );
    // contorno do bloco completo (fases "faltam")
    if (rodada.completo) {
      const { c, l, a } = rodada.completo;
      const caixa = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(c, a, l)),
        new THREE.LineBasicMaterial({ color: 0xffac7a }),
      );
      caixa.position.set((c - 1) / 2 - ox, a / 2, (l - 1) / 2 - oz);
      cena.scene.add(caixa);
    }
    const chao = new THREE.Mesh(
      new THREE.PlaneGeometry(colunas + 2, linhas + 2),
      new THREE.MeshStandardMaterial({ color: 0xefebff, roughness: 1 }),
    );
    chao.rotation.x = -Math.PI / 2;
    chao.position.y = -0.01;
    cena.scene.add(chao);
    mundo.current = { cena, camadas, materiais, abertura: 0 };
    cena.render();
  }

  /** Destaca só uma camada (as outras ficam quase transparentes). */
  function focar(camada: number | null) {
    const w = mundo.current;
    if (!w) return;
    setFoco(camada);
    w.materiais.forEach((lista, y) =>
      lista.forEach((m) => {
        const base = m instanceof THREE.LineBasicMaterial ? 0.55 : 1;
        m.opacity = camada === null || camada === y ? base : base * 0.12;
      }),
    );
    if (camada !== null && !separado) alternarCamadas(true);
    else w.cena.render();
  }

  function alternarCamadas(forcar?: boolean) {
    const w = mundo.current;
    if (!w) return;
    const alvo = forcar ? 1 : separado ? 0 : 1;
    const de = w.abertura;
    // eslint-disable-next-line react-hooks/purity
    const inicio = Date.now();
    setSeparado(alvo === 1);
    const quadro = () => {
      if (!vivo.current) return;
      const k = Math.min(1, (Date.now() - inicio) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      w.abertura = de + (alvo - de) * e;
      w.camadas.forEach((g, y) => {
        // cada camada sobe um pouco mais que a de baixo, com leve quique
        const atraso = Math.max(0, Math.min(1, w.abertura * 1.15 - y * 0.05));
        g.position.y = y + y * SEPARACAO * atraso;
      });
      w.cena.render();
      if (k < 1) requestAnimationFrame(quadro);
    };
    quadro();
  }

  function mudar(d: number) {
    if (estado.current.bloqueado) return;
    setResposta((r) => Math.max(0, Math.min(99, r + d)));
  }

  function conferir() {
    if (resposta === certo) {
      if (rodada.pergunta === "total") {
        const cheio = rodada.alturas.every((l) => l.every((h) => h === rodada.alturas[0]![0]));
        return onAcerto(
          cheio
            ? `Isso! ${colunas} × ${linhas} × ${rodada.alturas[0]![0]} = ${certo} cubinhos.`
            : `Isso! ${certo} cubinhos, somando camada por camada.`,
        );
      }
      const { c, l, a } = rodada.completo!;
      return onAcerto(`Isso! ${c} × ${l} × ${a} = ${c * l * a}, e ${c * l * a} − ${presentes} = ${certo}.`);
    }
    onErro(
      rodada.pergunta === "total"
        ? resposta < certo
          ? "Faltou contar alguns. Separe as camadas: tem cubinhos escondidos atrás e embaixo."
          : "Passou do total. Conte camada por camada, sem repetir."
        : "Ainda não. Calcule quantos cabem no bloco inteiro e tire os que já estão lá.",
    );
  }

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <View style={j.pedido}>
        <View style={{ flex: 1 }}>
          <Texto style={{ fontSize: 12, color: cor.textoSuave }}>
            {rodada.pergunta === "total" ? "Quantos cubinhos há ao todo?" : "Quantos cubinhos faltam?"}
          </Texto>
          {rodada.completo ? (
            <Texto style={{ fontFamily: fonte.titulo, fontSize: 15, color: cor.tinta }}>
              Bloco completo: {rodada.completo.c} × {rodada.completo.l} × {rodada.completo.a}
            </Texto>
          ) : (
            <Texto style={{ fontFamily: fonte.titulo, fontSize: 15, color: cor.tinta }}>
              Gire para achar os escondidos
            </Texto>
          )}
        </View>
        {rodada.completo ? <View style={v.legenda} /> : null}
      </View>

      <View style={j.palco}>
        <Palco3D montar={montar} distancia={8.5} alvo={[0, 1, 0]} />
      </View>

      <View style={v.barra}>
        <Pressable
          onPress={() => alternarCamadas()}
          style={[v.chip, separado && v.chipAtivo]}
          accessibilityRole="button"
        >
          <Texto style={{ fontFamily: fonte.textoForte, fontSize: 12, color: separado ? "#FFFFFF" : cor.roxo }}>
            {separado ? "Juntar" : "Separar"}
          </Texto>
        </Pressable>
        <View style={v.divisor} />
        {Array.from({ length: altura }, (_, y) => (
          <Pressable
            key={y}
            onPress={() => focar(foco === y ? null : y)}
            accessibilityRole="button"
            accessibilityLabel={`Ver só a camada ${y + 1}`}
            style={[
              v.chip,
              { borderColor: COR_CHIP[y % COR_CHIP.length] },
              foco === y && { backgroundColor: COR_CHIP[y % COR_CHIP.length] },
            ]}
          >
            <View style={[v.bolinha, { backgroundColor: COR_CHIP[y % COR_CHIP.length] }]} />
            <Texto style={{ fontFamily: fonte.textoForte, fontSize: 12, color: foco === y ? "#FFFFFF" : cor.tinta }}>
              {y + 1}ª
            </Texto>
          </Pressable>
        ))}
        {foco !== null ? (
          <Pressable onPress={() => focar(null)} style={v.chip}>
            <Texto style={{ fontFamily: fonte.textoForte, fontSize: 12, color: cor.textoSuave }}>Todas</Texto>
          </Pressable>
        ) : null}
      </View>

      <View style={v.resposta}>
        <Pressable onPress={() => mudar(-1)} style={v.botaoNum} accessibilityLabel="Menos um" hitSlop={6}>
          <Texto style={v.sinal}>−</Texto>
        </Pressable>
        <View style={{ alignItems: "center", minWidth: 80 }}>
          <Texto style={{ fontFamily: fonte.tituloForte, fontSize: 34, color: cor.tinta, lineHeight: 40 }}>
            {resposta}
          </Texto>
          <Texto style={{ fontSize: 11, color: cor.textoSuave }}>cubinhos</Texto>
        </View>
        <Pressable onPress={() => mudar(1)} style={v.botaoNum} accessibilityLabel="Mais um" hitSlop={6}>
          <Texto style={v.sinal}>+</Texto>
        </Pressable>
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const v = criarEstilos(() => ({
  barra: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: cor.lilas,
    backgroundColor: cor.superficie,
  },
  chipAtivo: { backgroundColor: cor.roxo, borderColor: cor.roxo },
  bolinha: { width: 8, height: 8, borderRadius: 4 },
  divisor: { width: 1, height: 20, backgroundColor: cor.borda, marginHorizontal: 2 },
  legenda: { width: 34, height: 22, borderRadius: 4, borderWidth: 2, borderColor: cor.pessego },
  camadas: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: cor.superficie,
    borderWidth: 1.5,
    borderColor: cor.lilas,
  },
  resposta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: "auto", paddingTop: 10 },
  botaoNum: {
    width: 48,
    height: 48,
    borderRadius: raio.m,
    borderWidth: 1.5,
    borderColor: cor.bordaForte,
    backgroundColor: cor.superficie,
    alignItems: "center",
    justifyContent: "center",
  },
  sinal: { fontFamily: fonte.titulo, fontSize: 24, color: cor.tinta, lineHeight: 28 },
}));
