import { useRef, useState } from "react";
import { View } from "react-native";
import * as THREE from "three";
import type { RodadaSolidos, Solido } from "@modolume/core";
import { Palco3D, type Cena } from "../3d/Palco3D";
import { Botao, Texto } from "../ui";
import { cor, fonte } from "@/tema";
import { j } from "./cubos";
import type { PropsJogo } from "./tipos";
import { useUltimo } from "@/lib/useUltimo";
import { Acoes } from "./Acoes";

/**
 * Explorador de sólidos (exploração 3D): gira o sólido e toca para marcar cada
 * face, vértice ou aresta. Alguns ficam escondidos: é preciso girar para achar.
 * Cada marca dá um brilho; no dado, as faces pintadas ganham as bolinhas.
 */

type Def = { nome: string; vertices: [number, number, number][]; faces: number[][] };

/** Prisma de base regular com n lados. */
function prisma(n: number, r: number, h: number, nome: string): Def {
  const vertices: [number, number, number][] = [];
  for (const y of [-h, h])
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      vertices.push([r * Math.cos(a), y, r * Math.sin(a)]);
    }
  const faces = [
    Array.from({ length: n }, (_, i) => i),
    Array.from({ length: n }, (_, i) => n + i),
    ...Array.from({ length: n }, (_, i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i]),
  ];
  return { nome, vertices, faces };
}

/** Pirâmide de base regular com n lados. */
function piramide(n: number, r: number, nome: string): Def {
  const vertices: [number, number, number][] = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    vertices.push([r * Math.cos(a), -0.9, r * Math.sin(a)]);
  }
  vertices.push([0, 1.4, 0]);
  const faces = [Array.from({ length: n }, (_, i) => i), ...Array.from({ length: n }, (_, i) => [i, (i + 1) % n, n])];
  return { nome, vertices, faces };
}

const SOLIDOS: Record<Solido, Def> = {
  cubo: {
    nome: "cubo",
    vertices: [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ],
    faces: [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [3, 2, 6, 7],
      [0, 3, 7, 4],
      [1, 2, 6, 5],
    ],
  },
  piramide: piramide(4, 1.7, "pirâmide de base quadrada"),
  prisma: prisma(3, 1.45, 1.2, "prisma de base triangular"),
  prismaHexagonal: prisma(6, 1.35, 1.15, "prisma de base hexagonal"),
  piramidePentagonal: piramide(5, 1.6, "pirâmide de base pentagonal"),
};

/** Arestas únicas a partir das faces. */
function arestasDe(def: Def): [number, number][] {
  const vistas = new Set<string>();
  const lista: [number, number][] = [];
  for (const f of def.faces)
    for (let k = 0; k < f.length; k += 1) {
      const a = f[k]!;
      const b = f[(k + 1) % f.length]!;
      const chave = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!vistas.has(chave)) {
        vistas.add(chave);
        lista.push([a, b]);
      }
    }
  return lista;
}

/** Posições das bolinhas do dado, de -1 a 1 no plano da face. */
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [
    [-1, -1],
    [1, 1],
  ],
  3: [
    [-1, -1],
    [0, 0],
    [1, 1],
  ],
  4: [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ],
  5: [
    [-1, -1],
    [1, -1],
    [0, 0],
    [-1, 1],
    [1, 1],
  ],
  6: [
    [-1, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [1, 1],
  ],
};

const CORES = [0x7b61ff, 0xffac7a, 0x8fd3ff, 0xc9b4ff, 0x9b7dff, 0xffc7a3];
const BASE = 0xf5f2ff;
const NOME_ALVO = { faces: "faces", vertices: "vértices", arestas: "arestas" } as const;

