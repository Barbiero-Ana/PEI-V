import Link from "next/link";
import { Cabecalho, Painel } from "@/components/painel/blocos";
import { CAMPO, ROTULO, Campo, Escolha } from "@/components/escola/formulario";
import { ListaRegistros } from "@/components/escola/registro";
import { apiDaEquipe } from "@/lib/escola/api";
import { GRUPOS_DE_ACAO, OPCOES_PAPEL, type PaginaRegistros, type Pessoa } from "@/lib/escola/tipos";

/** Registro de atividades (auditoria): só cresce; ninguém altera nem apaga pela API. */
export default async function Registros({
  searchParams,
}: {
  searchParams: Promise<{
    acao?: string;
    usuarioId?: string;
    pagina?: string;
    papel?: string;
    dia?: string;
    busca?: string;
  }>;
}) {
  const f = await searchParams;
  const consulta = new URLSearchParams();
  for (const campo of ["acao", "usuarioId", "papel", "dia", "busca"] as const) {
    if (typeof f[campo] === "string" && f[campo]) consulta.set(campo, f[campo]);
  }
  const filtrado = consulta.size > 0;
  const pagina = Math.max(1, Number(f.pagina) || 1);
  consulta.set("pagina", String(pagina));

  const [r, pessoas] = await Promise.all([
    apiDaEquipe<PaginaRegistros>(`/admin/registros?${consulta}`),
    apiDaEquipe<Pessoa[]>("/admin/usuarios"),
  ]);
  const paginas = Math.max(1, Math.ceil(r.total / r.porPagina));
  const link = (n: number) => {
    const q = new URLSearchParams(consulta);
    q.set("pagina", String(n));
    return `/admin/registros?${q}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Registro de atividades"
        descricao="Quem fez o quê e quando: entradas no painel, mudanças de permissão, turmas, vínculos e acesso dos alunos. O registro só cresce: ninguém altera nem apaga."
      />

      <Painel titulo="Filtrar registro" descricao="Combine a ação, o perfil e o dia. Os horários são de Brasília.">
        <form className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-3" method="get">
          <Campo nome="busca" rotulo="Buscar por pessoa ou detalhe" valor={f.busca} obrigatorio={false} />
          <div className="flex min-w-[220px] flex-col gap-1.5">
            <label htmlFor="filtro-acao" className={ROTULO}>
              Tipo de ação
            </label>
            <select id="filtro-acao" name="acao" defaultValue={f.acao ?? ""} className={CAMPO}>
              {GRUPOS_DE_ACAO.map((g) => (
                <option key={g.valor} value={g.valor}>
                  {g.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-[220px] flex-col gap-1.5">
            <label htmlFor="filtro-pessoa" className={ROTULO}>
              Pessoa
            </label>
            <select id="filtro-pessoa" name="usuarioId" defaultValue={f.usuarioId ?? ""} className={CAMPO}>
              <option value="">Todas as pessoas</option>
              {pessoas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
          <Escolha
            nome="papel"
            rotulo="Perfil"
            valor={f.papel}
            opcoes={[{ valor: "", rotulo: "Todos os perfis" }, ...OPCOES_PAPEL]}
          />
          <Campo nome="dia" rotulo="Dia" tipo="date" valor={f.dia} obrigatorio={false} />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-xl bg-roxo px-4 font-display text-sm font-semibold text-white hover:bg-roxo-escuro"
            >
              Filtrar
            </button>
            {filtrado ? (
              <Link
                href="/admin/registros"
                className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-roxo-escuro"
              >
                Limpar filtros
              </Link>
            ) : null}
          </div>
        </form>
      </Painel>

      <Painel titulo={`${r.total} registros`} semRecuo>
        <ListaRegistros registros={r.registros} vazio="Nenhum registro com esses filtros." />
        {paginas > 1 ? (
          <nav
            aria-label="Páginas"
            className="flex items-center justify-between border-t border-[#E6E2F3] px-5 py-3 text-sm"
          >
            {pagina > 1 ? (
              <Link href={link(pagina - 1)} className="font-semibold text-roxo-escuro">
                ← Mais recentes
              </Link>
            ) : (
              <span />
            )}
            <span className="text-texto-suave">
              Página {pagina} de {paginas}
            </span>
            {pagina < paginas ? (
              <Link href={link(pagina + 1)} className="font-semibold text-roxo-escuro">
                Mais antigos →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </Painel>
    </div>
  );
}
