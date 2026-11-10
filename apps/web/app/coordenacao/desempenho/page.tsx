import Link from "next/link";
import { Cabecalho, Painel } from "@/components/painel/blocos";
import { apiDaEquipe } from "@/lib/escola/api";
import type { VisaoCoordenacao } from "@/lib/escola/tipos";

/** Cor da célula pelo acerto: o que está abaixo de 60% aparece em pêssego. */
function cor(v: number | undefined) {
  if (v === undefined) return "bg-transparent text-texto-fraco";
  if (v < 60) return "bg-pessego-claro text-tinta";
  if (v < 75) return "bg-lilas-claro text-tinta";
  return "bg-roxo-claro text-roxo-escuro";
}

/** Acerto por formato em cada turma, lado a lado, para comparar. */
export default async function DesempenhoEscola() {
  const v = await apiDaEquipe<VisaoCoordenacao>("/coordenacao/visao");
  const formatos = v.escola.porFormato;
  return (
    <div className="flex flex-col gap-6">
      <Cabecalho
        titulo="Desempenho por formato"
        descricao={`Compare o acerto por formato entre as turmas do segmento nos últimos ${v.janelaDias} dias.`}
      />
      <Painel semRecuo>
        {formatos.length === 0 ? (
          <p className="p-5 text-sm text-texto-suave">Ainda sem jogadas no período.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#E6E2F3]">
                  <th className="px-5 py-3 text-left font-semibold text-texto-suave">Turma</th>
                  {formatos.map((f) => (
                    <th key={f.formato} className="px-2 py-3 text-center text-xs font-semibold text-texto-suave">
                      {f.rotulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {v.turmas.map((t) => {
                  const mapa = new Map(t.porFormato.map((f) => [f.formato, f.acertoMedio]));
                  return (
                    <tr key={t.id} className="border-b border-[#EFECF8]">
                      <td className="px-5 py-2.5">
                        <Link
                          href={`/coordenacao/turmas/${t.id}`}
                          className="font-semibold text-tinta hover:text-roxo-escuro"
                        >
                          {t.nome}
                        </Link>
                      </td>
                      {formatos.map((f) => {
                        const valor = mapa.get(f.formato);
                        return (
                          <td key={f.formato} className="px-2 py-2 text-center">
                            <span
                              className={`tnum inline-block min-w-14 rounded-lg px-2 py-1.5 font-semibold ${cor(valor)}`}
                            >
                              {valor === undefined ? "—" : `${valor}%`}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="bg-suave/60">
                  <td className="px-5 py-2.5 font-display font-semibold text-tinta">Segmento</td>
                  {formatos.map((f) => (
                    <td key={f.formato} className="px-2 py-2 text-center">
                      <span
                        className={`tnum inline-block min-w-14 rounded-lg px-2 py-1.5 font-semibold ${cor(f.acertoMedio)}`}
                      >
                        {f.acertoMedio}%
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Painel>
      <p className="text-sm text-texto-suave">
        Os números são referências pedagógicas, não diagnóstico. Abaixo de 60% aparece em pêssego.
      </p>
    </div>
  );
}
