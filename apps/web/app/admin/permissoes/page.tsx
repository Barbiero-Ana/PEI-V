import Link from "next/link";
import { Cabecalho, Painel } from "@/components/painel/blocos";
import { apiDaEquipe } from "@/lib/escola/api";
import type { Pessoa } from "@/lib/escola/tipos";

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
      { o: "Parâmetros gerais e desempenho de todas as turmas", professor: "nao", coordenacao: "sim", admin: "nao" },
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
      { o: "Vincular professores às turmas", professor: "nao", coordenacao: "sim", admin: "nao" },
      { o: "Criar turmas e cadastrar alunos", professor: "nao", coordenacao: "nao", admin: "sim" },
      { o: "Cadastrar pessoas e definir o papel", professor: "nao", coordenacao: "nao", admin: "sim" },
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

export default async function Permissoes() {
  const pessoas = await apiDaEquipe<Pessoa[]>("/admin/usuarios");
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
      <Painel semRecuo>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#E6E2F3] text-left">
                <th className="px-5 py-3 font-semibold text-texto-suave">O que</th>
                {[
                  ["Professor", conta("professor")],
                  ["Coordenação", conta("coordenacao")],
                  ["Administrador", conta("admin")],
                ].map(([nome, n]) => (
                  <th key={nome} className="px-3 py-3 text-center font-display font-semibold text-tinta">
                    {nome}
                    <span className="block text-xs font-normal text-texto-suave">{n} com acesso</span>
                  </th>
                ))}
              </tr>
            </thead>
            {PERMISSOES.map((g) => (
              <tbody key={g.grupo}>
                <tr>
                  <th colSpan={4} className="bg-suave/70 px-5 py-2 text-left text-xs font-semibold text-texto-suave">
                    {g.grupo}
                  </th>
                </tr>
                {g.itens.map((i) => (
                  <tr key={i.o} className="border-b border-[#EFECF8] last:border-b-0">
                    <td className="px-5 py-2.5 text-tinta">{i.o}</td>
                    <Celula nivel={i.professor} />
                    <Celula nivel={i.coordenacao} />
                    <Celula nivel={i.admin} />
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </Painel>
      <p className="text-sm text-texto-suave">
        Professores só veem as turmas às quais estão vinculados. Coordenação e administração veem a escola inteira, mas
        só da própria instituição. Toda mudança de papel, desativação e vínculo fica no registro de atividades.
      </p>
    </div>
  );
}
