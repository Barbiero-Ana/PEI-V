import Link from "next/link";
import { NOME_SEGMENTO, SEGMENTOS } from "@modolume/core";
import { Cabecalho, Painel, TABELA } from "@/components/painel/blocos";
import { Escolha, FormularioAcao } from "@/components/escola/formulario";
import { CamposDaTurma } from "@/components/escola/cadastros";
import { apiDaEquipe } from "@/lib/escola/api";
import type { TurmaAdmin } from "@/lib/escola/tipos";
import { criarTurma } from "../acoes";

export default async function TurmasAdmin({
  searchParams,
}: {
  searchParams: Promise<{ segmento?: string; ano?: string; situacao?: string }>;
}) {
  const { segmento, ano: filtroAno, situacao } = await searchParams;
  const turmas = await apiDaEquipe<TurmaAdmin[]>("/admin/turmas");
  const filtradas = turmas.filter(
    (t) =>
      (!segmento || (t.segmento ?? "pendente") === segmento) &&
      (!filtroAno || String(t.anoLetivo) === filtroAno) &&
      (!situacao || t.ativa === (situacao === "ativa")),
  );
  const ano = new Date().getFullYear();
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Turmas e alunos"
        descricao="Organize as turmas por segmento, série e ano letivo. A coordenação gerencia os vínculos do seu segmento."
      />

      <Painel titulo="Criar turma">
        <FormularioAcao acao={criarTurma} botao="Criar turma">
          <CamposDaTurma ano={ano} />
        </FormularioAcao>
      </Painel>

      <Painel titulo={`Turmas (${filtradas.length})`} semRecuo>
        <form method="get" className="grid items-end gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <Escolha
            nome="segmento"
            rotulo="Segmento da lista"
            valor={segmento}
            opcoes={[
              { valor: "", rotulo: "Todos" },
              ...SEGMENTOS.map((s) => ({ valor: s, rotulo: NOME_SEGMENTO[s] })),
              { valor: "pendente", rotulo: "A classificar" },
            ]}
          />
          <Escolha
            nome="ano"
            rotulo="Ano letivo da lista"
            valor={filtroAno}
            opcoes={[
              { valor: "", rotulo: "Todos" },
              ...[...new Set(turmas.map((t) => t.anoLetivo))].map((a) => ({ valor: String(a), rotulo: String(a) })),
            ]}
          />
          <Escolha
            nome="situacao"
            rotulo="Situação"
            valor={situacao}
            opcoes={[
              { valor: "", rotulo: "Todas" },
              { valor: "ativa", rotulo: "Ativas" },
              { valor: "encerrada", rotulo: "Encerradas" },
            ]}
          />
          <div className="flex items-center gap-3">
            <button className="min-h-11 rounded-xl bg-roxo px-4 font-semibold text-white">Filtrar</button>
            <Link href="/admin/turmas" className="text-sm text-roxo-escuro">
              Limpar
            </Link>
          </div>
        </form>
        {filtradas.length === 0 ? (
          <p className="p-5 text-sm text-texto-suave">Nenhuma turma com esses filtros.</p>
        ) : null}
        <div className="overflow-x-auto">
          <table className={TABELA.tabela}>
            <thead className={TABELA.cabeca}>
              <tr>
                <th className={TABELA.th}>Turma</th>
                <th className={TABELA.th}>Ano</th>
                <th className={TABELA.th}>Alunos</th>
                <th className={TABELA.th}>Professores</th>
                <th className={TABELA.th}>Situação</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((t) => (
                <tr key={t.id} className={`${TABELA.linha} ${t.ativa ? "" : "opacity-60"}`}>
                  <td className={TABELA.td}>
                    <Link href={`/admin/turmas/${t.id}`} className="font-semibold text-tinta hover:text-roxo-escuro">
                      {t.nome}
                      <span className="block text-xs font-normal text-texto-suave">
                        {t.segmento ? NOME_SEGMENTO[t.segmento] : "A classificar"} · {t.serie} · {t.periodo}
                      </span>
                    </Link>
                  </td>
                  <td className={`${TABELA.td} tnum`}>{t.anoLetivo}</td>
                  <td className={`${TABELA.td} tnum`}>{t.alunos}</td>
                  <td className={`${TABELA.td} text-texto-suave`}>
                    {t.professores.map((p) => p.nome).join(", ") || <span className="text-alerta">Sem professor</span>}
                  </td>
                  <td className={TABELA.td}>{t.ativa ? "Ativa" : "Encerrada"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Painel>
    </div>
  );
}
