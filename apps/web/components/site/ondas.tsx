/**
 * Ondas e formas orgânicas da identidade visual (quadro "Identidade visual
 * Modolume"): faixas fluidas em degradê roxo → lilás → azul claro e manchas
 * lilás → pêssego. Ficam sempre ao fundo, suaves, sem disputar com o texto.
 * Cada uso recebe um `id` próprio para os degradês não colidirem na página.
 */

type P = { id: string; className?: string };

/** Fundo da abertura: onda grande no alto, à direita, e mancha orgânica à esquerda. */
export function OndasAbertura({ id, className = "" }: P) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMin slice"
      className={`pointer-events-none absolute inset-x-0 top-0 h-[900px] w-full ${className}`}
    >
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C9B4FF" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#E9DDFF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFD3B8" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7B61FF" stopOpacity="0.28" />
          <stop offset="1" stopColor="#8FD3FF" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id={`${id}-c`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8FD3FF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#C9B4FF" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      {/* onda principal, no alto à direita */}
      <path
        d="M620 0h820v430c-90 70-210 92-330 52-120-40-170-140-290-170C690 284 600 220 600 140 600 80 610 30 620 0z"
        fill={`url(#${id}-a)`}
      />
      {/* faixa roxo → azul, fina, por cima da onda */}
      <path
        d="M760 0c40 90 120 150 230 170 140 26 250 -10 450 70v-60c-190-70-300-40-430-62C900 100 840 56 820 0z"
        fill={`url(#${id}-b)`}
      />
      {/* mancha orgânica à esquerda */}
      <path d="M0 520c80-50 190-40 250 30 64 74 40 190-40 236-70 40-150 30-210-10z" fill={`url(#${id}-c)`} />
    </svg>
  );
}

/** Divisor de seção em forma de onda, preenchido com a cor da seção seguinte. */
export function OndaDivisor({ id, cor, invertida = false, className = "" }: P & { cor: string; invertida?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      className={`pointer-events-none block h-16 w-full sm:h-24 ${invertida ? "rotate-180" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7B61FF" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#C9B4FF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#8FD3FF" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* fio em degradê acompanhando a onda */}
      <path
        d="M0 70c180-50 360-50 540 0s360 50 540 0 270-40 360-20"
        fill="none"
        stroke={`url(#${id}-l)`}
        strokeWidth="3"
      />
      <path d="M0 84c180-50 360-50 540 0s360 50 540 0 270-40 360-20V120H0z" fill={cor} />
    </svg>
  );
}

/** Fundo de faixa escura ou roxa: ondas sobrepostas em degradê roxo → azul. */
export function OndasFaixa({ id, className = "" }: P) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 500"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        <linearGradient id={`${id}-1`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9B85FF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8FD3FF" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`${id}-2`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9B4FF" stopOpacity="0.45" />
          <stop offset="1" stopColor="#FFAC7A" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path d="M0 360c160-80 330-90 500-30s320 70 470 0c90-42 160-60 230-56V500H0z" fill={`url(#${id}-1)`} />
      <path d="M560 500c60-110 190-170 340-150 130 18 220 80 300 60V500z" fill={`url(#${id}-2)`} />
      <path d="M820 0c20 70 90 120 190 130 80 8 140-14 190-50V0z" fill={`url(#${id}-1)`} opacity="0.6" />
    </svg>
  );
}
