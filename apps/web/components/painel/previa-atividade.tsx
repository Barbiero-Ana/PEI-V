import type { Questao } from "@/lib/painel/atividades";

/**
 * Prévia de como o aluno vê a questão no app (moldura de celular). É só uma
 * imagem do que vai chegar: no app, a questão é interativa. Sem hooks, para
 * servir tanto ao editor quanto à página da atividade.
 */

/** Embaralha de um jeito fixo (gira a lista), para a prévia não mudar a cada renderização. */
const girar = <T,>(lista: T[]) => (lista.length > 1 ? [...lista.slice(1), lista[0]!] : lista);

function Lacunas({ texto }: { texto: string }) {
  const partes = texto.split(/(\[[^\]]*\])/g);
  return (
    <p className="text-[0.95rem] leading-loose text-tinta">
      {partes.map((p, i) =>
        p.startsWith("[") ? (
          <span
            key={i}
            className="mx-1 inline-block min-w-14 rounded-lg border-2 border-dashed border-lilas px-2 text-center text-transparent"
          >
            {p.slice(1, -1) || "?"}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  );
}

export function PreviaQuestao({
  questao,
  pronta,
}: {
  questao?: Questao;
  /** Para atividade pronta do app: título e conteúdo da atividade. */
  pronta?: { titulo: string; conteudo: string; instrucao: string } | null;
}) {
  if (pronta)
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-roxo-claro font-display text-2xl font-semibold text-roxo-escuro">
          {pronta.titulo.charAt(0)}
        </span>
        <p className="font-display text-lg font-semibold text-tinta">{pronta.titulo}</p>
        <p className="text-sm text-texto">{pronta.instrucao}</p>
        <p className="rounded-full bg-[#F3F1FA] px-3 py-1 text-xs text-texto-suave">
          Atividade interativa · {pronta.conteudo}
        </p>
      </div>
    );
  if (!questao)
    return <p className="py-10 text-center text-sm text-texto-suave">Adicione uma questão para ver a prévia.</p>;

  // comando próprio da questão (objetiva usa o enunciado)
  const comando =
    questao.tipo !== "objetiva" && questao.comando ? (
      <p className="mb-3 text-[0.95rem] leading-relaxed font-semibold text-tinta">{questao.comando}</p>
    ) : null;

  switch (questao.tipo) {
    case "objetiva":
      return (
        <div className="flex flex-col gap-3">
          <p className="text-[0.95rem] leading-relaxed font-semibold text-tinta">
            {questao.enunciado || "Enunciado da questão"}
          </p>
          {questao.alternativas.map((a, i) => (
            <span key={i} className="rounded-xl border-2 border-[#E2DEF0] px-3 py-2.5 text-sm text-tinta">
              <span className="mr-2 font-semibold text-roxo-escuro">{String.fromCharCode(97 + i)})</span>
              {a || "…"}
            </span>
          ))}
        </div>
      );
    case "completar":
      return (
        <>
          {comando}
          <Lacunas texto={questao.texto || "Escreva a frase com a resposta entre [colchetes]."} />
        </>
      );
    case "associacao-visual":
      return (
        <>
          {comando}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            {questao.pares.map((p, i) => (
              <span
                key={`a${i}`}
                className="col-start-1 rounded-xl bg-roxo-claro px-3 py-2.5 text-center text-sm font-semibold text-roxo-escuro"
              >
                {p.a || "…"}
              </span>
            ))}
            {girar(questao.pares).map((p, i) => (
              <span
                key={`b${i}`}
                className="col-start-2 rounded-xl border-2 border-[#E2DEF0] px-3 py-2.5 text-center text-sm font-semibold text-tinta"
                style={{ gridRowStart: i + 1 }}
              >
                {p.b || "…"}
              </span>
            ))}
          </div>
        </>
      );
    case "sequencia":
      return (
        <div className="flex flex-col gap-2">
          {comando}
          <p className="text-xs text-texto-suave">Arraste para colocar em ordem</p>
          {girar(questao.itens).map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-3 rounded-xl border-2 border-[#E2DEF0] px-3 py-2.5 text-sm font-semibold text-tinta"
            >
              <span className="text-texto-fraco" aria-hidden>
                ⋮⋮
              </span>
              {item || "…"}
            </span>
          ))}
        </div>
      );
  }
}

/** Moldura de celular com o título da atividade e a questão. */
export function CelularPrevia({
  titulo,
  instrucao,
  numero,
  total,
  children,
}: {
  titulo: string;
  instrucao: string;
  numero: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[300px] rounded-[34px] border-[6px] border-tinta bg-[#FBFAFF] p-4 shadow-[0_20px_40px_-28px_rgb(30_42_120/0.6)]">
      <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-tinta/15" aria-hidden />
      <p className="truncate font-display text-sm font-semibold text-tinta">{titulo || "Título da atividade"}</p>
      {total > 0 ? (
        <div className="mt-2 flex gap-1" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < numero ? "bg-roxo" : "bg-[#E6E3F2]"}`} />
          ))}
        </div>
      ) : null}
      {instrucao ? <p className="mt-3 text-xs text-texto">{instrucao}</p> : null}
      <div className="mt-4 min-h-56">{children}</div>
      <span className="mt-4 block rounded-full bg-roxo py-2.5 text-center text-sm font-semibold text-white">
        Confirmar
      </span>
    </div>
  );
}
