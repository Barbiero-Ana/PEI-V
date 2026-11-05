import Link from "next/link";
import { Avatar, Cabecalho, Campos, Painel, TABELA } from "@/components/painel/blocos";
import { BarraValor, quando } from "@/components/escola/estrutura";
import { apiDaEquipe } from "@/lib/escola/api";
import type { AlunoCoordenacao } from "@/lib/escola/tipos";

const dataCurta = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");
const minutos = (s: number) => (s < 60 ? `${s} s` : `${Math.round(s / 60)} min`);

/** Dados individuais do aluno para a coordenação: só consulta, sem ações sobre o acesso. */
export default async function AlunoCoordenacao({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await apiDaEquipe<AlunoCoordenacao>(`/coordenacao/alunos/${encodeURIComponent(id)}`);
  return (
    <div className="flex flex-col gap-6">
      <Link href={`/coordenacao/turmas/${a.turma.id}`} className="w-fit text-sm font-semibold text-roxo-escuro">
        ← {a.turma.nome}
      </Link>
      <div className="flex items-center gap-4">
        <Avatar nome={a.nome} tamanho={56} svg={a.avatarSvg} />
        <Cabecalho titulo={a.nome} descricao={`${a.turma.nome} · matrícula ${a.matricula}`} />
      </div>

      <Campos
        colunas={5}
        itens={[
          { rotulo: "Jogadas", valor: a.totais.jogadas },
          { rotulo: "Acerto médio", valor: a.totais.acertoMedio === null ? "—" : `${a.totais.acertoMedio}%` },
          { rotulo: "Conclusão média", valor: a.totais.conclusaoMedia === null ? "—" : `${a.totais.conclusaoMedia}%` },
          { rotulo: "Dicas usadas", valor: a.totais.dicas, detalhe: "não tiram pontos" },
          { rotulo: "Último acesso ao app", valor: quando(a.ultimoAcesso) },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Painel titulo="Acerto por formato" descricao="Em quais formatos o aluno compreende melhor">
          {a.porFormato.length === 0 ? (
            <p className="text-sm text-texto-suave">Ainda sem jogadas.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {a.porFormato.map((f) => (
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
          <div className="mt-6 rounded-xl bg-suave/70 px-4 py-3 text-sm text-texto">
            <p className="font-semibold text-tinta">Acesso ao app</p>
            <p className="mt-0.5">
              Código{" "}
              <span className="font-mono font-semibold tracking-wider">
                {a.codigoAcesso.slice(0, 4)}-{a.codigoAcesso.slice(4)}
              </span>{" "}
              · {a.pinCriado ? "PIN criado" : "aguardando o primeiro acesso"}
            </p>
            <p className="mt-1 text-xs text-texto-suave">
              Para zerar o PIN ou trocar o código, fale com o professor da turma.
            </p>
          </div>
        </Painel>

        <Painel titulo="Jogadas recentes" semRecuo>
          {a.recentes.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-texto-suave">Ainda sem jogadas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={TABELA.tabela}>
                <thead className={TABELA.cabeca}>
                  <tr>
                    <th className={TABELA.th}>Data</th>
                    <th className={TABELA.th}>Atividade</th>
                    <th className={TABELA.th}>Acerto</th>
                    <th className={TABELA.th}>Tentativas</th>
                    <th className={TABELA.th}>Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {a.recentes.map((j) => (
                    <tr key={j.id} className={TABELA.linha}>
                      <td className={`${TABELA.td} tnum text-texto-suave`}>{dataCurta(j.data)}</td>
                      <td className={TABELA.td}>
                        <span className="font-semibold text-tinta">{j.titulo}</span>
                        <span className="block text-xs text-texto-suave">
                          {j.formato}
                          {j.origem === "professor" ? " · atividade do professor" : ""}
                        </span>
                      </td>
                      <td className={`${TABELA.td} tnum font-semibold ${j.acerto < 60 ? "text-alerta" : "text-tinta"}`}>
                        {j.acerto}%
                      </td>
                      <td className={`${TABELA.td} tnum`}>{j.tentativas}</td>
                      <td className={`${TABELA.td} tnum text-texto-suave`}>{minutos(j.tempoSegundos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Painel>
      </div>
    </div>
  );
}
