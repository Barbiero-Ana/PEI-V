import Link from "next/link";
import { Cabecalho, Painel, TABELA } from "@/components/painel/blocos";
import { Campo, Escolha, FormularioAcao } from "@/components/escola/formulario";
import { apiDaEquipe } from "@/lib/escola/api";
import { OPCOES_PERIODO, type TurmaAdmin } from "@/lib/escola/tipos";
import { criarTurma } from "../acoes";

export default async function TurmasAdmin() {
  const turmas = await apiDaEquipe<TurmaAdmin[]>("/admin/turmas");
  const ano = new Date().getFullYear();
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Turmas e alunos"
        descricao="Crie as turmas do ano letivo e cadastre os alunos. Quem vincula os professores às turmas é a coordenação."
      />

      <Painel titulo="Criar turma">
        <FormularioAcao acao={criarTurma} botao="Criar turma">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Campo nome="nome" rotulo="Nome" dica="Ex.: 6º Ano C" />
            <Campo nome="serie" rotulo="Série" dica="Ex.: 6º ano" />
            <Escolha nome="periodo" rotulo="Período" opcoes={OPCOES_PERIODO} />
            <Campo nome="anoLetivo" rotulo="Ano letivo" tipo="number" valor={ano} />
          </div>
        </FormularioAcao>
      </Painel>

      <Painel titulo="Turmas" semRecuo>
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
              {turmas.map((t) => (
                <tr key={t.id} className={`${TABELA.linha} ${t.ativa ? "" : "opacity-60"}`}>
                  <td className={TABELA.td}>
                    <Link href={`/admin/turmas/${t.id}`} className="font-semibold text-tinta hover:text-roxo-escuro">
                      {t.nome}
                      <span className="block text-xs font-normal text-texto-suave">
                        {t.serie} · {t.periodo}
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
