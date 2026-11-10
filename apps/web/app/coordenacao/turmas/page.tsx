import Link from "next/link";
import { NOME_SEGMENTO, normalizarBusca } from "@modolume/core";
import { Cabecalho, Painel } from "@/components/painel/blocos";
import { IconeAlerta, IconeSeta, IconeTurmas, IconeVinculo } from "@/components/painel/icones";
import { Campo, Escolha } from "@/components/escola/formulario";
import { BarraValor } from "@/components/escola/estrutura";
import { apiDaEquipe } from "@/lib/escola/api";
import { OPCOES_PERIODO, type TurmaCoordenacao, type VisaoCoordenacao } from "@/lib/escola/tipos";

const CAMINHO = "/coordenacao/turmas";
const GRADE = "xl:grid-cols-[minmax(13rem,1.5fr)_minmax(7.5rem,1fr)_minmax(7.5rem,1fr)_minmax(6rem,.8fr)_7rem]";
const ATALHOS = [
  { valor: "", rotulo: "Todas as turmas", icone: IconeTurmas, cor: "bg-roxo-claro text-roxo-escuro" },
  { valor: "atencao", rotulo: "Com alunos em atenção", icone: IconeAlerta, cor: "bg-pessego-claro text-alerta" },
  { valor: "sem-professor", rotulo: "Sem professor", icone: IconeVinculo, cor: "bg-azul-claro text-tinta" },
] as const;
type Situacao = (typeof ATALHOS)[number]["valor"];

function corresponde(turma: TurmaCoordenacao, situacao: Situacao) {
  if (situacao === "atencao") return turma.alunosAtencao > 0;
  if (situacao === "sem-professor") return turma.professores.length === 0;
  return true;
}

function LinhaDaTurma({ turma }: { turma: TurmaCoordenacao }) {
  const href = `${CAMINHO}/${turma.id}`;
  const docentes = turma.professores.map((p) => p.nome).join(", ");

  return (
    <li className={`grid min-w-0 gap-4 px-5 py-4 xl:items-center ${GRADE} hover:bg-suave/40`}>
      <div className="min-w-0">
        <h3 className="font-display text-base font-semibold text-tinta">{turma.nome}</h3>
        <p className="mt-0.5 text-xs text-texto-suave">
          {turma.serie} · {turma.periodo} · {turma.alunos} {turma.alunos === 1 ? "aluno" : "alunos"}
        </p>
        {docentes ? (
          <p className="mt-1 break-words text-sm text-texto-suave">{docentes}</p>
        ) : (
          <Link
            href={`/coordenacao/vinculos?turma=${encodeURIComponent(turma.id)}`}
            className="mt-1 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-alerta hover:underline"
            aria-label={`Vincular professor a ${turma.nome}`}
          >
            <IconeVinculo tamanho={16} /> Vincular professor
          </Link>
        )}
      </div>

      <dl className="grid min-w-0 grid-cols-2 gap-x-3 gap-y-3 rounded-xl bg-suave/60 p-3 min-[380px]:grid-cols-3 xl:contents">
        <div className="flex min-w-0 flex-col gap-1 xl:justify-center">
          <dt className="text-xs text-texto-suave xl:sr-only">Participação</dt>
          <dd className="tnum text-sm font-semibold text-tinta">{turma.alunos ? `${turma.participacao}%` : "—"}</dd>
          <dd className="text-xs text-texto-suave">
            {turma.alunos ? `${turma.alunosAtivos7d} de ${turma.alunos} jogaram` : "Sem alunos"}
          </dd>
        </div>
        <div className="flex min-w-0 flex-col gap-1 xl:justify-center">
          <dt className="text-xs text-texto-suave xl:sr-only">Acerto médio</dt>
          <dd className="xl:w-full">
            <span className="tnum text-sm font-semibold text-tinta xl:hidden">
              {turma.acertoMedio === null ? "—" : `${turma.acertoMedio}%`}
            </span>
            <span className="hidden xl:block">
              <BarraValor valor={turma.acertoMedio} />
            </span>
          </dd>
          <dd className="text-xs text-texto-suave">
            {turma.jogadas} {turma.jogadas === 1 ? "jogada" : "jogadas"}
          </dd>
        </div>
        <div className="flex min-w-0 flex-col gap-1 xl:justify-center">
          <dt className="text-xs text-texto-suave xl:sr-only">Em atenção</dt>
          <dd
            className={
              turma.alunosAtencao > 0
                ? "tnum w-fit rounded-full bg-pessego-claro px-2.5 py-0.5 text-sm font-semibold text-alerta"
                : "tnum text-sm text-texto-suave"
            }
          >
            {turma.jogadas ? `${turma.alunosAtencao} ${turma.alunosAtencao === 1 ? "aluno" : "alunos"}` : "Sem dados"}
          </dd>
        </div>
      </dl>

      <Link
        href={href}
        aria-label={`Ver turma ${turma.nome}`}
        className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-xl border border-borda px-3 text-sm font-semibold whitespace-nowrap text-roxo-escuro hover:border-roxo hover:bg-roxo-claro xl:justify-self-end"
      >
        Ver turma <IconeSeta tamanho={14} />
      </Link>
    </li>
  );
}

