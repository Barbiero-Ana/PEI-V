import Link from "next/link";
import { normalizarBusca } from "@modolume/core";
import { Cabecalho, Painel } from "@/components/painel/blocos";
import { Campo, Escolha } from "@/components/escola/formulario";
import { ListaRegistros } from "@/components/escola/registro";
import { NOME_DO_PAPEL, apiDaEquipe } from "@/lib/escola/api";
import { OPCOES_PAPEL, type PaginaRegistros, type Pessoa } from "@/lib/escola/tipos";
import type { PapelEquipe } from "@/lib/painel/sessao";

/**
 * O que cada papel pode fazer. As permissões são por papel (e não pessoa a
 * pessoa): fica simples de explicar e de conferir. A API aplica as mesmas
 * regras em cada chamada; esta página só mostra a tabela.
 */

type Nivel = "sim" | "ver" | "nao";
const PERMISSOES: { grupo: string; itens: { o: string; professor: Nivel; coordenacao: Nivel; admin: Nivel }[] }[] = [
  {
    grupo: "Acompanhar",
    itens: [
      { o: "Indicadores das próprias turmas", professor: "sim", coordenacao: "sim", admin: "nao" },
      { o: "Indicadores e desempenho das turmas do segmento", professor: "nao", coordenacao: "sim", admin: "nao" },
      { o: "Dados individuais dos alunos", professor: "sim", coordenacao: "ver", admin: "nao" },
    ],
  },
  {
    grupo: "Planejar e ensinar",
    itens: [
      { o: "Criar planos de aula", professor: "sim", coordenacao: "nao", admin: "nao" },
      { o: "Criar e enviar atividades para o app", professor: "sim", coordenacao: "nao", admin: "nao" },
      { o: "Zerar PIN e gerar novo código do aluno", professor: "sim", coordenacao: "nao", admin: "nao" },
    ],
  },
  {
    grupo: "Organizar a escola",
    itens: [
      { o: "Gerenciar vínculos das turmas do segmento", professor: "nao", coordenacao: "sim", admin: "nao" },
      { o: "Selecionar uma turma no cadastro do professor", professor: "nao", coordenacao: "nao", admin: "sim" },
      { o: "Criar turmas e cadastrar alunos", professor: "nao", coordenacao: "nao", admin: "sim" },
      { o: "Cadastrar pessoas e definir perfil e segmento", professor: "nao", coordenacao: "nao", admin: "sim" },
      { o: "Cadastrar matérias da escola", professor: "nao", coordenacao: "nao", admin: "sim" },
      { o: "Desativar acessos e criar senhas provisórias", professor: "nao", coordenacao: "nao", admin: "sim" },
      { o: "Ver o registro de atividades", professor: "nao", coordenacao: "nao", admin: "sim" },
    ],
  },
];

const ROTULO_NIVEL: Record<Nivel, string> = { sim: "Pode", ver: "Só consulta", nao: "Não" };

function Celula({ nivel }: { nivel: Nivel }) {
  const cor = { sim: "bg-roxo text-white", ver: "bg-azul-claro text-tinta", nao: "bg-transparent text-texto-fraco" }[
    nivel
  ];
  return (
    <td className="px-3 py-2.5 text-center">
      <span className={`inline-flex min-w-[92px] justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${cor}`}>
        {ROTULO_NIVEL[nivel]}
      </span>
    </td>
  );
}

