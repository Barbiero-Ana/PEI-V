"use client";

import { useState, useTransition } from "react";
import { novoCodigoDoAluno, zerarPinDoAluno, type ResultadoAcesso } from "@/app/professor/(painel)/alunos/acoes";
import type { AcessoDoAluno } from "@/lib/painel/dados";

/**
 * Acesso do aluno ao app, no perfil (ADR 0017): o código que o professor ou a
 * coordenação repassa, a situação do PIN e as duas ações. As ações pedem
 * confirmação na própria linha (sem janela por cima), com o efeito explicado.
 */

type Acao = "zerar" | "novo";

const SOBRE: Record<Acao, { botao: string; pergunta: string; confirmar: string }> = {
  zerar: {
    botao: "Zerar PIN",
    pergunta: "O aluno cria um PIN novo no próximo acesso. O código continua o mesmo.",
    confirmar: "Zerar PIN",
  },
  novo: {
    botao: "Novo código",
    pergunta: "O código atual para de funcionar e o aluno sai do app em todos os aparelhos.",
    confirmar: "Gerar código",
  },
};

const formatar = (c: string) => `${c.slice(0, 4)}-${c.slice(4)}`;
const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Cuiaba" });

export function AcessoAluno({ alunoId, acesso }: { alunoId: string; acesso: AcessoDoAluno | null }) {
  const [confirmando, setConfirmando] = useState<Acao | null>(null);
  const [resultado, setResultado] = useState<ResultadoAcesso | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [pendente, iniciar] = useTransition();

  if (!acesso) {
    return (
      <section className="border-t border-[#E8E5F3] px-5 py-4">
        <h2 className="text-sm font-semibold">Acesso ao app</h2>
        <p className="mt-1 text-sm text-texto-suave">O código aparece aqui quando o painel está ligado ao servidor.</p>
      </section>
    );
  }

  const situacao = acesso.bloqueadoAte
    ? { texto: `Bloqueado até ${hora(acesso.bloqueadoAte)} por PINs errados`, cor: "text-alerta" }
    : acesso.pinCriado
      ? { texto: "PIN criado pelo aluno", cor: "text-texto-suave" }
      : { texto: "Aguardando o primeiro acesso (ainda sem PIN)", cor: "text-texto-suave" };

  function executar(acao: Acao) {
    iniciar(async () => {
      const r = acao === "zerar" ? await zerarPinDoAluno(alunoId) : await novoCodigoDoAluno(alunoId);
      setResultado(r);
      setConfirmando(null);
    });
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(formatar(acesso!.codigo));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sem permissão de área de transferência: o código continua visível para ditar
    }
  }

  return (
    <section className="border-t border-[#E8E5F3] px-5 py-4" aria-labelledby="titulo-acesso">
      <h2 id="titulo-acesso" className="text-sm font-semibold">
        Acesso ao app
      </h2>
      <p className="mt-0.5 text-xs text-texto-suave">Repasse ao aluno. O PIN de 4 números só ele sabe.</p>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-suave px-3 py-2">
        <span
          className="tnum font-display text-xl font-semibold tracking-[0.12em] text-tinta"
          aria-label="Código de acesso"
        >
          {formatar(acesso.codigo)}
        </span>
        <button
          type="button"
          onClick={copiar}
          className="min-h-11 rounded-lg px-3 text-sm font-semibold text-roxo-escuro hover:bg-roxo-claro"
        >
          {copiado ? "Copiado" : "Copiar"}
        </button>
      </div>
      <p className={`mt-2 text-xs ${situacao.cor}`}>{situacao.texto}</p>

      {confirmando ? (
        <div className="mt-3 rounded-xl border border-borda-forte p-3" role="group" aria-label="Confirmar ação">
          <p className="text-sm text-texto">{SOBRE[confirmando].pergunta}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={pendente}
              onClick={() => executar(confirmando)}
              className="min-h-11 flex-1 rounded-full bg-tinta px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pendente ? "Aguarde..." : SOBRE[confirmando].confirmar}
            </button>
            <button
              type="button"
              disabled={pendente}
              onClick={() => setConfirmando(null)}
              className="min-h-11 rounded-full px-3 text-sm font-semibold text-texto-suave hover:bg-suave"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(["zerar", "novo"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setResultado(null);
                setConfirmando(a);
              }}
              className="min-h-11 rounded-full border border-[#D9D4EC] px-2 text-sm font-semibold text-tinta hover:bg-suave"
            >
              {SOBRE[a].botao}
            </button>
          ))}
        </div>
      )}

      <p
        aria-live="polite"
        className={`mt-2 min-h-4 text-xs ${resultado && !resultado.ok ? "text-alerta" : "text-texto-suave"}`}
      >
        {resultado?.mensagem ?? ""}
      </p>
    </section>
  );
}
