import Link from "next/link";
import { notFound } from "next/navigation";
import { Cabecalho, Campos, Painel } from "@/components/painel/blocos";
import { quando } from "@/components/escola/estrutura";
import { Campo, Escolha, FormularioAcao } from "@/components/escola/formulario";
import { ListaRegistros } from "@/components/escola/registro";
import { NOME_DO_PAPEL, apiDaEquipe } from "@/lib/escola/api";
import { OPCOES_PAPEL, type PaginaRegistros, type Pessoa } from "@/lib/escola/tipos";
import { alternarUsuario, editarUsuario, novaSenhaUsuario } from "../../acoes";

export default async function FichaPessoa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [pessoas, registros] = await Promise.all([
    apiDaEquipe<Pessoa[]>("/admin/usuarios"),
    apiDaEquipe<PaginaRegistros>(`/admin/registros?usuarioId=${encodeURIComponent(id)}`),
  ]);
  const p = pessoas.find((x) => x.id === id);
  if (!p) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/usuarios" className="w-fit text-sm font-semibold text-roxo-escuro">
        ← Equipe e acessos
      </Link>
      <Cabecalho titulo={p.nome} descricao={`${NOME_DO_PAPEL[p.papel]} · ${p.email}`} />

      <Campos
        colunas={4}
        itens={[
          { rotulo: "Situação", valor: p.ativo ? (p.senhaProvisoria ? "Senha provisória" : "Ativo") : "Desativado" },
          { rotulo: "Último acesso", valor: quando(p.ultimoAcesso) },
          { rotulo: "Cadastro", valor: quando(p.criadoEm) },
          {
            rotulo: "Turmas",
            valor: p.papel === "professor" ? p.turmas.length : "—",
            detalhe: p.papel === "professor" ? "Vínculos feitos pela coordenação" : undefined,
          },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Painel
          titulo="Dados e papel"
          descricao="Mudar o papel muda as permissões na hora: a pessoa precisa entrar de novo."
        >
          <FormularioAcao acao={editarUsuario.bind(null, p.id)} botao="Salvar" atualizarAoSalvar>
            <div
              key={JSON.stringify([p.id, p.nome, p.email, p.papel, p.disciplina])}
              className="grid gap-4 md:grid-cols-2"
            >
              <Campo nome="nome" rotulo="Nome" valor={p.nome} />
              <Campo nome="email" rotulo="E-mail" tipo="email" valor={p.email} />
              <Escolha nome="papel" rotulo="Papel" opcoes={OPCOES_PAPEL} valor={p.papel} />
              <Campo
                nome="disciplina"
                rotulo="Disciplina"
                valor={p.disciplina}
                obrigatorio={false}
                dica="Obrigatória para professor."
              />
            </div>
          </FormularioAcao>
        </Painel>

        <Painel titulo="Acesso">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-sm text-texto-suave">
                Esqueceu a senha? Crie uma senha provisória e repasse à pessoa. Ela troca no próximo acesso.
              </p>
              <FormularioAcao
                acao={novaSenhaUsuario.bind(null, p.id)}
                botao="Criar senha provisória"
                variante="secundario"
                className="mt-3"
              />
            </div>
            {p.eu ? (
              <p className="text-sm text-texto-suave">Esta é a sua conta: você não pode desativá-la.</p>
            ) : (
              <div>
                <p className="text-sm text-texto-suave">
                  {p.ativo
                    ? "Desativar tira o acesso na hora. O histórico (registros, atividades e planos) continua."
                    : "Reativar devolve o acesso com o mesmo papel."}
                </p>
                <FormularioAcao
                  acao={alternarUsuario.bind(null, p.id, !p.ativo)}
                  botao={p.ativo ? "Desativar acesso" : "Reativar acesso"}
                  variante={p.ativo ? "perigo" : "primario"}
                  confirmar={p.ativo ? `Desativar o acesso de ${p.nome}?` : undefined}
                  className="mt-3"
                />
              </div>
            )}
          </div>
        </Painel>
      </div>

      <Painel titulo="O que esta pessoa fez" descricao={`${registros.total} registros`} semRecuo>
        <ListaRegistros registros={registros.registros} vazio="Esta pessoa ainda não fez nada registrado." />
      </Painel>
    </div>
  );
}
