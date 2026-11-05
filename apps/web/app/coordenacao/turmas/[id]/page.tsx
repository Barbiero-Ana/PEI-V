import Link from "next/link";
import { Avatar, Cabecalho, Campos, Painel } from "@/components/painel/blocos";
import { BarraValor } from "@/components/escola/estrutura";
import { VinculosDaTurma } from "@/components/escola/vinculos";
import { apiDaEquipe } from "@/lib/escola/api";
import type { DetalheTurmaCoordenacao, VisaoCoordenacao } from "@/lib/escola/tipos";

const dataCurta = (iso: string | null) => (iso ? iso.split("-").reverse().slice(0, 2).join("/") : "—");

export default async function TurmaCoordenacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [t, v] = await Promise.all([
    apiDaEquipe<DetalheTurmaCoordenacao>(`/coordenacao/turmas/${encodeURIComponent(id)}`),
    apiDaEquipe<VisaoCoordenacao>("/coordenacao/visao"),
  ]);
  const disponiveis = v.professores.filter((p) => !t.professores.some((x) => x.id === p.id));
  const maiorSemana = Math.max(1, ...t.semanas.map((s) => s.acertoMedio ?? 0));
  const atencao = t.alunos.filter((a) => a.atencao).length;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/coordenacao/turmas" className="w-fit text-sm font-semibold text-roxo-escuro">
        ← Turmas
      </Link>
      <Cabecalho
        titulo={t.nome}
        descricao={`${t.serie} · ${t.periodo} · ${t.anoLetivo} · últimos ${t.janelaDias} dias`}
      />

      <Campos
        colunas={4}
        itens={[
          { rotulo: "Acerto médio", valor: t.acertoMedio === null ? "—" : `${t.acertoMedio}%` },
          { rotulo: "Conclusão média", valor: t.conclusaoMedia === null ? "—" : `${t.conclusaoMedia}%` },
          { rotulo: "Alunos", valor: t.alunos.length },
          { rotulo: "Pedem atenção", valor: atencao, detalhe: "acerto abaixo de 60%" },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Painel titulo="Evolução semanal" descricao="Acerto médio da turma em cada semana (6 semanas)">
          <div
            className="flex h-44 items-end gap-3"
            role="img"
            aria-label={`Acerto médio por semana: ${t.semanas.map((s) => (s.acertoMedio === null ? "sem dados" : `${s.acertoMedio}%`)).join(", ")}`}
          >
            {t.semanas.map((s, i) => (
              <div key={s.inicio} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="tnum text-xs font-semibold text-tinta">
                  {s.acertoMedio === null ? "—" : `${s.acertoMedio}%`}
                </span>
                <div className="flex h-32 w-full items-end rounded-lg bg-suave/70">
                  <div
                    className={`w-full rounded-lg ${i === t.semanas.length - 1 ? "bg-roxo" : "bg-lilas"}`}
                    style={{ height: `${((s.acertoMedio ?? 0) / maiorSemana) * 100}%` }}
                  />
                </div>
                <span className="text-[0.7rem] text-texto-suave">{dataCurta(s.inicio)}</span>
              </div>
            ))}
          </div>
        </Painel>
        <Painel titulo="Acerto por formato">
          {t.porFormato.length === 0 ? (
            <p className="text-sm text-texto-suave">Sem jogadas no período.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {t.porFormato.map((f) => (
                <li key={f.formato} className="grid grid-cols-[150px_1fr] items-center gap-3">
                  <span className="text-sm text-tinta">
                    {f.rotulo}
                    <span className="block text-xs text-texto-suave">{f.amostra} jogadas</span>
                  </span>
                  <BarraValor valor={f.acertoMedio} />
                </li>
              ))}
            </ul>
          )}
        </Painel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Painel titulo="Alunos" descricao="Dados individuais, só para consulta" semRecuo>
          <ul className="divide-y divide-[#E6E2F3]">
            {t.alunos.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/coordenacao/alunos/${a.id}`}
                  className="grid items-center gap-3 px-5 py-3 transition-colors hover:bg-suave/60 sm:grid-cols-[1fr_170px_90px]"
                >
                  <span className="flex items-center gap-3">
                    <Avatar nome={a.nome} tamanho={34} svg={a.avatarSvg ?? undefined} />
                    <span>
                      <span className="block font-semibold text-tinta">{a.nome}</span>
                      <span className="block text-xs text-texto-suave">
                        {a.jogadas} jogadas · última {dataCurta(a.ultimaJogada)}
                        {a.atencao ? <span className="font-semibold text-alerta"> · pede atenção</span> : null}
                      </span>
                    </span>
                  </span>
                  <BarraValor valor={a.acertoMedio} />
                  <span className="text-right text-sm font-semibold text-roxo-escuro">Ver</span>
                </Link>
              </li>
            ))}
          </ul>
        </Painel>
        <Painel titulo="Professores da turma">
          <VinculosDaTurma turmaId={t.id} turmaNome={t.nome} professores={t.professores} disponiveis={disponiveis} />
        </Painel>
      </div>
    </div>
  );
}