export function JogoSolidos({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaSolidos>) {
  const [marcados, setMarcados] = useState(0);
  const mundo = useRef<{ clicaveis: THREE.Mesh[]; marcados: Set<THREE.Mesh>; cor: number; cena: Cena } | null>(null);
  const bloqueadoRef = useUltimo(bloqueado);
  const def = SOLIDOS[rodada.solido];
  const alvo = NOME_ALVO[rodada.contar];

  function montar(cena: Cena) {
    const pontos = def.vertices.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const clicaveis: THREE.Mesh[] = [];
    const modo = rodada.contar;

    for (const face of def.faces) {
      const pts = face.map((i) => pontos[i]!);
      const pos: number[] = [];
      for (let k = 1; k < pts.length - 1; k += 1)
        for (const p of [pts[0]!, pts[k]!, pts[k + 1]!]) pos.push(p.x, p.y, p.z);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.computeVertexNormals();
      const opaca = modo === "faces";
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          color: BASE,
          side: THREE.DoubleSide,
          roughness: 0.7,
          transparent: !opaca,
          opacity: opaca ? 1 : modo === "arestas" ? 0.35 : 0.55,
          depthWrite: opaca,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        }),
      );
      // centro e eixos da face (para as bolinhas do dado)
      const centro = pts.reduce((a, p) => a.add(p), new THREE.Vector3()).divideScalar(pts.length);
      const normal = new THREE.Vector3()
        .subVectors(pts[1]!, pts[0]!)
        .cross(new THREE.Vector3().subVectors(pts[2]!, pts[0]!))
        .normalize();
      if (normal.dot(centro) < 0) normal.negate();
      mesh.userData = { centro, normal, u: new THREE.Vector3().subVectors(pts[1]!, pts[0]!).normalize() };
      cena.scene.add(mesh);
      if (modo === "faces") clicaveis.push(mesh);
      if (modo !== "arestas") {
        cena.scene.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([...pts, pts[0]!]),
            new THREE.LineBasicMaterial({ color: 0x1e2a78 }),
          ),
        );
      }
    }

    if (modo === "vertices") {
      const geoV = new THREE.SphereGeometry(0.2, 20, 14);
      for (const p of pontos) {
        const s = new THREE.Mesh(geoV, new THREE.MeshStandardMaterial({ color: 0x1e2a78, roughness: 0.4 }));
        s.position.copy(p);
        s.userData.base = 0x1e2a78;
        cena.scene.add(s);
        clicaveis.push(s);
      }
    }

    if (modo === "arestas") {
      // cano visível fino + área de toque grossa e invisível
      const cima = new THREE.Vector3(0, 1, 0);
      for (const [a, b] of arestasDe(def)) {
        const pa = pontos[a]!;
        const pb = pontos[b]!;
        const dir = new THREE.Vector3().subVectors(pb, pa);
        const meio = new THREE.Vector3().addVectors(pa, pb).multiplyScalar(0.5);
        const giro = new THREE.Quaternion().setFromUnitVectors(cima, dir.clone().normalize());
        const cano = new THREE.Mesh(
          new THREE.CylinderGeometry(0.065, 0.065, dir.length(), 12),
          new THREE.MeshStandardMaterial({ color: 0x1e2a78, roughness: 0.4 }),
        );
        cano.position.copy(meio);
        cano.quaternion.copy(giro);
        cano.userData.base = 0x1e2a78;
        cena.scene.add(cano);
        const toque = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.24, dir.length() * 0.8, 8),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
        );
        toque.position.copy(meio);
        toque.quaternion.copy(giro);
        toque.userData.visivel = cano;
        cena.scene.add(toque);
        clicaveis.push(toque);
      }
      // bolinhas nos cantos, só para enfeitar
      const geoV = new THREE.SphereGeometry(0.1, 14, 10);
      for (const p of pontos) {
        const s = new THREE.Mesh(geoV, new THREE.MeshStandardMaterial({ color: 0x1e2a78 }));
        s.position.copy(p);
        cena.scene.add(s);
      }
    }
    mundo.current = { clicaveis, marcados: new Set(), cor: 0, cena };
  }

  /** Brilho rápido no objeto marcado. */
  function brilhar(m: THREE.Mesh, cena: Cena) {
    const mat = m.material as THREE.MeshStandardMaterial;
    mat.emissive = new THREE.Color(0xffffff);
    const inicio = Date.now();
    const quadro = () => {
      const k = Math.min(1, (Date.now() - inicio) / 380);
      mat.emissiveIntensity = 0.9 * (1 - k);
      cena.render();
      if (k < 1) requestAnimationFrame(quadro);
    };
    quadro();
  }

  /** Bolinhas do dado numa face. */
  function pintarDado(face: THREE.Mesh, numero: number, cena: Cena) {
    const { centro, normal, u } = face.userData as { centro: THREE.Vector3; normal: THREE.Vector3; u: THREE.Vector3 };
    const v = new THREE.Vector3().crossVectors(normal, u).normalize();
    const grupo = new THREE.Group();
    const geo = new THREE.CircleGeometry(0.17, 20);
    const mat = new THREE.MeshBasicMaterial({ color: 0x1e2a78, side: THREE.DoubleSide });
    for (const [a, b] of PIPS[numero]!) {
      const pip = new THREE.Mesh(geo, mat);
      pip.position
        .copy(centro)
        .addScaledVector(u, a * 0.5)
        .addScaledVector(v, b * 0.5)
        .addScaledVector(normal, 0.015);
      pip.lookAt(pip.position.clone().add(normal));
      grupo.add(pip);
    }
    cena.scene.add(grupo);
    face.userData.pips = grupo;
  }

  function aoTocar(x: number, y: number, cena: Cena) {
    const w = mundo.current;
    if (!w || bloqueadoRef.current) return;
    const hit = cena.atingir(x, y, w.clicaveis)[0];
    if (!hit) return;
    const m = hit.object as THREE.Mesh;
    const visivel = (m.userData.visivel as THREE.Mesh | undefined) ?? m;
    const mat = visivel.material as THREE.MeshStandardMaterial;
    if (w.marcados.has(m)) {
      w.marcados.delete(m);
      mat.color.setHex((visivel.userData.base as number | undefined) ?? BASE);
      visivel.scale.set(1, 1, 1);
      if (m.userData.pips) {
        cena.scene.remove(m.userData.pips as THREE.Group);
        m.userData.pips = undefined;
      }
    } else {
      w.marcados.add(m);
      mat.color.setHex(CORES[w.cor++ % CORES.length]!);
      if (rodada.contar === "arestas") visivel.scale.set(1.9, 1, 1.9);
      if (rodada.dado) {
        const usados = new Set([...w.marcados].map((f) => f.userData.numero as number | undefined));
        let n = 1;
        while (usados.has(n)) n += 1;
        m.userData.numero = n;
        pintarDado(m, n, cena);
      }
      brilhar(visivel, cena);
    }
    setMarcados(w.marcados.size);
    cena.render();
  }

  function conferir() {
    const total = mundo.current?.clicaveis.length ?? 0;
    if (marcados < total) {
      onErro(`Ainda há ${alvo} sem marcar. Gire o sólido para procurar atrás e embaixo.`);
      return;
    }
    if (rodada.contar === "arestas") {
      const V = def.vertices.length;
      const F = def.faces.length;
      onAcerto(
        `Isso! ${total} arestas. E repare: ${V} vértices − ${total} arestas + ${F} faces = 2. Vale para todo sólido assim!`,
      );
      return;
    }
    onAcerto(`Isso! O ${def.nome} tem ${total} ${alvo}.`);
  }

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <View style={j.pedido}>
        <View style={{ flex: 1 }}>
          <Texto style={{ fontSize: 12, color: cor.textoSuave }}>Marque todas as {alvo}</Texto>
          <Texto style={{ fontFamily: fonte.titulo, fontSize: 17, color: cor.tinta }}>
            {def.nome.charAt(0).toUpperCase() + def.nome.slice(1)}
          </Texto>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Texto style={{ fontFamily: fonte.titulo, fontSize: 24, color: cor.roxo, lineHeight: 28 }}>{marcados}</Texto>
          <Texto style={{ fontSize: 11, color: cor.textoSuave }}>marcadas</Texto>
        </View>
      </View>
      <View style={j.palco}>
        <Palco3D montar={montar} onToque={aoTocar} distancia={8} />
        <Texto style={j.dica} pointerEvents="none">
          1 dedo gira · toque marca · 2 dedos aproximam
        </Texto>
      </View>
      <Acoes>
        <Botao
          titulo="Terminei de marcar"
          onPress={conferir}
          disabled={bloqueado || marcados === 0}
          style={{ flex: 1 }}
        />
      </Acoes>
    </View>
  );
}
