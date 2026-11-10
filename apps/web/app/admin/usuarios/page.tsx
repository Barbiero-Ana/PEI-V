import Link from "next/link";
import { NOME_SEGMENTO, normalizarBusca, numeroDaPagina } from "@modolume/core";
import { Avatar, Cabecalho, Painel, TABELA } from "@/components/painel/blocos";
import { quando } from "@/components/escola/estrutura";
import { Campo, Escolha, FormularioAcao } from "@/components/escola/formulario";
import { CamposDaEquipe } from "@/components/escola/cadastros";
import { NOME_DO_PAPEL, apiDaEquipe } from "@/lib/escola/api";
import { OPCOES_PAPEL, type Materia, type Pessoa, type TurmaAdmin } from "@/lib/escola/tipos";
import { criarUsuario } from "../acoes";

const COR_PAPEL = {
  professor: "bg-roxo-claro text-roxo-escuro",
  coordenacao: "bg-azul-claro text-tinta",
  admin: "bg-pessego-claro text-tinta",
};

const POR_PAGINA = 20;

export default async function Equipe({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const parametros = await searchParams;
  const busca = typeof parametros.busca === "string" ? parametros.busca.trim().slice(0, 120) : "";
  const papel = OPCOES_PAPEL.find((opcao) => opcao.valor === parametros.papel)?.valor ?? "";
  const situacao = parametros.situacao === "ativo" || parametros.situacao === "inativo" ? parametros.situacao : "";
  const [pessoas, materias, turmas] = await Promise.all([
    apiDaEquipe<Pessoa[]>("/admin/usuarios"),
    apiDaEquipe<Materia[]>("/admin/materias"),
    apiDaEquipe<TurmaAdmin[]>("/admin/turmas"),
  ]);
  const termo = normalizarBusca(busca);
  const filtradas = pessoas.filter(
    (pessoa) =>
      normalizarBusca(pessoa.nome).includes(termo) &&
      (!papel || pessoa.papel === papel) &&
      (!situacao || pessoa.ativo === (situacao === "ativo")),
  );
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const pagina = typeof parametros.pagina === "string" ? numeroDaPagina(parametros.pagina, totalPaginas) : 1;
  const inicio = (pagina - 1) * POR_PAGINA;
  const caminhoDaPagina = (destino: number) =>
    `/admin/usuarios?${new URLSearchParams({ busca, papel, situacao, pagina: String(destino) })}`;
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Equipe e acessos"
        descricao="Cadastre quem usa o painel e defina o papel de cada pessoa. O papel decide o que ela vê e faz (veja Permissões)."
      />

      <Painel
        titulo="Cadastrar pessoa"
        descricao="Após o cadastro, a pessoa define a própria senha pelo link solicitado em Recuperar acesso."
      >
        <FormularioAcao acao={criarUsuario} botao="Cadastrar">
          <CamposDaEquipe materias={materias} turmas={turmas} />
        </FormularioAcao>
      </Painel>

      <Painel titulo="Pessoas Cadastradas" semRecuo>
        <form className="grid gap-4 p-4 md:grid-cols-3" method="get">
          <Campo nome="busca" rotulo="Buscar por nome" valor={busca} obrigatorio={false} />
          <Escolha
            nome="papel"
            rotulo="Perfil"
            valor={papel}
            opcoes={[{ valor: "", rotulo: "Todos" }, ...OPCOES_PAPEL]}
          />
          <Escolha
            nome="situacao"
            rotulo="Situação"
            valor={situacao}
            opcoes={[
              { valor: "", rotulo: "Todas" },
              { valor: "ativo", rotulo: "Ativo" },
              { valor: "inativo", rotulo: "Inativo" },
            ]}
          />
          <div className="flex items-center gap-4">
            <button className="min-h-11 rounded-xl bg-roxo px-4 font-semibold text-white">Filtrar</button>
            <Link href="/admin/usuarios">Limpar filtros</Link>
          </div>
        </form>
        <p className="px-4 pb-3 text-sm text-texto-suave" role="status">
          {filtradas.length} de {pessoas.length} pessoas
        </p>
        {filtradas.length === 0 ? (
          <p className="px-4 pb-4">Nenhuma pessoa encontrada. Mude o termo ou limpe os filtros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={TABELA.tabela}>
              <thead className={TABELA.cabeca}>
                <tr>
                  <th className={TABELA.th}>Nome</th>
                  <th className={TABELA.th}>Papel</th>
                  <th className={TABELA.th}>Turmas</th>
                  <th className={TABELA.th}>Último acesso</th>
                  <th className={TABELA.th}>Situação</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.slice(inicio, inicio + POR_PAGINA).map((p) => (
                  <tr key={p.id} className={`${TABELA.linha} ${p.ativo ? "" : "opacity-60"}`}>
                    <td className={TABELA.td}>
                      <Link
                        href={`/admin/usuarios/${p.id}`}
                        className="flex items-center gap-3 font-semibold text-tinta hover:text-roxo-escuro"
                      >
                        <Avatar nome={p.nome} tamanho={34} />
                        <span>
                          {p.nome}
                          {p.eu ? <span className="font-normal text-texto-suave"> (você)</span> : null}
                          <span className="block text-xs font-normal text-texto-suave">{p.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className={TABELA.td}>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${COR_PAPEL[p.papel]}`}>
                        {NOME_DO_PAPEL[p.papel]}
                      </span>
                    </td>
                    <td className={`${TABELA.td} text-texto-suave`}>
                      {p.papel === "professor" ? (
                        <>
                          <span className="block font-medium text-tinta">{p.disciplina ?? "Sem matéria"}</span>
                          {p.turmas.map((t) => t.nome).join(", ") || "Sem turma"}
                        </>
                      ) : p.papel === "coordenacao" ? (
                        p.segmento ? (
                          NOME_SEGMENTO[p.segmento]
                        ) : (
                          "Sem segmento"
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className={`${TABELA.td} tnum text-texto-suave`}>{quando(p.ultimoAcesso)}</td>
                    <td className={TABELA.td}>
                      {!p.ativo ? (
                        <span className="text-texto-suave">Inativo</span>
                      ) : p.senhaProvisoria ? (
                        <span className="text-alerta">Ativo · senha a definir</span>
                      ) : (
                        <span className="text-tinta">Ativo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPaginas > 1 && (
          <nav aria-label="Páginas da equipe" className="flex items-center gap-4 px-4 py-3">
            {pagina > 1 && (
              <Link className="py-3" href={caminhoDaPagina(pagina - 1)}>
                Anterior
              </Link>
            )}
            <span>
              Página {pagina} de {totalPaginas}
            </span>
            {pagina < totalPaginas && (
              <Link className="py-3" href={caminhoDaPagina(pagina + 1)}>
                Próxima
              </Link>
            )}
          </nav>
        )}
      </Painel>
    </div>
  );
}