export default async function Permissoes({
  searchParams,
}: {
  searchParams: Promise<{ papel?: string; grupo?: string; busca?: string }>;
}) {
  const f = await searchParams;
  const papel = OPCOES_PAPEL.find((p) => p.valor === f.papel)?.valor as PapelEquipe | undefined;
  const papeis = papel ? [papel] : (Object.keys(NOME_DO_PAPEL) as PapelEquipe[]);
  const busca = typeof f.busca === "string" ? f.busca.trim().slice(0, 100) : "";
  const grupos = PERMISSOES.filter((g) => !f.grupo || f.grupo === g.grupo)
    .map((g) => ({
      ...g,
      itens: g.itens.filter(
        (i) => (!papel || i[papel] !== "nao") && normalizarBusca(i.o).includes(normalizarBusca(busca)),
      ),
    }))
    .filter((g) => g.itens.length);
  const [pessoas, atividade] = await Promise.all([
    apiDaEquipe<Pessoa[]>("/admin/usuarios"),
    apiDaEquipe<PaginaRegistros>("/admin/registros?acao=usuario"),
  ]);
  const conta = (papel: string) => pessoas.filter((p) => p.ativo && p.papel === papel).length;
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Permissões"
        descricao={
          <>
            Cada pessoa tem um papel, e o papel define o que ela vê e faz. Para mudar as permissões de alguém, troque o
            papel em{" "}
            <Link href="/admin/usuarios" className="font-semibold text-roxo-escuro">
              Equipe e acessos
            </Link>
            . A mudança vale na hora.
          </>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        {OPCOES_PAPEL.map((p) => (
          <Link
            key={p.valor}
            href={`/admin/usuarios?papel=${p.valor}&situacao=ativo`}
            className="sombra-suave rounded-2xl bg-superficie p-4 hover:bg-suave"
          >
            <span className="block text-sm font-semibold text-tinta">{p.rotulo}</span>
            <span className="mt-1 block text-sm text-texto-suave">{conta(p.valor)} com acesso · Ver equipe</span>
          </Link>
        ))}
      </div>
      <Painel titulo="Filtrar permissões">
        <form method="get" className="grid items-end gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Campo nome="busca" rotulo="Buscar ação" valor={busca} obrigatorio={false} />
          <Escolha
            nome="papel"
            rotulo="Perfil"
            valor={papel}
            opcoes={[{ valor: "", rotulo: "Todos" }, ...OPCOES_PAPEL]}
          />
          <Escolha
            nome="grupo"
            rotulo="Grupo"
            valor={f.grupo}
            opcoes={[{ valor: "", rotulo: "Todos" }, ...PERMISSOES.map((g) => ({ valor: g.grupo, rotulo: g.grupo }))]}
          />
          <div className="flex items-center gap-3">
            <button className="min-h-11 rounded-xl bg-roxo px-4 font-semibold text-white">Filtrar</button>
            <Link href="/admin/permissoes" className="text-sm text-roxo-escuro">
              Limpar
            </Link>
          </div>
        </form>
      </Painel>
      <Painel semRecuo>
        {grupos.length === 0 ? (
          <p className="px-5 py-6 text-sm text-texto-suave">Nenhuma permissão corresponde aos filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E6E2F3] text-left">
                  <th className="px-5 py-3 font-semibold text-texto-suave">O que</th>
                  {papeis.map((p) => (
                    <th key={p} className="px-3 py-3 text-center font-display font-semibold text-tinta">
                      {NOME_DO_PAPEL[p]}
                    </th>
                  ))}
                </tr>
              </thead>
              {grupos.map((g) => (
                <tbody key={g.grupo}>
                  <tr>
                    <th
                      colSpan={1 + papeis.length}
                      className="bg-suave/70 px-5 py-2 text-left text-xs font-semibold text-texto-suave"
                    >
                      {g.grupo}
                    </th>
                  </tr>
                  {g.itens.map((i) => (
                    <tr key={i.o} className="border-b border-[#EFECF8] last:border-b-0">
                      <td className="px-5 py-2.5 text-tinta">{i.o}</td>
                      {papeis.map((p) => (
                        <Celula key={p} nivel={i[p]} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        )}
      </Painel>
      <p className="text-sm text-texto-suave">
        Professores acessam as turmas vinculadas. A coordenação acompanha seu segmento e a administração gerencia os
        cadastros da instituição.
      </p>
      <Painel
        titulo="Atividade recente de acessos"
        acao={{ href: "/admin/registros?acao=usuario", rotulo: "Ver registro de acessos" }}
        semRecuo
      >
        <ListaRegistros registros={atividade.registros.slice(0, 6)} />
      </Painel>
    </div>
  );
}
