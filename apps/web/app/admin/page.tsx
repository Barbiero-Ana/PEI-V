import Link from "next/link";
import { Cabecalho, Painel } from "@/components/painel/blocos";
import { Indicador } from "@/components/escola/estrutura";
import { ListaRegistros } from "@/components/escola/registro";
import { apiDaEquipe } from "@/lib/escola/api";
import type { ResumoAdmin } from "@/lib/escola/tipos";

export default async function VisaoAdmin() {
  const r = await apiDaEquipe<ResumoAdmin>("/admin/resumo");
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Visão geral"
        descricao={`${r.instituicao.nome}: quem usa o Modolume, as turmas e o que aconteceu por último.`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Indicador rotulo="Professores" valor={r.professores} destaque />
        <Indicador rotulo="Coordenação" valor={r.coordenacao} />
        <Indicador
          rotulo="Administradores"
          valor={r.administradores}
          detalhe={r.desativados ? `${r.desativados} na equipe com acesso desativado` : undefined}
        />
        <Indicador rotulo="Turmas ativas" valor={r.turmas} />
        <Indicador rotulo="Alunos ativos" valor={r.alunos} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Painel titulo="O que fazer daqui">
          <ul className="flex flex-col gap-2">
            {[
              [
                "/admin/usuarios",
                "Cadastrar professor, coordenação ou administrador",
                "Cada pessoa recebe uma senha provisória e troca no primeiro acesso.",
              ],
              [
                "/admin/turmas",
                "Criar turmas e cadastrar alunos",
                "Cada aluno recebe o código pessoal de acesso ao app.",
              ],
              [
                "/admin/permissoes",
                "Conferir o que cada papel pode fazer",
                "O papel de cada pessoa define o que ela vê e faz.",
              ],
              [
                "/admin/registros",
                "Ver o registro de atividades",
                "Entradas, mudanças de permissão, vínculos e acessos dos alunos.",
              ],
            ].map(([href, titulo, texto]) => (
              <li key={href}>
                <Link href={href!} className="block rounded-xl px-4 py-3 transition-colors hover:bg-suave">
                  <span className="block font-semibold text-tinta">{titulo}</span>
                  <span className="block text-sm text-texto-suave">{texto}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Painel>
        <Painel titulo="Atividade recente" acao={{ href: "/admin/registros", rotulo: "Ver tudo" }} semRecuo>
          <ListaRegistros registros={r.registrosRecentes} />
        </Painel>
      </div>
    </div>
  );
}
