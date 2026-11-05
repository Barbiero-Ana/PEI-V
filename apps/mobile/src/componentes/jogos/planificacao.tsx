import { useEffect, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import * as THREE from "three";
import type { Casa, RodadaPlanificacao } from "@modolume/core";
import { Palco3D, type Cena } from "../3d/Palco3D";
import { Botao, Texto } from "../ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";
import { j } from "./cubos";
import type { PropsJogo } from "./tipos";
import { useUltimo } from "@/lib/useUltimo";
import { Acoes } from "./Acoes";

/**
 * Planificação do dado (exploração 3D): o molde de papelão aparece aberto e,
 * ao tocar em Dobrar, cada face gira na sua dobradiça até formar a caixa.
 * - "escolher": achar, entre os moldes, o que fecha um cubo. Se duas faces
 *   caem no mesmo lugar, elas acendem em pêssego.
 * - "dado": escrever os números (bolinhas) para as faces opostas somarem 7.
 */

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

const COR_FACE = 0xffffff;
/** Tons das faces no modo escolher (papelão impresso nas cores da marca). */
const TONS = [0xefebff, 0xeaf7ff, 0xfff1e7, 0xf5f0ff, 0xd9ccff, 0xbfe6ff];
const COR_FIXA = 0xdccdea;
const COR_ESCRITA = 0xefebff;
const COR_ERRO = 0xffac7a;
const DURACAO = 1900;
/** Atraso entre uma camada de dobras e a seguinte (fração da dobra). */
const ATRASO = 0.3;

interface Face {
  casa: Casa;
  grupo: THREE.Group;
  malha: THREE.Mesh;
  pivo?: THREE.Object3D;
  eixo?: THREE.Vector3;
  /** Distância (em dobras) até a face central. */
  profundidade: number;
  pips?: THREE.Group;
}

interface Mundo {
  cena: Cena;
  base: THREE.Group | null;
  /** Onde fica o centro do cubo quando o molde está todo dobrado. */
  centroFinal: THREE.Vector3;
  faces: Face[];
  dobra: number;
  girando: boolean;
}

/** Monta o molde como uma árvore: cada face filha gira na aresta que divide com a mãe. */
function montarRede(cena: Cena, casas: Casa[]): { base: THREE.Group; faces: Face[] } {
  const base = new THREE.Group();
  const cx = (Math.min(...casas.map((c) => c[0])) + Math.max(...casas.map((c) => c[0]))) / 2;
  const cz = (Math.min(...casas.map((c) => c[1])) + Math.max(...casas.map((c) => c[1]))) / 2;
  const indice = new Map(casas.map((c, i) => [`${c[0]},${c[1]}`, i]));
  const faces: Face[] = casas.map((casa) => {
    const grupo = new THREE.Group();
    const geo = new THREE.PlaneGeometry(0.97, 0.97);
    geo.rotateX(-Math.PI / 2);
    const malha = new THREE.Mesh(
      geo,
      // Lambert é mais leve de desenhar que o Standard (dobra fluida no celular)
      new THREE.MeshLambertMaterial({
        color: COR_FACE,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1,
      }),
    );
    grupo.add(malha);
    const borda = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x7b61ff }),
    );
    grupo.add(borda);
    return { casa, grupo, malha, profundidade: 0 };
  });

  // raiz: a casa mais "do meio" (menor distância máxima até as outras);
  // assim a dobra acontece de forma equilibrada em volta dela
  const vizinhas = (i: number) =>
    (
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ] as const
    )
      .map(([dc, dr]) => indice.get(`${faces[i]!.casa[0] + dc},${faces[i]!.casa[1] + dr}`))
      .filter((k): k is number => k !== undefined);
  const excentricidade = (i: number) => {
    const dist = new Map([[i, 0]]);
    const f = [i];
    while (f.length) {
      const a = f.shift()!;
      for (const b of vizinhas(a))
        if (!dist.has(b)) {
          dist.set(b, dist.get(a)! + 1);
          f.push(b);
        }
    }
    return Math.max(...dist.values());
  };
  let iRaiz = 0;
  faces.forEach((_, i) => {
    if (excentricidade(i) < excentricidade(iRaiz)) iRaiz = i;
  });
  const raiz = faces[iRaiz]!;
  raiz.grupo.position.set(raiz.casa[0] - cx, 0, raiz.casa[1] - cz);
  base.add(raiz.grupo);
  const visto = new Set([iRaiz]);
  const fila = [iRaiz];
  while (fila.length) {
    const p = fila.shift()!;
    const [c, r] = faces[p]!.casa;
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const i = indice.get(`${c + dc},${r + dr}`);
      if (i === undefined || visto.has(i)) continue;
      visto.add(i);
      fila.push(i);
      const pivo = new THREE.Object3D();
      pivo.position.set(dc * 0.5, 0, dr * 0.5);
      faces[p]!.grupo.add(pivo);
      faces[i]!.grupo.position.set(dc * 0.5, 0, dr * 0.5);
      pivo.add(faces[i]!.grupo);
      faces[i]!.pivo = pivo;
      faces[i]!.eixo = new THREE.Vector3(-dr, 0, dc).normalize();
      faces[i]!.profundidade = faces[p]!.profundidade + 1;
    }
  }
  cena.scene.add(base);
  return { base, faces };
}

