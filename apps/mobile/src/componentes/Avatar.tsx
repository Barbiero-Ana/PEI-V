import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { DesenhoRosto, type Rosto } from "./Rosto";

/** Avatares geométricos nas cores da marca. */
export const AVATARES = [
  { id: "lume", nome: "Lume", fundo: "#EFEBFF", cor: "#7B61FF" },
  { id: "orbita", nome: "Órbita", fundo: "#EAF7FF", cor: "#2F8FCF" },
  { id: "onda", nome: "Onda", fundo: "#FFF1E7", cor: "#E98A52" },
  { id: "faisca", nome: "Faísca", fundo: "#F5F0FF", cor: "#9B7DFF" },
  { id: "prisma", nome: "Prisma", fundo: "#EAF7FF", cor: "#1E2A78" },
  { id: "nuvem", nome: "Nuvem", fundo: "#FFF1E7", cor: "#FFAC7A" },
] as const;

export type AvatarId = (typeof AVATARES)[number]["id"];

function Forma({ id, cor }: { id: AvatarId; cor: string }) {
  switch (id) {
    case "lume":
      return (
        <G>
          <Path d="M34 70 V56 A16 16 0 0 1 66 56 V70" stroke={cor} strokeWidth={11} fill="none" />
          <Path d="M50 22 V30 M28 32 l5 5 M72 32 l-5 5" stroke="#FFAC7A" strokeWidth={6} strokeLinecap="round" />
        </G>
      );
    case "orbita":
      return (
        <G>
          <Circle cx={50} cy={50} r={13} fill={cor} />
          <G transform="rotate(-25 50 50)">
            <Ellipse cx={50} cy={50} rx={27} ry={11} fill="none" stroke="#8FD3FF" strokeWidth={5} />
          </G>
        </G>
      );
    case "onda":
      return (
        <Path
          d="M24 46 q6.5 -10 13 0 t13 0 t13 0 t13 0 M24 60 q6.5 -10 13 0 t13 0 t13 0 t13 0"
          stroke={cor}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
      );
    case "faisca":
      return (
        <G>
          <Path d="M50 22 Q53 47 78 50 Q53 53 50 78 Q47 53 22 50 Q47 47 50 22 Z" fill={cor} />
          <Circle cx={72} cy={28} r={5} fill="#FFAC7A" />
        </G>
      );
    case "prisma":
      return (
        <G>
          <Path d="M50 24 L74 66 H26 Z" fill={cor} stroke={cor} strokeWidth={4} strokeLinejoin="round" />
          <Path d="M50 40 L62 62 H38 Z" fill="#8FD3FF" />
        </G>
      );
    case "nuvem":
      return (
        <G>
          <Path d="M30 64 a12 12 0 0 1 4 -23 a16 16 0 0 1 30 -2 a12 12 0 0 1 6 25 Z" fill={cor} />
          <Circle cx={42} cy={54} r={2.6} fill="#1E2A78" />
          <Circle cx={56} cy={54} r={2.6} fill="#1E2A78" />
        </G>
      );
  }
}

/** Mostra o rosto montado pelo aluno; sem rosto, um símbolo geométrico. */
export function Avatar({ id, rosto, tamanho = 48 }: { id: AvatarId; rosto?: Rosto; tamanho?: number }) {
  if (rosto) return <DesenhoRosto rosto={rosto} tamanho={tamanho} />;
  const info = AVATARES.find((a) => a.id === id) ?? AVATARES[0];
  return (
    <Svg viewBox="0 0 100 100" width={tamanho} height={tamanho}>
      <Circle cx={50} cy={50} r={50} fill={info.fundo} />
      <Forma id={info.id} cor={info.cor} />
    </Svg>
  );
}
