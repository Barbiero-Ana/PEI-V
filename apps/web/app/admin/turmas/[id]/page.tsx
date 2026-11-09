import Link from "next/link";
import { notFound } from "next/navigation";
import { formatarCodigoAcesso } from "@modolume/core";
import { Cabecalho, Painel } from "@/components/painel/blocos";
import { quando } from "@/components/escola/estrutura";
import { Campo, Escolha, FormularioAcao } from "@/components/escola/formulario";
import { apiDaEquipe } from "@/lib/escola/api";
import { OPCOES_PERIODO, type AlunoAdmin, type TurmaAdmin } from "@/lib/escola/tipos";
import { alternarAluno, alternarTurma, criarAluno, editarAluno, editarTurma } from "../../acoes";

export default async function TurmaAdmin({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [turmas, alunos] = await Promise.all([
    apiDaEquipe<TurmaAdmin[]>("/admin/turmas"),
    apiDaEquipe<AlunoAdmin[]>(`/admin/alunos?turmaId=${encodeURIComponent(id)}`),
  ]);
  const t = turmas.find((x) => x.id === id);
  if (!t) notFound();
  const opcoesTurma = turmas.filter((x) => x.ativa || x.id === id).map((x) => ({ valor: x.id, rotulo: x.nome }));

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/turmas" className="w-fit text-sm font-semibold text-roxo-escuro">
        ← Turmas e alunos
      </Link>
      <Cabecalho
        titulo={t.nome}
        descricao={`${t.serie} · ${t.periodo} · ${t.anoLetivo} · ${t.ativa ? "ativa" : "encerrada"} · professores: ${
          t.professores.map((p) => p.nome).join(", ") || "nenhum (a coordenação vincula)"
        }`}
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Painel titulo="Dados da turma">
          <FormularioAcao acao={editarTurma.bind(null, t.id)} botao="Salvar turma">
            <div className="grid gap-4 md:grid-cols-2">
              <Campo nome="nome" rotulo="Nome" valor={t.nome} />
              <Campo nome="serie" rotulo="Série" valor={t.serie} />
              <Escolha nome="periodo" rotulo="Período" opcoes={OPCOES_PERIODO} valor={t.periodo} />
              <Campo nome="anoLetivo" rotulo="Ano letivo" tipo="number" valor={t.anoLetivo} />
            </div>
          </FormularioAcao>
          <div className="mt-6 border-t border-borda pt-5">
            <p className="text-sm text-texto-suave">
              {t.ativa
                ? "Encerrar tira a turma do painel dos professores. O histórico dos alunos continua guardado."
                : "Reabrir devolve a turma ao painel dos professores vinculados."}
            </p>
            <FormularioAcao
              acao={alternarTurma.bind(null, t.id, !t.ativa)}
              botao={t.ativa ? "Encerrar turma" : "Reabrir turma"}
              variante={t.ativa ? "perigo" : "primario"}
              confirmar={t.ativa ? `Encerrar a turma ${t.nome}?` : undefined}
              className="mt-3"
            />
          </div>
        </Painel>

        <Painel
          titulo="Cadastrar aluno"
          descricao="O aluno recebe um código pessoal e cria o PIN no primeiro acesso ao app."
        >
          <FormularioAcao acao={criarAluno} botao="Cadastrar aluno">
            <input type="hidden" name="turmaId" value={t.id} />
            <Campo nome="nome" rotulo="Nome do aluno" />
            <Campo nome="matricula" rotulo="Matrícula" />
          </FormularioAcao>
        </Painel>
      </div>

      <Painel titulo={`Alunos (${alunos.filter((a) => a.ativo).length})`} semRecuo>
        {alunos.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-texto-suave">Nenhum aluno cadastrado nesta turma.</p>
        ) : (
          <ul className="divide-y divide-[#E6E2F3]">
            {alunos.map((a) => (
              <li key={a.id} className={`px-5 py-3 ${a.ativo ? "" : "opacity-60"}`}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-1 [&::-webkit-details-marker]:hidden">
                    <span className="min-w-[180px] flex-1 font-semibold text-tinta">
                      {a.nome}
                      <span className="block text-xs font-normal text-texto-suave">Matrícula {a.matricula}</span>
                    </span>
                    <span className="font-mono text-sm font-semibold tracking-wider text-tinta">
                      {formatarCodigoAcesso(a.codigoAcesso)}
                    </span>
                    <span className="w-36 text-sm text-texto-suave">
                      {a.pinCriado ? "PIN criado" : "Sem PIN ainda"}
                    </span>
                    <span className="tnum w-28 text-sm text-texto-suave">{quando(a.ultimoAcesso)}</span>
                    <span className="text-sm font-semibold text-roxo-escuro group-open:hidden">Editar</span>
                    <span className="hidden text-sm font-semibold text-roxo-escuro group-open:inline">Fechar</span>
                  </summary>
                  <div className="mt-4 grid gap-6 rounded-xl bg-suave/60 p-4 md:grid-cols-[1.5fr_1fr]">
                    <FormularioAcao acao={editarAluno.bind(null, a.id, t.id)} botao="Salvar aluno">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <Campo nome="nome" rotulo="Nome" valor={a.nome} />
                        <Campo nome="matricula" rotulo="Matrícula" valor={a.matricula} />
                        <Escolha nome="turmaId" rotulo="Turma" opcoes={opcoesTurma} valor={t.id} />
                      </div>
                    </FormularioAcao>
                    <div>
                      <p className="text-sm text-texto-suave">
                        {a.ativo
                          ? "Desativar tira o aluno do app na hora. O histórico dele continua."
                          : "Reativar devolve o acesso ao app com o mesmo código."}
                      </p>
                      <FormularioAcao
                        acao={alternarAluno.bind(null, a.id, t.id, !a.ativo)}
                        botao={a.ativo ? "Desativar aluno" : "Reativar aluno"}
                        variante={a.ativo ? "perigo" : "primario"}
                        confirmar={a.ativo ? `Desativar ${a.nome}?` : undefined}
                        className="mt-3"
                      />
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Painel>
    </div>
  );
}