/** Curva suave: começa e termina devagar, sem trancos. */
const suave = (x: number) => (1 - Math.cos(Math.PI * x)) / 2;

/**
 * Dobra em sequência: primeiro as faces ligadas à do meio, depois as
 * seguintes. `t` vai de 0 (aberto) a 1 (fechado).
 */
function aplicarDobra(faces: Face[], t: number, base?: THREE.Group | null, centroFinal?: THREE.Vector3) {
  const maior = Math.max(1, ...faces.map((f) => f.profundidade));
  const total = 1 + (maior - 1) * ATRASO;
  for (const f of faces) {
    if (!f.pivo || !f.eixo) continue;
    const local = Math.max(0, Math.min(1, t * total - (f.profundidade - 1) * ATRASO));
    const angulo = suave(local);
    f.pivo.quaternion.setFromAxisAngle(f.eixo, (angulo * Math.PI) / 2);
  }
  // enquanto dobra, o molde desliza para o cubo terminar no centro do palco
  if (base && centroFinal) base.position.set(-centroFinal.x * t, 0, -centroFinal.z * t);
}

/** Centro e normal de cada face depois de dobrada (no mundo). */
function medir(faces: Face[]) {
  return faces.map((f) => {
    f.malha.updateWorldMatrix(true, false);
    const p = new THREE.Vector3();
    f.malha.getWorldPosition(p);
    const q = new THREE.Quaternion();
    f.malha.getWorldQuaternion(q);
    return { p, n: new THREE.Vector3(0, 1, 0).applyQuaternion(q) };
  });
}

/** Desenha as bolinhas dos dois lados da face (fora e dentro do cubo). */
function desenharPips(f: Face, numero: number | null) {
  if (f.pips) {
    f.grupo.remove(f.pips);
    f.pips = undefined;
  }
  if (!numero) return;
  const g = new THREE.Group();
  const geo = new THREE.CircleGeometry(0.085, 18);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({ color: 0x1e2a78, side: THREE.DoubleSide });
  for (const lado of [0.012, -0.012])
    for (const [a, b] of PIPS[numero]!) {
      const pip = new THREE.Mesh(geo, mat);
      pip.position.set(a * 0.26, lado, b * 0.26);
      g.add(pip);
    }
  f.grupo.add(g);
  f.pips = g;
}

/** Miniatura 2D de um molde (para escolher). */
function Molde({ casas, tamanho = 70, ativo }: { casas: Casa[]; tamanho?: number; ativo: boolean }) {
  const colunas = Math.max(...casas.map((c) => c[0])) + 1;
  const linhas = Math.max(...casas.map((c) => c[1])) + 1;
  const lado = Math.min(tamanho / colunas, tamanho / linhas);
  return (
    <Svg width={colunas * lado} height={linhas * lado}>
      {casas.map(([c, r], i) => (
        <Rect
          key={i}
          x={c * lado + 1}
          y={r * lado + 1}
          width={lado - 2}
          height={lado - 2}
          rx={2}
          fill={ativo ? cor.roxoClaro : "#FFFFFF"}
          stroke={ativo ? cor.roxo : cor.bordaForte}
          strokeWidth={1.5}
        />
      ))}
    </Svg>
  );
}

