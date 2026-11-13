import Link from "next/link";
import { notFound } from "next/navigation";
import { FormularioAvaliacao } from "@/components/painel/formulario-avaliacao";
import { detalheAvaliacao } from "@/lib/painel/avaliacoes";
import { detalheDoAluno, professorLogado } from "@/lib/painel/dados";
import { ErroApi } from "@/lib/painel/api";

export default async function Avaliar({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; alunoId: string }>;
  searchParams: Promise<{ jogada?: string }>;
}) {
  const { id, alunoId } = await params;
  const professor = await professorLogado();
  const aluno = await detalheDoAluno(professor, alunoId);
  if (!aluno) notFound();
  const detalhe = await detalheAvaliacao(id, alunoId).catch((e) => {
    if (e instanceof ErroApi && e.status === 404) notFound();
    throw e;
  });
  const { jogada } = await searchParams;
  const ultima = jogada ? detalhe.jogadas.find((j) => j.id === jogada) : detalhe.jogadas[0];
  if (jogada && !ultima) notFound();
  const anterior = detalhe.avaliacoes.find((a) => a.jogadaId === ultima?.id);
  const habilidade = ultima?.publicacao ? ultima.publicacao.conteudo.habilidade || null : detalhe.habilidade;
  return (
    <div className="flex flex-col gap-5">
      <Link href={`/professor/atividades/${encodeURIComponent(id)}`} className="text-sm font-semibold text-roxo-escuro">
        ← Voltar à atividade
      </Link>
      <header>
        <h1 className="text-2xl">{aluno.aluno.nome}</h1>
        <p className="text-texto-suave">{detalhe.titulo}</p>
      </header>
      {ultima ? (
        <>
          {detalhe.jogadas.length > 1 ? (
            <nav aria-label="Entregas recebidas" className="flex flex-wrap gap-2">
              {detalhe.jogadas.map((j, i) => (
                <Link
                  key={j.id}
                  href={`?jogada=${encodeURIComponent(j.id)}`}
                  aria-current={j.id === ultima.id ? "page" : undefined}
                  className={`rounded-xl border px-3 py-2 text-sm ${j.id === ultima.id ? "border-roxo bg-suave font-semibold" : "border-borda"}`}
                >
                  Entrega {detalhe.jogadas.length - i} · {j.publicacao ? `publicação ${j.publicacao.numero}` : "legada"}
                </Link>
              ))}
            </nav>
          ) : null}
          <section className="rounded-2xl bg-superficie p-5 sombra-suave">
            <h2 className="text-lg">Entrega selecionada</h2>
            <p className="mt-2 text-sm text-texto-suave">
              {ultima.titulo} ·{" "}
              {ultima.publicacao ? `Publicação ${ultima.publicacao.numero}` : "Entrega legada sem versão registrada"}
            </p>
            <p className="mt-2 text-sm">
              {ultima.percentualAcerto}% de acerto · {ultima.tentativas} tentativas · {ultima.tempoSegundos}s ·{" "}
              {ultima.dicas} dicas
            </p>
            {ultima.fases ? (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr>
                      <th>Fase</th>
                      <th>Questão ou etapa</th>
                      <th>Tentativas</th>
                      <th>Tempo</th>
                      <th>Dica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultima.fases.map((f) => (
                      <tr key={f.ordem} className="border-t border-[#E8E4F2]">
                        <td className="py-3">{f.ordem}</td>
                        <td className="max-w-md py-3">
                          {(() => {
                            const q = ultima.publicacao?.conteudo.questoes[f.ordem - 1];
                            return q?.tipo === "objetiva"
                              ? q.enunciado
                              : q && "comando" in q
                                ? q.comando || "Etapa da atividade"
                                : "Etapa do jogo";
                          })()}
                        </td>
                        <td>{f.tentativas}</td>
                        <td>{f.tempoSegundos}s</td>
                        <td>{f.dica ? "Sim" : "Não"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-texto-suave">Esta entrega antiga não contém medidas por fase.</p>
            )}
          </section>
          <FormularioAvaliacao
            atividadeId={id}
            alunoId={alunoId}
            jogadaId={ultima.id}
            feedback={anterior?.feedback ?? ""}
            percepcao={anterior?.percepcao ?? null}
            habilidade={habilidade}
          />
        </>
      ) : (
        <p>O aluno ainda não concluiu esta atividade.</p>
      )}
      <section className="rounded-2xl bg-superficie p-5 sombra-suave">
        <h2 className="text-lg">Histórico de avaliações</h2>
        {detalhe.avaliacoes.length ? (
          <ul className="mt-3 flex flex-col gap-4">
            {detalhe.avaliacoes.map((a) => (
              <li key={a.id} className="border-t border-[#E8E4F2] pt-3">
                <p className="text-xs text-texto-suave">
                  {a.publicada ? "Publicada" : "Rascunho privado"} ·{" "}
                  {new Date(a.criadaEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{a.feedback || "Sem texto"}</p>
                {a.percepcao ? <p className="mt-1 text-sm">Habilidade: {a.percepcao}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-texto-suave">Nenhuma avaliação registrada.</p>
        )}
      </section>
    </div>
  );
}
