import type { Metadata } from "next";
import Link from "next/link";
import { FormularioPlano } from "@/components/painel/form-plano";
import { IconeVoltar } from "@/components/painel/icones";
import { dataCurta } from "@/components/painel/blocos";
import { opcoesDePlanejamento, professorLogado } from "@/lib/painel/dados";
import {
  HABILIDADES_BNCC,
  UNIDADES_TEMATICAS,
  atividadesDoApp,
  buscarPlano,
  formatoValido,
  listarPlanos,
  type DadosPlano,
} from "@/lib/painel/planejamento";

export const metadata: Metadata = { title: "Novo plano de aula · Painel do professor · Modolume" };

export default async function NovoPlano({
  searchParams,
}: {
  searchParams: Promise<{
    turma?: string;
    aluno?: string;
    data?: string;
    base?: string;
    formatos?: string;
    alunos?: string;
  }>;
}) {
  const professor = await professorLogado();
  const { turma = "", aluno = "", data = "", base = "", formatos = "", alunos = "" } = await searchParams;
  const [turmas, planos, modelo] = await Promise.all([
    opcoesDePlanejamento(professor),
    listarPlanos(professor),
    base ? buscarPlano(professor, base) : null,
  ]);
  const turmaValida = turmas.some((t) => t.id === turma) ? turma : "";
  const dataValida = /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : "";

  // a turma, o aluno e a data podem vir da ficha do aluno, da turma ou do calendário;
  // com ?base=, o plano começa como cópia de um plano anterior (sem data, sem registro)
  const inicial: DadosPlano = modelo
    ? (() => {
        const { id: _i, professorId: _p, atualizadoEm: _a, ...d } = modelo;
        const t = turmaValida || d.turmaId;
        return {
          ...d,
          turmaId: t,
          data: dataValida,
          status: "planejada",
          registro: "",
          alunosFoco: t === d.turmaId ? d.alunosFoco : [],
        };
      })()
    : {
        turmaId: turmaValida,
        data: dataValida,
        horario: "",
        aulas: 2,
        tema: "",
        unidade: UNIDADES_TEMATICAS[0],
        habilidades: [],
        objetivos: "",
        conteudos: "",
        metodologia: "",
        // formatos podem vir dos insights do aluno ("planejar aula com esse jeito")
        formatos: formatos.split(",").filter(formatoValido),
        atividadesApp: [],
        recursos: "",
        avaliacao: "",
        // um aluno (da ficha) ou um grupo (da página de habilidades), só da turma escolhida
        alunosFoco: [aluno, ...alunos.split(",")].filter((a) => a && a.startsWith(`${turmaValida}-`)),
        observacoes: "",
        status: "planejada",
        registro: "",
      };

  const anteriores = [...planos].reverse().slice(0, 8);
  const manter = new URLSearchParams({ turma, data });
  for (const [k, v] of [...manter.entries()]) if (!v) manter.delete(k);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/professor/planejamento"
        className="inline-flex items-center gap-1 self-start text-sm font-semibold text-roxo-escuro"
      >
        <IconeVoltar tamanho={15} /> Planos de aula
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.75rem] leading-tight">Novo plano de aula</h1>
        </div>
        {/* partir de um plano anterior */}
        <form className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {[...manter.entries()].map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <label htmlFor="base" className="text-sm text-texto">
            Partir de um plano anterior
          </label>
          <select
            id="base"
            name="base"
            defaultValue={base}
            className="h-11 min-w-0 flex-1 rounded-xl border border-[#D9D4EC] bg-superficie px-3 text-sm text-tinta sm:max-w-64 sm:flex-none"
          >
            <option value="">Plano em branco</option>
            {anteriores.map((p) => (
              <option key={p.id} value={p.id}>
                {dataCurta(p.data)} · {turmas.find((t) => t.id === p.turmaId)?.nome} · {p.tema}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-11 rounded-full border border-[#D9D4EC] bg-superficie px-4 text-sm font-semibold text-tinta"
          >
            Usar
          </button>
        </form>
      </div>
      <FormularioPlano
        key={base || "branco"}
        turmas={turmas}
        habilidades={HABILIDADES_BNCC}
        unidades={UNIDADES_TEMATICAS}
        atividades={atividadesDoApp()}
        inicial={inicial}
      />
    </div>
  );
}
