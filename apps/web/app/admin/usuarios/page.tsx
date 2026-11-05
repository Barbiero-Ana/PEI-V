import Link from "next/link";
import { Avatar, Cabecalho, Painel, TABELA } from "@/components/painel/blocos";
import { quando } from "@/components/escola/estrutura";
import { Campo, Escolha, FormularioAcao } from "@/components/escola/formulario";
import { NOME_DO_PAPEL, apiDaEquipe } from "@/lib/escola/api";
import { OPCOES_PAPEL, type Pessoa } from "@/lib/escola/tipos";
import { criarUsuario } from "../acoes";

const COR_PAPEL = {
  professor: "bg-roxo-claro text-roxo-escuro",
  coordenacao: "bg-azul-claro text-tinta",
  admin: "bg-pessego-claro text-tinta",
};

export default async function Equipe() {
  const pessoas = await apiDaEquipe<Pessoa[]>("/admin/usuarios");
  const ativas = pessoas.filter((p) => p.ativo);
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Equipe e acessos"
        descricao="Cadastre quem usa o painel e defina o papel de cada pessoa. O papel decide o que ela vê e faz (veja Permissões)."
      />

      <Painel
        titulo="Cadastrar pessoa"
        descricao="A pessoa recebe uma senha provisória e cria a própria senha no primeiro acesso."
      >
        <FormularioAcao acao={criarUsuario} botao="Cadastrar">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Campo nome="nome" rotulo="Nome" />
            <Campo nome="email" rotulo="E-mail" tipo="email" />
            <Escolha nome="papel" rotulo="Papel" opcoes={OPCOES_PAPEL} />
            <Campo nome="disciplina" rotulo="Disciplina" obrigatorio={false} dica="Obrigatória para professor." />
          </div>
        </FormularioAcao>
      </Painel>

      <Painel titulo={`Pessoas (${ativas.length} com acesso)`} semRecuo>
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
              {pessoas.map((p) => (
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
                    {p.papel === "professor" ? p.turmas.map((t) => t.nome).join(", ") || "nenhuma ainda" : "—"}
                  </td>
                  <td className={`${TABELA.td} tnum text-texto-suave`}>{quando(p.ultimoAcesso)}</td>
                  <td className={TABELA.td}>
                    {!p.ativo ? (
                      <span className="text-texto-suave">Desativado</span>
                    ) : p.senhaProvisoria ? (
                      <span className="text-alerta">Senha provisória</span>
                    ) : (
                      <span className="text-tinta">Ativo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Painel>
    </div>
  );
}
