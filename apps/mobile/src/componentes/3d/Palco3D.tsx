import { useEffect, useMemo, useRef } from "react";
import { Platform, View, type StyleProp, type ViewStyle } from "react-native";
import { GLView, type ExpoWebGLRenderingContext } from "expo-gl";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as THREE from "three";
import { useUltimo } from "@/lib/useUltimo";

/**
 * Palco 3D nativo: expo-gl + three.js.
 * - 1 dedo arrastando: gira a câmera ao redor do alvo
 * - 2 dedos (pinça): aproxima/afasta
 * - toque: onToque(x, y) com raycast disponível em `cena.atingir`
 * Renderiza sob demanda (só quando algo muda), para poupar bateria.
 */

export interface Cena {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  render: () => void;
  atingir: (x: number, y: number, objetos: THREE.Object3D[]) => THREE.Intersection[];
}

export function Palco3D({
  montar,
  onToque,
  alvo = [0, 0, 0],
  distancia: distanciaInicial = 9,
  style,
}: {
  /** Monta a cena; pode devolver uma função de limpeza. */
  montar: (cena: Cena) => void | (() => void);
  onToque?: (x: number, y: number, cena: Cena) => void;
  alvo?: [number, number, number];
  distancia?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const tamanho = useRef({ w: 1, h: 1 });
  const cenaRef = useRef<Cena | null>(null);
  const limpar = useRef<(() => void) | void>(undefined);
  const orbita = useRef({ yaw: Math.PI / 4, pitch: 0.62, distancia: distanciaInicial, base: distanciaInicial });
  const cb = useUltimo({ onToque });
  const anterior = useRef({ x: 0, y: 0 });

  const posicionar = () => {
    const c = cenaRef.current;
    if (!c) return;
    const { yaw, pitch, distancia } = orbita.current;
    c.camera.position.set(
      alvo[0] + distancia * Math.cos(pitch) * Math.sin(yaw),
      alvo[1] + distancia * Math.sin(pitch),
      alvo[2] + distancia * Math.cos(pitch) * Math.cos(yaw),
    );
    c.camera.lookAt(alvo[0], alvo[1], alvo[2]);
    c.render();
  };

  function aoCriar(gl: ExpoWebGLRenderingContext) {
    const largura = gl.drawingBufferWidth;
    const altura = gl.drawingBufferHeight;
    // three.js espera um <canvas>; no celular passamos um objeto equivalente
    const canvas = {
      width: largura,
      height: altura,
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
      clientHeight: altura,
      getContext: () => gl,
    } as unknown as HTMLCanvasElement;
    // O contexto do expo-gl implementa WebGL 2, mas no Android ele é instância
    // da classe global `WebGLRenderingContext`; o three.js (r163+) vê isso e
    // recusa como se fosse WebGL 1. Escondemos a classe só durante a criação.
    const global = globalThis as { WebGLRenderingContext?: unknown };
    const classeOriginal = global.WebGLRenderingContext;
    let renderer: THREE.WebGLRenderer;
    try {
      if (Platform.OS !== "web") global.WebGLRenderingContext = undefined;
      renderer = new THREE.WebGLRenderer({
        canvas,
        context: gl as unknown as WebGL2RenderingContext,
        antialias: true,
        alpha: true,
      });
    } finally {
      if (Platform.OS !== "web") global.WebGLRenderingContext = classeOriginal;
    }
    renderer.setPixelRatio(1);
    renderer.setSize(largura, altura, false);
    renderer.setClearColor(0xf7f6fd, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, largura / altura, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xe7e3f6, 1.6));
    const sol = new THREE.DirectionalLight(0xffffff, 1.6);
    sol.position.set(6, 10, 7);
    scene.add(sol);
    const contra = new THREE.DirectionalLight(0xc9b4ff, 0.6);
    contra.position.set(-6, 4, -5);
    scene.add(contra);

    const raycaster = new THREE.Raycaster();
    const cena: Cena = {
      scene,
      camera,
      render() {
        renderer.render(scene, camera);
        (gl as unknown as { endFrameEXP?: () => void }).endFrameEXP?.();
      },
      atingir(x, y, objetos) {
        const { w, h } = tamanho.current;
        raycaster.setFromCamera(new THREE.Vector2((x / w) * 2 - 1, -(y / h) * 2 + 1), camera);
        return raycaster.intersectObjects(objetos, false);
      },
    };
    cenaRef.current = cena;
    limpar.current = montar(cena);
    posicionar();
  }

  useEffect(
    () => () => {
      if (typeof limpar.current === "function") limpar.current();
      cenaRef.current = null;
    },
    [],
  );

  const gesto = useMemo(() => {
    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(6)
      .maxPointers(1)
      .onStart((e) => (anterior.current = { x: e.translationX, y: e.translationY }))
      .onUpdate((e) => {
        const o = orbita.current;
        o.yaw -= (e.translationX - anterior.current.x) * 0.009;
        o.pitch = Math.min(1.35, Math.max(0.08, o.pitch + (e.translationY - anterior.current.y) * 0.007));
        anterior.current = { x: e.translationX, y: e.translationY };
        posicionar();
      });
    const pinca = Gesture.Pinch()
      .runOnJS(true)
      .onStart(() => (orbita.current.base = orbita.current.distancia))
      .onUpdate((e) => {
        orbita.current.distancia = Math.min(18, Math.max(5, orbita.current.base / e.scale));
        posicionar();
      });
    const toque = Gesture.Tap()
      .runOnJS(true)
      .maxDistance(10)
      .onEnd((e, ok) => {
        if (ok && cenaRef.current) cb.current.onToque?.(e.x, e.y, cenaRef.current);
      });
    return Gesture.Race(Gesture.Simultaneous(pan, pinca), toque);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GestureDetector gesture={gesto}>
      <View
        collapsable={false}
        style={[{ flex: 1, overflow: "hidden" }, style]}
        onLayout={(e) => (tamanho.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        <GLView style={{ flex: 1 }} onContextCreate={aoCriar} />
      </View>
    </GestureDetector>
  );
}
