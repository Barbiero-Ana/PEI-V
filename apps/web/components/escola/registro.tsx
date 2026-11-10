import { NOME_DO_PAPEL } from "@/lib/escola/api";
import { ACOES, GRUPOS_DE_ACAO, type Registro } from "@/lib/escola/tipos";
import type { PapelEquipe } from "@/lib/painel/sessao";

const COR_DO_GRUPO: Record<string, string> = {
  login: "bg-azul",
  usuario: "bg-roxo",
  turma: "bg-lilas",
  aluno: "bg-pessego",
  atividade: "bg-azul-escuro",
  plano: "bg-azul-escuro",
  senha: "bg-roxo",
  materia: "bg-roxo",
};

const diaChave = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", dateStyle: "short" });
const dataCompleta = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "long" });
const hora = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", timeStyle: "short" });

/** Lista do registro de atividades: quem, o quê, sobre quem e quando. */
export function ListaRegistros({ registros, vazio }: { registros: Registro[]; vazio?: string }) {
  if (registros.length === 0)
    return <p className="px-5 py-6 text-sm text-texto-suave">{vazio ?? "Nenhum registro ainda."}</p>;
  const dias = Map.groupBy(registros, (r) => diaChave.format(new Date(r.criadoEm)));
  return (
    <div>
      {[...dias].map(([dia, eventos]) => (
        <section key={dia}>
          <h3 className="border-y border-borda bg-suave/70 px-5 py-2.5 text-sm font-semibold text-tinta">
            {dataCompleta.format(new Date(eventos[0]!.criadoEm))}
          </h3>
          <ol className="divide-y divide-borda">
            {eventos.map((r) => {
              const grupo = r.acao.split(".")[0]!;
              const falhou = r.acao === "login.falhou";
              return (
                <li key={r.id} className="flex items-start gap-3 px-5 py-4">
                  <span
                    aria-hidden
                    className={`mt-1.5 size-2.5 shrink-0 rounded-full ${falhou ? "bg-alerta" : (COR_DO_GRUPO[grupo] ?? "bg-texto-fraco")}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-tinta">{ACOES[r.acao] ?? r.acao}</p>
                    <p className="mt-0.5 text-sm text-texto-suave">
                      {r.usuarioNome ?? "Sistema"}{" "}
                      {r.papel ? <span>· {NOME_DO_PAPEL[r.papel as PapelEquipe] ?? r.papel}</span> : null}
                    </p>
                    {r.detalhe ? <p className="mt-1 break-words text-sm text-texto">{r.detalhe}</p> : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <time dateTime={r.criadoEm} className="tnum text-xs text-texto-suave">
                      {hora.format(new Date(r.criadoEm))}
                    </time>
                    <span className="hidden rounded-full bg-suave px-2 py-0.5 text-xs text-texto-suave sm:inline">
                      {GRUPOS_DE_ACAO.find((g) => g.valor === grupo)?.rotulo ?? grupo}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
