import Link from "next/link";

/**
 * Página não encontrada dentro do painel do professor. É do painel, não do
 * app do aluno: fala de turmas, alunos e planos, e mantém o menu ao lado.
 */
export default function NaoEncontrada() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-start gap-5 py-10">
      <p className="tnum font-display text-5xl font-semibold text-lilas" aria-hidden>
        404
      </p>
      <div>
        <h1 className="text-[1.75rem] leading-tight">Não encontramos esta página</h1>
        <p className="mt-2 text-texto">
          O endereço pode estar errado, o plano ou a atividade pode ter sido excluído, ou a turma ou o aluno não é de
          uma turma sua. No painel, cada professor vê só as próprias turmas.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href="/professor"
          className="inline-flex h-11 items-center rounded-full bg-tinta px-5 text-sm font-semibold text-white"
        >
          Ir para a visão geral
        </Link>
        <Link
          href="/professor/turmas"
          className="inline-flex h-11 items-center rounded-full border border-[#D9D4EC] bg-superficie px-5 text-sm font-semibold text-tinta"
        >
          Ver turmas
        </Link>
        <Link
          href="/professor/planejamento"
          className="inline-flex h-11 items-center rounded-full border border-[#D9D4EC] bg-superficie px-5 text-sm font-semibold text-tinta"
        >
          Planos de aula
        </Link>
      </div>
    </div>
  );
}
