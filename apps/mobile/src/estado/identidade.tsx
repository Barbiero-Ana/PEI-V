import { Fragment, createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor, criarEstilos } from "@/tema";
import { EscopoIdentidade, RepositorioIdentidades, identidadeDa, type ContaAluno } from "./isolamento";
import { RepositorioSessao } from "./sessao";

const repositorio = new RepositorioIdentidades(AsyncStorage);
const sessoes = new RepositorioSessao(
  {
    getItem: SecureStore.getItemAsync,
    setItem: (chave, valor) =>
      SecureStore.setItemAsync(chave, valor, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
  },
  AsyncStorage,
);
interface Identidade {
  legadoPreservado: boolean;
  conta: ContaAluno | null;
  escopo: EscopoIdentidade;
  repositorio: RepositorioIdentidades;
  selecionar: (conta: ContaAluno | null) => Promise<void>;
  falhar: () => void;
}
const Ctx = createContext<Identidade | null>(null);

export function ProvedorIdentidade({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<{ conta: ContaAluno | null; escopo: EscopoIdentidade; versao: number } | null>(
    null,
  );
  const [trocando, setTrocando] = useState(false);
  const [erro, setErro] = useState<"abertura" | "gravacao" | null>(null);
  const [tentativa, setTentativa] = useState(0);
  const [legadoPreservado, setLegadoPreservado] = useState(false);
  const revisao = useRef(0);
  const falhar = useCallback(() => setErro("gravacao"), []);
  useEffect(() => {
    let montado = true;
    Promise.all([sessoes.restaurar(), repositorio.temLegado()])
      .then(([conta, legado]) => {
        if (montado) {
          setLegadoPreservado(legado);
          setEstado({ conta, escopo: new EscopoIdentidade(identidadeDa(conta)), versao: 0 });
        }
      })
      .catch(() => {
        if (montado) setErro("abertura");
      });
    return () => {
      montado = false;
    };
  }, [tentativa]);
  const selecionar = useCallback(
    async (conta: ContaAluno | null) => {
      const versao = ++revisao.current;
      estado?.escopo.encerrar(); // Invalida callbacks ANTES de qualquer await.
      setTrocando(true);
      try {
        if (!conta) await sessoes.salvar(null);
        await repositorio.aguardarEscritas();
        if (versao !== revisao.current) return;
        if (conta) await sessoes.salvar(conta);
        else await repositorio.desativarDemonstracao();
        if (versao !== revisao.current) return;
        setEstado({ conta, escopo: new EscopoIdentidade(identidadeDa(conta)), versao });
        setTrocando(false);
      } catch {
        if (versao === revisao.current) falhar();
        throw new Error("Não foi possível guardar a sessão neste aparelho.");
      }
    },
    [estado, falhar],
  );
  if (erro)
    return (
      <View style={e.estado} accessibilityLiveRegion="polite">
        <Titulo style={e.centro}>Não foi possível abrir sua sessão</Titulo>
        {erro === "abertura" ? (
          <>
            <Texto style={e.centro}>Desbloqueie o aparelho e tente novamente.</Texto>
            <Botao
              titulo="Tentar novamente"
              onPress={() => {
                setErro(null);
                setTentativa((atual) => atual + 1);
              }}
            />
          </>
        ) : (
          <Texto style={e.centro}>Houve uma falha ao salvar os dados. Feche e abra o app para tentar novamente.</Texto>
        )}
      </View>
    );
  if (!estado || trocando)
    return (
      <View style={e.estado} accessibilityLiveRegion="polite">
        <ActivityIndicator color={cor.roxo} />
        <Texto style={e.centro}>Preparando seu acesso…</Texto>
      </View>
    );
  return (
    <Ctx.Provider value={{ ...estado, selecionar, repositorio, falhar, legadoPreservado }}>
      <Fragment key={estado.versao}>{children}</Fragment>
    </Ctx.Provider>
  );
}

const e = criarEstilos(() => ({
  estado: { flex: 1, justifyContent: "center", gap: 14, paddingHorizontal: 24, backgroundColor: cor.fundo },
  centro: { textAlign: "center" },
}));

export function useIdentidade() {
  const valor = useContext(Ctx);
  if (!valor) throw new Error("ProvedorIdentidade ausente.");
  return valor;
}