export default async function TurmasCoordenacao({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [v, f] = await Promise.all([apiDaEquipe<VisaoCoordenacao>("/coordenacao/visao"), searchParams]);
  const situacao = ATALHOS.find((a) => a.valor === f.situacao)?.valor ?? "";
  const busca = typeof f.busca === "string" ? f.busca.trim().slice(0, 100) : "";
  const periodo = OPCOES_PERIODO.find((o) => o.valor === f.periodo)?.valor ?? "";
  const ordem = f.ordem === "atencao" ? "atencao" : "nome";
  const termo = normalizarBusca(busca);
  const turmas = v.turmas
    .filter(
      (t) =>
        corresponde(t, situacao) &&
        (!periodo || t.periodo === periodo) &&
        (!termo || normalizarBusca([t.nome, t.serie, ...t.professores.map((p) => p.nome)].join(" ")).includes(termo)),
    )
    .sort(
      (a, b) =>
        (ordem === "atencao" ? b.alunosAtencao - a.alunosAtencao : 0) ||
        a.nome.localeCompare(b.nome, "pt-BR", { numeric: true }),
    );

  function linkDaSituacao(valor: Situacao) {
    const consulta = new URLSearchParams();
    if (valor) consulta.set("situacao", valor);
    if (busca) consulta.set("busca", busca);
    if (periodo) consulta.set("periodo", periodo);
    if (ordem !== "nome") consulta.set("ordem", ordem);
    return consulta.size ? `${CAMINHO}?${consulta}` : CAMINHO;
  }

  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Turmas"
        descricao={`${v.segmento ? NOME_SEGMENTO[v.segmento] : v.instituicao.nome} · Compare a participação e o desempenho das turmas do seu segmento.`}
      />

      <nav aria-label="Filtrar turmas por situação" className="grid grid-cols-3 gap-2 sm:gap-3">
        {ATALHOS.map(({ valor, rotulo, icone: Icone, cor }) => (
          <Link
            key={valor}
            href={linkDaSituacao(valor)}
            aria-current={situacao === valor ? "page" : undefined}
            className={`flex min-h-20 items-center gap-3 rounded-2xl border px-2.5 py-2.5 transition-colors sm:px-4 sm:py-3 ${situacao === valor ? "border-roxo bg-roxo-claro/40" : "border-borda bg-superficie hover:bg-suave"}`}
          >
            <span className={`hidden size-10 shrink-0 items-center justify-center rounded-xl sm:flex ${cor}`}>
              <Icone tamanho={20} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-texto-suave">{rotulo}</span>
              <span className="tnum block font-display text-2xl font-semibold leading-tight text-tinta">
                {v.turmas.filter((t) => corresponde(t, valor)).length}
              </span>
            </span>
          </Link>
        ))}
      </nav>

      <Painel titulo="Acompanhamento por turma" semRecuo>
        <form
          method="get"
          className="grid items-end gap-3 px-5 pt-2 pb-4 min-[360px]:grid-cols-2 xl:grid-cols-[minmax(13rem,1.5fr)_1fr_1fr_auto]"
        >
          <input type="hidden" name="situacao" value={situacao} />
          <div className="min-[360px]:col-span-2 xl:col-span-1">
            <Campo nome="busca" rotulo="Buscar turma ou professor" valor={busca} obrigatorio={false} tipo="search" />
          </div>
          <Escolha
            nome="periodo"
            rotulo="Turno"
            valor={periodo}
            opcoes={[{ valor: "", rotulo: "Todos" }, ...OPCOES_PERIODO]}
          />
          <Escolha
            nome="ordem"
            rotulo="Ordenar por"
            valor={ordem}
            opcoes={[
              { valor: "nome", rotulo: "Nome" },
              { valor: "atencao", rotulo: "Em atenção" },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button className="min-h-11 rounded-xl bg-roxo px-4 text-sm font-semibold text-white hover:bg-roxo-escuro">
              Aplicar
            </button>
            {situacao || busca || periodo || ordem !== "nome" ? (
              <Link href={CAMINHO} className="text-sm font-semibold text-roxo-escuro hover:underline">
                Limpar filtros
              </Link>
            ) : null}
          </div>
        </form>
        <p className="border-t border-borda px-5 py-3 text-xs text-texto-suave">
          {turmas.length} de {v.turmas.length} turmas · Participação nos últimos 7 dias · Acerto e atenção nos últimos{" "}
          {v.janelaDias} dias
        </p>
        {turmas.length ? (
          <>
            <div
              aria-hidden
              className={`hidden gap-4 border-y border-borda bg-suave/70 px-5 py-2.5 text-xs font-semibold text-texto-suave xl:grid ${GRADE}`}
            >
              <span>Turma e professores</span>
              <span>Participação</span>
              <span>Acerto médio</span>
              <span>Alunos em atenção</span>
              <span />
            </div>
            <ul className="divide-y divide-borda border-t border-borda xl:border-t-0">
              {turmas.map((turma) => (
                <LinhaDaTurma key={turma.id} turma={turma} />
              ))}
            </ul>
          </>
        ) : (
          <p className="border-t border-borda px-5 py-7 text-sm text-texto-suave">
            {v.turmas.length
              ? "Nenhuma turma corresponde aos filtros."
              : "Nenhuma turma ativa está disponível para o seu segmento."}
          </p>
        )}
      </Painel>
    </div>
  );
}
