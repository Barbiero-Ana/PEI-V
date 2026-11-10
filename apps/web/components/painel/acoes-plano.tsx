import { duplicar, registrarAula } from "@/app/professor/(painel)/planejamento/acoes";
import type { PlanoAula } from "@/lib/painel/planejamento";

/** Registro rápido depois da aula: escreve como foi e já marca como realizada. */
export function RegistroRapido({ plano }: { plano: PlanoAula }) {
  return (
    <form action={registrarAula.bind(null, plano.id)} className="flex flex-col gap-2">
      <label htmlFor={`registro-${plano.id}`} className="text-sm font-semibold text-tinta">
        Como foi a aula?
      </label>
      <textarea
        id={`registro-${plano.id}`}
        name="registro"
        rows={3}
        required
        defaultValue={plano.registro}
        placeholder="O que funcionou, quem teve dificuldade, o que ajustar na próxima"
        className="w-full rounded-xl border border-[#D9D4EC] bg-superficie px-3 py-2.5 text-sm text-tinta outline-none focus:border-roxo"
      />
      <button
        type="submit"
        className="h-11 self-start rounded-full bg-roxo-escuro px-4 text-sm font-semibold text-white"
      >
        {plano.status === "realizada" ? "Salvar registro" : "Salvar registro e marcar como realizada"}
      </button>
    </form>
  );
}

/** Copia o plano para uma turma e uma data, sem precisar preencher de novo. */
export function DuplicarPlano({ plano, turmas }: { plano: PlanoAula; turmas: { id: string; nome: string }[] }) {
  const campo = "h-11 rounded-xl border border-[#D9D4EC] bg-superficie px-3 text-sm text-tinta";
  return (
    <form action={duplicar.bind(null, plano.id)} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-texto-suave">
        Turma
        <select
          name="turmaId"
          defaultValue={turmas.find((t) => t.id !== plano.turmaId)?.id ?? plano.turmaId}
          className={campo}
        >
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-texto-suave">
        Data
        <input name="data" type="date" required defaultValue={plano.data} className={campo} />
      </label>
      <button type="submit" className="h-11 rounded-full border border-[#D9D4EC] px-4 text-sm font-semibold text-tinta">
        Duplicar
      </button>
    </form>
  );
}
