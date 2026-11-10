import type { Metadata } from "next";
import Link from "next/link";
import { FiltroTurmas, comFiltros } from "@/components/painel/filtros";
import { GavetaPlano } from "@/components/painel/gaveta-plano";
import { BORDA, BotaoLink, Cabecalho, corDaTurma, isoLocal, nomeDoMes } from "@/components/painel/blocos";
import { IconeMais, IconeSeta, IconeVoltar } from "@/components/painel/icones";
import { listaDeTurmas, opcoesDePlanejamento, professorLogado } from "@/lib/painel/dados";
import { listarPlanos } from "@/lib/painel/planejamento";

export const metadata: Metadata = { title: "Calendário · Painel do professor · Modolume" };

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const iso = (a: number, m: number, d: number) => `${a}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

export default async function Calendario({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; plano?: string; turma?: string }>;
}) {
  const professor = await professorLogado();
  const { mes, plano, turma = "" } = await searchParams;
  const [turmas, todosOsPlanos] = await Promise.all([listaDeTurmas(professor), listarPlanos(professor)]);
  const planos = todosOsPlanos.filter((p) => !turma || p.turmaId === turma);

  const hoje = isoLocal(new Date());
  const [ano, m] = (mes && /^\d{4}-\d{2}$/.test(mes) ? mes : hoje.slice(0, 7)).split("-").map(Number) as [
    number,
    number,
  ];
  const primeiroDia = new Date(ano, m - 1, 1).getDay();
  const diasNoMes = new Date(ano, m, 0).getDate();
  const anterior = m === 1 ? `${ano - 1}-12` : `${ano}-${String(m - 1).padStart(2, "0")}`;
  const seguinte = m === 12 ? `${ano + 1}-01` : `${ano}-${String(m + 1).padStart(2, "0")}`;

  // células: espaços vazios antes do dia 1, depois os dias, completando a última semana
  const celulas: (number | null)[] = [
    ...Array<null>(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  while (celulas.length % 7) celulas.push(null);

  const corDa = (turmaId: string) => {
    const c = corDaTurma(turmas.findIndex((t) => t.turma.id === turmaId));
    return `${c.borda} ${c.clara}`;
  };
  const nomeTurma = (id: string) => turmas.find((t) => t.turma.id === id)?.turma.nome ?? "";

  const aberto = plano ? planos.find((x) => x.id === plano) : undefined;
  const opcoes = aberto ? await opcoesDePlanejamento(professor) : [];

  return (
    <>
      <div className="flex flex-col gap-6">
        <Cabecalho
          titulo="Calendário de aulas"
          acoes={
            <BotaoLink href="/professor/planejamento/novo">
              <IconeMais tamanho={16} /> Novo plano
            </BotaoLink>
          }
        />

        <FiltroTurmas
          turmas={turmas.map(({ turma: t }) => t)}
          atual={turma}
          href={(id) => comFiltros("/professor/planejamento/calendario", { mes: mes ?? "" }, { turma: id })}
        />

        <section className={`sombra-suave overflow-hidden rounded-2xl bg-superficie`}>
          <div className={`flex flex-wrap items-center justify-between gap-3 border-b ${BORDA} px-5 py-3`}>
            <div className="flex items-center gap-1">
              <Link
                href={comFiltros("", { turma }, { mes: anterior })}
                aria-label="Mês anterior"
                className={`grid size-11 place-items-center rounded-xl border ${BORDA} text-texto`}
              >
                <IconeVoltar />
              </Link>
              <h2 className="w-44 text-center text-base">
                {nomeDoMes(m).charAt(0).toUpperCase() + nomeDoMes(m).slice(1)} de {ano}
              </h2>
              <Link
                href={comFiltros("", { turma }, { mes: seguinte })}
                aria-label="Próximo mês"
                className={`grid size-11 place-items-center rounded-xl border ${BORDA} text-texto`}
              >
                <IconeSeta />
              </Link>
              {hoje.slice(0, 7) !== iso(ano, m, 1).slice(0, 7) ? (
                <Link href="?" className="ml-2 text-sm font-semibold text-roxo-escuro">
                  Hoje
                </Link>
              ) : null}
            </div>
            <ul className="flex flex-wrap gap-4 text-xs text-texto">
              {turmas.map(({ turma }) => (
                <li key={turma.id} className="flex items-center gap-1.5">
                  <span className={`size-3 rounded-sm border-l-4 ${corDa(turma.id)}`} aria-hidden />
                  {turma.nome}
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-x-auto">
            <div className="grid min-w-[760px] grid-cols-7">
              {DIAS.map((d) => (
                <div
                  key={d}
                  className={`border-b ${BORDA} bg-[#F7F8FB] px-3 py-2 text-xs font-semibold text-texto-suave`}
                >
                  {d}
                </div>
              ))}
              {celulas.map((dia, i) => {
                if (dia === null)
                  return (
                    <div
                      key={`v${i}`}
                      className={`min-h-28 border-b border-r ${BORDA} bg-[#FAFAFC] [&:nth-child(7n)]:border-r-0`}
                    />
                  );
                const data = iso(ano, m, dia);
                const doDia = planos.filter((p) => p.data === data);
                const fimDeSemana = i % 7 === 0 || i % 7 === 6;
                return (
                  <div
                    key={data}
                    className={`flex min-h-28 flex-col gap-1 border-b border-r ${BORDA} p-1.5 [&:nth-child(7n)]:border-r-0 ${fimDeSemana ? "bg-[#FAFAFC]" : ""}`}
                  >
                    <Link
                      href={`/professor/planejamento/novo?data=${data}`}
                      aria-label={`Planejar aula em ${dia} de ${nomeDoMes(m)}`}
                      className="-m-2 grid size-11 place-items-center self-start rounded-full"
                    >
                      <span
                        className={`tnum grid size-7 place-items-center rounded-full text-xs font-semibold ${data === hoje ? "bg-roxo-escuro text-white" : "text-texto"}`}
                      >
                        {dia}
                      </span>
                    </Link>
                    {doDia.map((p) => (
                      <Link
                        key={p.id}
                        href={comFiltros("", { turma, mes: iso(ano, m, 1).slice(0, 7) }, { plano: p.id })}
                        scroll={false}
                        className={`block min-h-11 rounded-sm border-l-4 px-1.5 py-1 text-xs leading-snug text-tinta ${corDa(p.turmaId)} ${p.status === "rascunho" ? "opacity-70" : ""}`}
                      >
                        <span className="block font-semibold">
                          {p.horario ? `${p.horario} · ` : ""}
                          {nomeTurma(p.turmaId)}
                        </span>
                        <span className="line-clamp-2">{p.tema}</span>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
      {aberto ? (
        <GavetaPlano
          plano={aberto}
          turmas={opcoes}
          fecharHref={comFiltros("", { turma }, { mes: iso(ano, m, 1).slice(0, 7) })}
          hoje={isoLocal(new Date())}
        />
      ) : null}
    </>
  );
}
