import { Fragment, createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EscopoIdentidade, RepositorioIdentidades, SESSAO, identidadeDa, type ContaAluno } from "./isolamento";

const repositorio = new RepositorioIdentidades(AsyncStorage);
interface Identidade {
  legadoPreservado: boolean;
  conta: ContaAluno | null;
  escopo: EscopoIdentidade;
  repositorio: RepositorioIdentidades;
  selecionar: (conta: ContaAluno | null) => Promise<void>;
  falhar: () => void;
}
const Ctx = createContext<Identidade | null>(null);

export function IdentidadeProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<{ conta: ContaAluno | null; escopo: EscopoIdentidade; versao: number } | null>(
    null,
  );
  const [trocando, setTrocando] = useState(false);
  const [erro, setErro] = useState(false);
  const [legadoPreservado, setLegadoPreservado] = useState(false);
  const revisao = useRef(0);
  const falhar = useCallback(() => setErro(true), []);
  useEffect(() => {
    let montado = true;
    Promise.all([repositorio.sessao(), repositorio.temLegado()])
      .then(([conta, legado]) => {
        if (montado) {
          setLegadoPreservado(legado);
          setEstado({ conta, escopo: new EscopoIdentidade(identidadeDa(conta)), versao: 0 });
        }
      })
      .catch(() => {
        if (montado) setErro(true);
      });
    return () => {
      montado = false;
    };
  }, []);
  const selecionar = useCallback(
    async (conta: ContaAluno | null) => {
      const versao = ++revisao.current;
      estado?.escopo.encerrar(); // Invalida callbacks ANTES de qualquer await.
      setTrocando(true);
      try {
        await repositorio.aguardarEscritas();
        await repositorio.gravar(SESSAO, { conta });
        if (versao !== revisao.current) return;
        setEstado({ conta, escopo: new EscopoIdentidade(identidadeDa(conta)), versao });
        setTrocando(false);
      } catch {
        setErro(true);
        throw new Error("Não foi possível guardar a sessão neste aparelho.");
      }
    },
    [estado],
  );
  if (erro)
    return (
      <View>
        <Text>
          Não foi possível carregar os dados locais com segurança. Reinicie o app para tentar novamente. Os dados
          guardados foram preservados.
        </Text>
      </View>
    );
  if (!estado || trocando) return null;
  return (
    <Ctx.Provider value={{ ...estado, selecionar, repositorio, falhar, legadoPreservado }}>
      <Fragment key={estado.versao}>{children}</Fragment>
    </Ctx.Provider>
  );
}

export function useIdentidade() {
  const valor = useContext(Ctx);
  if (!valor) throw new Error("IdentidadeProvider ausente.");
  return valor;
}
