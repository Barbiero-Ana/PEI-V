import { Redirect, Tabs } from "expo-router";
import { boasVindasVista } from "@/lib/boasVindas";
import { BarraAbas } from "@/componentes/BarraAbas";
import { IconeInicio, IconeNiveis, IconePerfil, IconeProfessor, IconeTrofeu } from "@/componentes/Icones";
import { useConta } from "@/estado/conta";
import { useAcessibilidade } from "@/estado/acessibilidade";
import { cor } from "@/tema";

/**
 * Abas: Início, Níveis (missões dos mapas, o mapeamento da aprendizagem),
 * Professor (atividades enviadas pelo professor), Conquistas e Perfil.
 */
export default function AbasLayout() {
  const { animacoesReduzidas } = useAcessibilidade();
  const { pronto, temServidor, conta, semTurma } = useConta();
  if (!boasVindasVista()) return <Redirect href="/boas-vindas" />;
  // com servidor, o aluno entra na turma antes de jogar (ou escolhe seguir sem turma)
  if (!pronto) return null;
  if (temServidor && !conta && !semTurma) return <Redirect href="/entrar" />;
  return (
    <Tabs
      tabBar={(props) => <BarraAbas {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: cor.fundo },
        // a tela nova entra deslizando de leve do lado da aba tocada. Sem mexer na
        // opacidade: com toques rápidos, uma transição interrompida podia deixar a
        // tela travada invisível (em branco) até sair e voltar para a aba.
        animation: animacoesReduzidas ? "none" : "shift",
        transitionSpec: { animation: "timing", config: { duration: 200 } },
        sceneStyleInterpolator: ({ current }) => ({
          sceneStyle: {
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [-1, 0, 1],
                  outputRange: [-24, 0, 24],
                  extrapolate: "clamp",
                }),
              },
            ],
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Início", tabBarIcon: ({ color }) => <IconeInicio cor={String(color)} tamanho={22} /> }}
      />
      <Tabs.Screen
        name="niveis"
        options={{ title: "Níveis", tabBarIcon: ({ color }) => <IconeNiveis cor={String(color)} tamanho={22} /> }}
      />
      <Tabs.Screen
        name="professor"
        options={{
          title: "Professor",
          tabBarIcon: ({ color }) => <IconeProfessor cor={String(color)} tamanho={22} />,
        }}
      />
      <Tabs.Screen
        name="conquistas"
        options={{ title: "Conquistas", tabBarIcon: ({ color }) => <IconeTrofeu cor={String(color)} tamanho={22} /> }}
      />
      <Tabs.Screen
        name="perfil"
        options={{ title: "Perfil", tabBarIcon: ({ color }) => <IconePerfil cor={String(color)} tamanho={22} /> }}
      />
    </Tabs>
  );
}