export function JogoPlanificacao({ rodada, onErro, onAcerto, bloqueado }: PropsJogo<RodadaPlanificacao>) {
  const escolher = rodada.modo === "escolher";
  const [escolhido, setEscolhido] = useState(0);
  const [dobrado, setDobrado] = useState(false);
  const [animando, setAnimando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [numeros, setNumeros] = useState<(number | null)[]>(() =>
    (rodada.rede ?? []).map((_, i) => rodada.fixos?.[i] ?? null),
  );
  const mundo = useRef<Mundo | null>(null);
  const vivo = useRef(true);
  const estado = useUltimo({ dobrado, animando, bloqueado });
  // valores lidos pelos toques no 3D (fora do ciclo de render)
  const escolhidoRef = useRef(0);
  const numerosRef = useRef(numeros);

  const casasAtuais = (): Casa[] => (escolher ? rodada.opcoes![escolhidoRef.current]! : rodada.rede!);

  useEffect(
    () => () => {
      vivo.current = false;
    },
    [],
  );

  function reconstruir(casas: Casa[]) {
    const w = mundo.current;
    if (!w) return;
    if (w.base) w.cena.scene.remove(w.base);
    const { base, faces } = montarRede(w.cena, casas);
    w.base = base;
    w.faces = faces;
    w.dobra = 0;
    w.girando = false;
    // mede o centro do cubo fechado e volta a abrir
    aplicarDobra(faces, 1);
    w.centroFinal = medir(faces)
      .reduce((a, m) => a.add(m.p), new THREE.Vector3())
      .divideScalar(faces.length);
    aplicarDobra(faces, 0);
    if (escolher)
      faces.forEach((f, i) => (f.malha.material as THREE.MeshLambertMaterial).color.setHex(TONS[i % TONS.length]!));
    if (!escolher) {
      faces.forEach((f, i) => {
        const fixo = rodada.fixos?.[i] !== undefined;
        (f.malha.material as THREE.MeshLambertMaterial).color.setHex(
          fixo ? COR_FIXA : numerosRef.current[i] ? COR_ESCRITA : COR_FACE,
        );
        desenharPips(f, numerosRef.current[i] ?? null);
      });
    }
    w.cena.render();
  }

  function montar(cena: Cena) {
    // chão quadriculado bem suave, para dar profundidade
    const grade = new THREE.GridHelper(8, 16, 0xe7e3f6, 0xefecf9);
    grade.position.y = -0.02;
    cena.scene.add(grade);
    mundo.current = { cena, base: null, centroFinal: new THREE.Vector3(), faces: [], dobra: 0, girando: false };
    reconstruir(casasAtuais());
  }

  /** Anima a dobra até `alvo` (0 aberto, 1 fechado). */
  function animarDobra(alvo: number, depois?: () => void) {
    const w = mundo.current;
    if (!w) return;
    const de = w.dobra;
    // eslint-disable-next-line react-hooks/purity
    const inicio = Date.now();
    setAnimando(true);
    const quadro = () => {
      if (!vivo.current || !mundo.current) return;
      const k = Math.min(1, (Date.now() - inicio) / DURACAO);
      w.dobra = de + (alvo - de) * k;
      aplicarDobra(w.faces, w.dobra, w.base, w.centroFinal);
      w.cena.render();
      if (k < 1) requestAnimationFrame(quadro);
      else {
        setAnimando(false);
        setDobrado(alvo === 1);
        depois?.();
      }
    };
    quadro();
  }

  /** Pulinho do cubo ao fechar. */
  function pulinho() {
    const w = mundo.current;
    if (!w?.base) return;
    // eslint-disable-next-line react-hooks/purity
    const inicio = Date.now();
    const quadro = () => {
      if (!vivo.current || !w.base) return;
      const k = Math.min(1, (Date.now() - inicio) / 450);
      w.base.position.y = Math.sin(k * Math.PI) * 0.45;
      w.cena.render();
      if (k < 1) requestAnimationFrame(quadro);
    };
    quadro();
  }

  /** Depois de acertar, o dado fica girando devagar. */
  function girar() {
    const w = mundo.current;
    if (!w || w.girando || !w.base) return;
    w.girando = true;
    const quadro = () => {
      if (!vivo.current || !w.girando || !w.base) return;
      w.base.rotation.y += 0.012;
      // gira em torno do centro do cubo, não da borda do molde
      const c = w.centroFinal.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), w.base.rotation.y);
      w.base.position.set(-c.x, 0, -c.z);
      w.cena.render();
      requestAnimationFrame(quadro);
    };
    quadro();
  }

  /** Faces que caíram no mesmo lugar (molde que não fecha). */
  function sobrepostas(): number[] {
    const w = mundo.current!;
    const m = medir(w.faces);
    const ruins = new Set<number>();
    for (let a = 0; a < m.length; a += 1)
      for (let b = a + 1; b < m.length; b += 1)
        if (m[a]!.p.distanceTo(m[b]!.p) < 0.2) {
          ruins.add(a);
          ruins.add(b);
        }
    return [...ruins];
  }

  function dobrarEscolha() {
    if (estado.current.animando) return;
    if (dobrado) {
      setAviso(null);
      mundo.current?.faces.forEach((f, i) =>
        (f.malha.material as THREE.MeshLambertMaterial).color.setHex(TONS[i % TONS.length]!),
      );
      animarDobra(0);
      return;
    }
    animarDobra(1, () => {
      const ruins = sobrepostas();
      const w = mundo.current!;
      ruins.forEach((i) => (w.faces[i]!.malha.material as THREE.MeshLambertMaterial).color.setHex(COR_ERRO));
      w.cena.render();
      setAviso(ruins.length ? "Não fecha: duas faces caíram no mesmo lugar." : "Fechou um cubo certinho!");
      if (!ruins.length) pulinho();
    });
  }

  function confirmarEscolha() {
    if (escolhido === rodada.correta) {
      const fechar = () => {
        girar();
        onAcerto("Esse molde fecha o cubo! Cada face encontrou o seu lugar.");
      };
      if (dobrado) fechar();
      else animarDobra(1, fechar);
      return;
    }
    onErro("Esse molde não fecha um cubo. Dobre os moldes para testar antes de escolher.");
  }

  function trocarMolde(i: number) {
    if (bloqueado || estado.current.animando || i === escolhido) return;
    setEscolhido(i);
    setDobrado(false);
    setAviso(null);
    escolhidoRef.current = i;
    reconstruir(rodada.opcoes![i]!);
  }

  function aoTocar(x: number, y: number, cena: Cena) {
    if (escolher || estado.current.bloqueado || estado.current.dobrado || estado.current.animando) return;
    const w = mundo.current;
    if (!w) return;
    const hit = cena.atingir(
      x,
      y,
      w.faces.map((f) => f.malha),
    )[0];
    if (!hit) return;
    const i = w.faces.findIndex((f) => f.malha === hit.object);
    if (i < 0 || rodada.fixos?.[i] !== undefined) return;
    const atuais = numerosRef.current;
    const usados = new Set(atuais.filter((n, k) => k !== i && n !== null));
    // ciclo: vazio → próximos números livres → vazio
    const ordem = [null, 1, 2, 3, 4, 5, 6].filter((n) => n === null || !usados.has(n));
    const pos = ordem.indexOf(atuais[i] ?? null);
    const novo = ordem[(pos + 1) % ordem.length] ?? null;
    const lista = atuais.map((n, k) => (k === i ? novo : n));
    setNumeros(lista);
    numerosRef.current = lista;
    (w.faces[i]!.malha.material as THREE.MeshLambertMaterial).color.setHex(novo ? COR_ESCRITA : COR_FACE);
    desenharPips(w.faces[i]!, novo);
    cena.render();
  }

  function conferirDado() {
    if (numeros.some((n) => n === null)) return onErro("Ainda há faces sem número. Toque nelas para escrever.");
    animarDobra(1, () => {
      const w = mundo.current!;
      const m = medir(w.faces);
      for (let a = 0; a < m.length; a += 1)
        for (let b = a + 1; b < m.length; b += 1) {
          if (m[a]!.n.dot(m[b]!.n) < -0.9) {
            const soma = numeros[a]! + numeros[b]!;
            if (soma !== 7) {
              [a, b].forEach((i) => (w.faces[i]!.malha.material as THREE.MeshLambertMaterial).color.setHex(COR_ERRO));
              w.cena.render();
              setAviso(
                `O ${numeros[a]} ficou de frente para o ${numeros[b]}: ${numeros[a]} + ${numeros[b]} = ${soma}.`,
              );
              onErro(
                `Faces opostas precisam somar 7, mas ${numeros[a]} + ${numeros[b]} = ${soma}. Abra o molde e troque.`,
              );
              return;
            }
          }
        }
      setAviso("Dado perfeito: 1 + 6, 2 + 5 e 3 + 4!");
      pulinho();
      girar();
      onAcerto("Dado perfeito! Todas as faces opostas somam 7.");
    });
  }

  function abrirDado() {
    const w = mundo.current;
    if (!w) return;
    setAviso(null);
    w.faces.forEach((f, i) =>
      (f.malha.material as THREE.MeshLambertMaterial).color.setHex(
        rodada.fixos?.[i] !== undefined ? COR_FIXA : numeros[i] ? COR_ESCRITA : COR_FACE,
      ),
    );
    animarDobra(0);
  }

  return (
    <View style={{ flex: 1, gap: 10 }}>
      {escolher ? (
        <View style={p.moldes}>
          {rodada.opcoes!.map((casas, i) => (
            <Pressable
              key={i}
              onPress={() => trocarMolde(i)}
              accessibilityRole="radio"
              accessibilityState={{ selected: escolhido === i }}
              accessibilityLabel={`Molde ${i + 1}`}
              style={[p.molde, escolhido === i && p.moldeAtivo]}
            >
              <Molde casas={casas} ativo={escolhido === i} />
              <Texto
                style={{
                  fontSize: 11,
                  fontFamily: fonte.textoForte,
                  color: escolhido === i ? cor.roxo : cor.textoSuave,
                }}
              >
                Molde {i + 1}
              </Texto>
            </Pressable>
          ))}
        </View>
      ) : (
        <View style={j.pedido}>
          <View style={{ flex: 1 }}>
            <Texto style={{ fontSize: 12, color: cor.textoSuave }}>No dado, faces opostas somam 7</Texto>
            <Texto style={{ fontFamily: fonte.titulo, fontSize: 16, color: cor.tinta }}>1 + 6 · 2 + 5 · 3 + 4</Texto>
          </View>
          <Texto style={{ fontSize: 12, color: cor.textoSuave, textAlign: "right" }}>
            toque numa face{"\n"}para trocar o número
          </Texto>
        </View>
      )}

      <View style={j.palco}>
        <Palco3D montar={montar} onToque={aoTocar} distancia={8.5} alvo={[0, 0.45, 0]} />
        {aviso ? (
          <View
            style={[p.aviso, aviso.startsWith("Não") || aviso.startsWith("O ") ? p.avisoRuim : null]}
            pointerEvents="none"
          >
            <Texto style={{ fontFamily: fonte.textoForte, fontSize: 13, color: cor.tinta, textAlign: "center" }}>
              {aviso}
            </Texto>
          </View>
        ) : null}
      </View>

      {escolher ? (
        <Acoes>
          <Botao
            titulo={dobrado ? "Abrir" : "Dobrar"}
            variante="secundario"
            onPress={dobrarEscolha}
            disabled={bloqueado || animando}
          />
          <Botao
            titulo="É este molde!"
            onPress={confirmarEscolha}
            disabled={bloqueado || animando}
            style={{ flex: 1 }}
          />
        </Acoes>
      ) : (
        <Acoes>
          {dobrado ? (
            <Botao titulo="Abrir" variante="secundario" onPress={abrirDado} disabled={bloqueado || animando} />
          ) : null}
          <Botao
            titulo="Dobrar e conferir"
            onPress={conferirDado}
            disabled={bloqueado || animando || dobrado}
            style={{ flex: 1 }}
          />
        </Acoes>
      )}
    </View>
  );
}

const p = criarEstilos(() => ({
  moldes: { flexDirection: "row", gap: 8 },
  molde: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    minHeight: 104,
    padding: 8,
    borderRadius: raio.m,
    borderWidth: 2,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  moldeAtivo: { borderColor: cor.roxo, backgroundColor: cor.lilasClaro },
  aviso: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: cor.roxoClaro,
  },
  avisoRuim: { backgroundColor: cor.pessegoClaro },
}));
