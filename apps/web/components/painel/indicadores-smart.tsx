import Link from "next/link";
import type { IndicadorSmart, PainelSmart, StatusMeta } from "@modolume/core";
import { dataCurta, decimal, pct } from "./blocos";
import { IconeAlerta, IconeMais } from "./icones";

/**
 * Metas da turma em formato SMART. Cada linha mostra o valor, a meta e a
 * situação por escrito (nunca só pela cor); "Como é medido" abre a definição
 * completa, para o professor entender o número sem sair da tela.
 */

const SITUACAO: Record<StatusMeta, { rotulo: string; classe: string }> = {
  atingida: { rotulo: "Meta atingida", classe: "bg-roxo-claro text-roxo-escuro" },
  perto: { rotulo: "Perto da meta", classe: "bg-azul-claro text-[#1F6E9F]" },
  abaixo: { rotulo: "Abaixo da meta", classe: "bg-pessego-claro text-alerta" },
  "sem-dados": { rotulo: "Sem dados", classe: "bg-[#F1EFF8] text-texto-suave" },
};

const formatar = (i: IndicadorSmart, v: number) => (i.meta.unidade === "%" ? pct(v) : decimal(v));

const textoMeta = (i: IndicadorSmart) =>
  `${i.meta.sentido === "minimo" ? "no mínimo" : "no máximo"} ${formatar(i, i.meta.valor)}${i.meta.unidade === "tentativas" ? " tentativa" : ""}`;

/** Variação em relação às 4 semanas anteriores, dizendo se melhorou ou piorou. */
function Comparacao({ i }: { i: IndicadorSmart }) {
  if (i.valor === null || i.anterior === null) return <span className="text-texto-suave">Sem período anterior</span>;
  const dif = i.valor - i.anterior;
  if (Math.abs(dif) < (i.meta.unidade === "%" ? 1 : 0.1))
    return <span className="text-texto">Igual às 4 semanas anteriores</span>;
  const melhorou = i.meta.sentido === "minimo" ? dif > 0 : dif < 0;
  const pontos = Math.round(Math.abs(dif));
  const quanto = i.meta.unidade === "%" ? `${pontos} ${pontos === 1 ? "pt" : "pts"}` : decimal(Math.abs(dif));
  return (
    <span className={melhorou ? "text-texto" : "font-semibold text-alerta"}>
      {melhorou ? "Melhorou" : "Piorou"} {quanto} em 4 semanas
    </span>
  );
}

const PARTES = [
  ["Específico", "especifico"],
  ["Mensurável", "mensuravel"],
  ["Atingível", "atingivel"],
  ["Relevante", "relevante"],
  ["Temporal", "temporal"],
] as const;

export function IndicadoresSmart({ painel, turmaId }: { painel: PainelSmart; turmaId?: string }) {
  const { janela, anterior, proximaRevisao, indicadores, atingidas } = painel;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg">Metas da turma</h2>
          <p className="mt-0.5 text-sm text-texto-suave">
            Últimas 4 semanas ({dataCurta(janela.inicio)} a {dataCurta(janela.fim)}), comparadas com{" "}
            {dataCurta(anterior.inicio)} a {dataCurta(anterior.fim)}. Próxima revisão em {dataCurta(proximaRevisao)}.
          </p>
        </div>
        <p className="tnum text-sm text-texto">
          <strong className="font-display text-2xl font-semibold text-tinta">{atingidas}</strong> de{" "}
          {indicadores.length} metas atingidas
        </p>
      </div>

      <ul className="mt-4 divide-y divide-[#F0EEF7]">
        {indicadores.map((i) => {
          const s = SITUACAO[i.status];
          const precisaAgir = i.status === "abaixo" || i.status === "perto";
          return (
            <li key={i.id} className="py-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-2 md:grid-cols-[minmax(0,1.3fr)_170px_minmax(0,1fr)_130px]">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-tinta">
                    {i.nome}
                    {i.detalhe ? <span className="font-normal text-texto"> · {i.detalhe}</span> : null}
                  </p>
                  <p className="mt-0.5 text-xs text-texto-suave">{i.especifico}</p>
                </div>
                <p className="text-right md:text-left">
                  <span className="tnum block font-display text-2xl leading-none font-semibold text-tinta">
                    {i.valor === null ? "—" : formatar(i, i.valor)}
                  </span>
                  <span className="block text-xs whitespace-nowrap text-texto-suave">meta: {textoMeta(i)}</span>
                </p>
                <p className="col-span-2 text-sm md:col-span-1 md:pt-1">
                  <Comparacao i={i} />
                </p>
                <p className="col-span-2 md:col-span-1 md:text-right">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${s.classe}`}
                  >
                    {i.status === "abaixo" ? <IconeAlerta tamanho={14} /> : null}
                    {s.rotulo}
                  </span>
                </p>
              </div>

              {precisaAgir ? (
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-texto">
                  <span>
                    <strong className="text-tinta">O que fazer:</strong> {i.acao}
                  </span>
                  {turmaId ? (
                    <Link
                      href={`/professor/planejamento/novo?turma=${turmaId}`}
                      className="inline-flex min-h-11 items-center gap-1 font-semibold text-roxo-escuro"
                    >
                      <IconeMais tamanho={15} /> Planejar aula
                    </Link>
                  ) : null}
                </p>
              ) : null}

              <details className="group mt-1">
                <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-xs font-semibold text-roxo-escuro">
                  <span className="group-open:hidden">Como é medido</span>
                  <span className="hidden group-open:inline">Fechar explicação</span>
                </summary>
                <dl className="grid gap-x-6 gap-y-2 rounded-xl bg-[#F7F5FF] p-4 text-sm sm:grid-cols-2">
                  {PARTES.map(([rotulo, campo]) => (
                    <div key={campo}>
                      <dt className="text-xs font-semibold text-tinta">{rotulo}</dt>
                      <dd className="text-texto">{i[campo]}</dd>
                    </div>
                  ))}
                  <div>
                    <dt className="text-xs font-semibold text-tinta">Base do cálculo</dt>
                    <dd className="text-texto">
                      {i.amostra} {i.amostra === 1 ? "resultado" : "resultados"} na janela · {i.id}
                    </dd>
                  </div>
                </dl>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
