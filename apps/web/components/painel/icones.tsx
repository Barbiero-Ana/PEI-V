import type { FormatoId } from "@modolume/core";

/** Ícones de linha do painel (SVG próprio, sem emojis). Herdam a cor do texto. */

type P = { tamanho?: number; className?: string };

const base = (tamanho: number, className: string | undefined, children: React.ReactNode) => (
  <svg
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.9}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
);

export const IconeVisao = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>,
  );

export const IconeTurmas = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.5 14c2.4.2 4 1.7 4.5 4.5" />
    </>,
  );

export const IconeDesempenho = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <path d="M4 20h16" />
      <rect x="5.5" y="12" width="3" height="5.5" rx="1" />
      <rect x="10.5" y="8" width="3" height="9.5" rx="1" />
      <rect x="15.5" y="4.5" width="3" height="13" rx="1" />
    </>,
  );

export const IconeHabilidades = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <path d="M12 3l8.5 6.2-3.2 10H6.7L3.5 9.2z" />
      <path d="M12 8l3.8 2.8-1.4 4.4H9.6l-1.4-4.4z" />
    </>,
  );

export const IconeEquipe = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <circle cx="17" cy="9.5" r="2.5" />
      <path d="M16 14.2c2.4.1 4 1.6 4.5 4.3" />
    </>,
  );

export const IconeEscudo = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.6-7 9-4.1-1.4-7-4.7-7-9V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>,
  );

export const IconeRegistro = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2.5" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </>,
  );

export const IconeVinculo = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>,
  );

export const IconeSair = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h10" />
    </>,
  );

export const IconeSeta = ({ tamanho = 16, className }: P) => base(tamanho, className, <path d="M9 6l6 6-6 6" />);

export const IconeVoltar = ({ tamanho = 16, className }: P) => base(tamanho, className, <path d="M15 6l-6 6 6 6" />);

export const IconeAlerta = ({ tamanho = 20, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4" />
      <path d="M12 17.2v.1" />
    </>,
  );

export const IconeCalendario = ({ tamanho = 18, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>,
  );

export const IconeAluno = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>,
  );

export const IconePlano = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <path d="M7 3.5h7.5L19 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z" />
      <path d="M14 3.5V8h5M9 12.5h6M9 16h4" />
    </>,
  );

export const IconeMais = ({ tamanho = 18, className }: P) => base(tamanho, className, <path d="M12 5v14M5 12h14" />);

export const IconeBusca = ({ tamanho = 18, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.2-4.2" />
    </>,
  );

export const IconeInfo = ({ tamanho = 18, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 7.8v.1" />
    </>,
  );

export const IconeOrdenar = ({ tamanho = 18, className }: P) =>
  base(tamanho, className, <path d="M4 7h10M4 12h7M4 17h4M17 5v14M14 16l3 3 3-3" />);

export const IconeAtividade = ({ tamanho = 22, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 9.5l1.6 1.6L12.5 8M8 15.5h8" />
    </>,
  );

export const IconeSino = ({ tamanho = 20, className }: P) =>
  base(
    tamanho,
    className,
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z" />
      <path d="M10 20.5a2.2 2.2 0 0 0 4 0" />
    </>,
  );

/** Ícone de cada formato de atividade. */
export function IconeFormato({ formato, tamanho = 20, className }: P & { formato: FormatoId }) {
  switch (formato) {
    case "associacao-visual":
      return base(
        tamanho,
        className,
        <>
          <circle cx="6" cy="7" r="2.5" />
          <rect x="15" y="14.5" width="5" height="5" rx="1.2" />
          <path d="M8 8.5l8 6.5" />
        </>,
      );
    case "montagem":
      return base(
        tamanho,
        className,
        <>
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
          <rect x="8.5" y="4" width="7" height="7" rx="1.5" />
        </>,
      );
    case "sequencia":
      return base(
        tamanho,
        className,
        <>
          <path d="M4 19h16" />
          <rect x="5" y="13" width="3" height="4" rx="1" />
          <rect x="10.5" y="9" width="3" height="8" rx="1" />
          <rect x="16" y="5" width="3" height="12" rx="1" />
        </>,
      );
    case "completar":
      return base(
        tamanho,
        className,
        <>
          <rect x="3.5" y="9" width="17" height="6.5" rx="1.5" />
          <path d="M8 12.2h3" />
          <path d="M14 12.2h.1" strokeWidth={2.6} />
        </>,
      );
    case "manipulacao":
      return base(
        tamanho,
        className,
        <>
          <path d="M12 3v18M3 12h18" />
          <path d="M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3" />
        </>,
      );
    case "exploracao-3d":
      return base(
        tamanho,
        className,
        <>
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
          <path d="M4 7.5l8 4.5 8-4.5M12 12v9" />
        </>,
      );
    default:
      return base(
        tamanho,
        className,
        <>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M8 12l3 3 5-6" />
        </>,
      );
  }
}
