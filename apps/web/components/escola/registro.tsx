import { NOME_DO_PAPEL } from "@/lib/escola/api";
import { ACOES, type Registro } from "@/lib/escola/tipos";
import type { PapelEquipe } from "@/lib/painel/sessao";
import { quando } from "./estrutura";

const COR_DO_GRUPO: Record<string, string> = {
  login: "bg-azul",
  usuario: "bg-roxo",
  turma: "bg-lilas",
  aluno: "bg-pessego",
  atividade: "bg-azul-escuro",
  plano: "bg-azul-escuro",
  senha: "bg-roxo",
};

/** Lista do registro de atividades: quem, o quê, sobre quem e quando. */
export function ListaRegistros({ registros, vazio }: { registros: Registro[]; vazio?: string }) {
  if (registros.length === 0)
    return <p className="px-5 py-6 text-sm text-texto-suave">{vazio ?? "Nenhum registro ainda."}</p>;
  return (
    <ol className="divide-y divide-[#E6E2F3]">
      {registros.map((r) => {
        const grupo = r.acao.split(".")[0]!;
        const falhou = r.acao === "login.falhou";
        return (
          <li key={r.id} className="flex flex-wrap items-start gap-x-4 gap-y-1 px-5 py-3">
            <span
              aria-hidden
              className={`mt-1.5 size-2.5 shrink-0 rounded-full ${falhou ? "bg-alerta" : (COR_DO_GRUPO[grupo] ?? "bg-texto-fraco")}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-tinta">
                <span className="font-semibold">{r.usuarioNome ?? "Sistema"}</span>{" "}
                {r.papel ? (
                  <span className="text-texto-suave">({NOME_DO_PAPEL[r.papel as PapelEquipe] ?? r.papel})</span>
                ) : null}{" "}
                · {ACOES[r.acao] ?? r.acao}
              </p>
              {r.detalhe ? <p className="text-sm text-texto-suave">{r.detalhe}</p> : null}
            </div>
            <time dateTime={r.criadoEm} className="tnum shrink-0 text-xs text-texto-suave">
              {quando(r.criadoEm)}
            </time>
          </li>
        );
      })}
    </ol>
  );
}
