import Link from "next/link";
import { notFound } from "next/navigation";
import { NOME_SEGMENTO } from "@modolume/core";
import { Cabecalho, Campos, Painel } from "@/components/painel/blocos";
import { quando } from "@/components/escola/estrutura";
import { FormularioAcao } from "@/components/escola/formulario";
import { CamposDaEquipe } from "@/components/escola/cadastros";
import { ListaRegistros } from "@/components/escola/registro";
import { NOME_DO_PAPEL, apiDaEquipe } from "@/lib/escola/api";
import type { Materia, PaginaRegistros, Pessoa } from "@/lib/escola/tipos";
import { alternarUsuario, editarUsuario, novaSenhaUsuario } from "../../acoes";

export default async function FichaPessoa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [pessoas, registros, materias] = await Promise.all([
    apiDaEquipe<Pessoa[]>("/admin/usuarios"),
    apiDaEquipe<PaginaRegistros>(`/admin/registros?usuarioId=${encodeURIComponent(id)}`),
    apiDaEquipe<Materia[]>("/admin/materias"),
  ]);
  const p = pessoas.find((x) => x.id === id);
  if (!p) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/usuarios" className="w-fit text-sm font-semibold text-roxo-escuro">
        ← Equipe e acessos
      </Link>
      <Cabecalho
        titulo={p.nome}
        descricao={`${NOME_DO_PAPEL[p.papel]} · ${p.email}${p.papel === "coordenacao" ? ` · ${p.segmento ? NOME_SEGMENTO[p.segmento] : "Sem segmento"}` : ""}`}
      />

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
            <CamposDaEquipe
              key={JSON.stringify([p.id, p.nome, p.email, p.papel, p.materiaId, p.segmento])}
              pessoa={p}
              materias={materias}
            />
          </FormularioAcao>
        </Painel>

        <Painel titulo="Acesso">
          <div className="flex flex-col gap-6">
            {!p.eu && (
              <div>
                <p className="text-sm text-texto-suave">
                  Revogue a credencial anterior se necessário. A própria pessoa solicita um link pelo e-mail em
                  Recuperar acesso.
                </p>
                <FormularioAcao
                  acao={novaSenhaUsuario.bind(null, p.id)}
                  botao="Revogar credencial anterior"
                  confirmar="Revogar a senha e todas as sessões desta pessoa? Ela precisará recuperar o acesso por e-mail."
                  variante="secundario"
                  className="mt-3"
                />
              </div>
            )}
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
