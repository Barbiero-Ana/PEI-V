import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import * as THREE from "three";
import type { RodadaCubos } from "@modolume/core";
import { Palco3D, type Cena } from "../3d/Palco3D";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import type { PropsJogo } from "./tipos";
import { useUltimo } from "@/lib/useUltimo";
import { Acoes } from "./Acoes";

/**
 * Construtor de cubos (exploração 3D): gira a cena e toca no chão ou numa face
 * para encaixar um cubo. Monta um bloco cheio com o volume/medidas pedidos.
 */

const N = 6;
const ALTURA_MAX = 5;
const centro = (i: number) => i - (N - 1) / 2;
const chave = (x: number, y: number, z: number) => `${x},${y},${z}`;
type Pos = [number, number, number];

export function JogoCubos({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaCubos>) {
  const [qtd, setQtd] = useState(0);
  const [modo, setModo] = useState<"colocar" | "tirar">("colocar");
  const mundo = useRef<{
    cubos: Map<string, THREE.Mesh>;
    chao: THREE.Mesh;
    geo: THREE.BoxGeometry;
    arestas: THREE.EdgesGeometry;
    mat: THREE.Material;
    matA: THREE.Material;
    cena: Cena;
  } | null>(null);
  const estado = useUltimo({ modo, bloqueado });

  function montar(cena: Cena) {
    const geo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
    const arestas = new THREE.EdgesGeometry(geo);
    const mat = new THREE.MeshStandardMaterial({ color: 0x7b61ff, roughness: 0.55 });
    const matA = new THREE.LineBasicMaterial({ color: 0xefebff });
    const chao = new THREE.Mesh(
      new THREE.PlaneGeometry(N, N),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 }),
    );
    chao.rotation.x = -Math.PI / 2;
    const grade = new THREE.GridHelper(N, N, 0xd6cff0, 0xe7e3f6);
    grade.position.y = 0.002;
    cena.scene.add(chao, grade);
    mundo.current = { cubos: new Map(), chao, geo, arestas, mat, matA, cena };
    return () => {
      geo.dispose();
      arestas.dispose();
    };
  }

  function adicionar([x, y, z]: Pos) {
    const w = mundo.current!;
    const m = new THREE.Mesh(w.geo, w.mat);
    m.position.set(centro(x), y + 0.5, centro(z));
    m.userData.pos = [x, y, z];
    m.add(new THREE.LineSegments(w.arestas, w.matA));
    m.scale.setScalar(0.4);
    w.cena.scene.add(m);
    w.cubos.set(chave(x, y, z), m);
    setQtd(w.cubos.size);
    const t0 = Date.now();
    const passo = () => {
      const k = Math.min(1, (Date.now() - t0) / 180);
      m.scale.setScalar(0.4 + 0.6 * (1 - Math.pow(1 - k, 3)));
      w.cena.render();
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  function aoTocar(x: number, y: number, cena: Cena) {
    const w = mundo.current;
    if (!w || estado.current.bloqueado) return;
    const hit = cena.atingir(x, y, [...w.cubos.values(), w.chao])[0];
    if (!hit) return;
    if (estado.current.modo === "tirar") {
      if (hit.object !== w.chao) {
        const [cx, cy, cz] = hit.object.userData.pos as Pos;
        cena.scene.remove(hit.object);
        w.cubos.delete(chave(cx, cy, cz));
        setQtd(w.cubos.size);
        cena.render();
      }
      return;
    }
    let alvo: Pos;
    if (hit.object === w.chao) {
      alvo = [Math.floor(hit.point.x + N / 2), 0, Math.floor(hit.point.z + N / 2)];
    } else {
      const [cx, cy, cz] = hit.object.userData.pos as Pos;
      const n = hit.face!.normal;
      alvo = [cx + Math.round(n.x), cy + Math.round(n.y), cz + Math.round(n.z)];
    }
    const [ax, ay, az] = alvo;
    if (ax < 0 || ax >= N || az < 0 || az >= N || ay < 0 || ay >= ALTURA_MAX || w.cubos.has(chave(ax, ay, az))) return;
    adicionar(alvo);
  }

  function limpar() {
    const w = mundo.current;
    if (!w) return;
    for (const m of w.cubos.values()) w.cena.scene.remove(m);
    w.cubos.clear();
    setQtd(0);
    w.cena.render();
  }

  function conferir() {
    const pos = [...(mundo.current?.cubos.values() ?? [])].map((m) => m.userData.pos as Pos);
    if (pos.length !== rodada.volume) {
      onErro(
        pos.length < rodada.volume
          ? `Você usou ${pos.length} cubos. O bloco precisa de ${rodada.volume}.`
          : `Você usou ${pos.length} cubos, passou! O bloco precisa de ${rodada.volume}.`,
      );
      return;
    }
    const eixo = (i: 0 | 1 | 2) => {
      const v = pos.map((p) => p[i]);
      return Math.max(...v) - Math.min(...v) + 1;
    };
    const [dx, dy, dz] = [eixo(0), eixo(1), eixo(2)];
    if (dx * dy * dz !== pos.length) {
      onErro("Quase! O bloco precisa ser cheio, sem buracos nem degraus.");
      return;
    }
    if (rodada.medidas) {
      const { comprimento: c, largura: l, altura: a } = rodada.medidas;
      if (!((dx === c && dz === l) || (dx === l && dz === c)) || dy !== a) {
        onErro(`O volume está certo, mas as medidas devem ser ${c} × ${l} × ${a}.`);
        return;
      }
    }
    onAcerto(`Isso! ${dx} × ${dz} × ${dy} = ${pos.length} cubinhos.`);
  }

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <View style={j.pedido}>
        <Texto style={j.rotulo}>PEDIDO</Texto>
        <Texto style={j.grande}>
          {rodada.medidas
            ? `${rodada.medidas.comprimento} × ${rodada.medidas.largura} × ${rodada.medidas.altura}`
            : `${rodada.volume} cubos`}
        </Texto>
        <Texto style={{ fontSize: 12, color: cor.textoSuave, flex: 1, textAlign: "right" }}>
          {rodada.medidas ? "compr. × larg. × altura" : "qualquer bloco cheio"}
        </Texto>
      </View>

      <View style={j.palco}>
        <Palco3D montar={montar} onToque={aoTocar} alvo={[0, 0.8, 0]} distancia={11} />
        <View style={j.contador} pointerEvents="none">
          <Texto style={{ fontFamily: fonte.titulo, color: cor.tinta, fontSize: 13 }}>
            {qtd} {qtd === 1 ? "cubo" : "cubos"}
          </Texto>
        </View>
        <Texto style={j.dica} pointerEvents="none">
          1 dedo gira · 2 dedos aproximam
        </Texto>
      </View>

      <View style={j.segmento}>
        {(["colocar", "tirar"] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setModo(m)}
            accessibilityRole="radio"
            accessibilityState={{ selected: modo === m }}
            style={[j.opcao, modo === m && j.opcaoAtiva]}
          >
            <Texto style={{ fontFamily: fonte.titulo, color: modo === m ? cor.roxo : cor.textoSuave }}>
              {m === "colocar" ? "Colocar cubo" : "Tirar cubo"}
            </Texto>
          </Pressable>
        ))}
      </View>
      <Acoes>
        <Botao titulo="Limpar" variante="secundario" onPress={limpar} disabled={bloqueado || qtd === 0} />
        <Botao titulo="Conferir" onPress={conferir} disabled={bloqueado || qtd === 0} style={{ flex: 1 }} />
      </Acoes>
    </View>
  );
}

export const j = criarEstilos(() => ({
  pedido: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: raio.m,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.borda,
  },
  rotulo: { fontFamily: fonte.titulo, fontSize: 10, letterSpacing: 1.6, color: cor.textoSuave },
  grande: { fontFamily: fonte.titulo, fontSize: 22, color: cor.tinta },
  palco: {
    flex: 1,
    minHeight: 220,
    borderRadius: raio.g,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.fundo,
  },
  contador: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: cor.superficie,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dica: {
    position: "absolute",
    bottom: 8,
    left: 10,
    fontSize: 11,
    color: cor.textoSuave,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    overflow: "hidden",
  },
  segmento: { flexDirection: "row", gap: 4, padding: 4, borderRadius: raio.m, backgroundColor: cor.suave },
  opcao: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10 },
  opcaoAtiva: { backgroundColor: cor.superficie },
}));
