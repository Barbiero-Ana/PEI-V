import { Fragment, useEffect, type ReactNode } from "react";
import { monitorarRaiz, registrarFalha } from "@/lib/monitoramento";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View, Text, Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from "@expo-google-fonts/lexend";
import { ProvedorAcessibilidade, useAcessibilidade } from "@/estado/acessibilidade";
import { ProvedorJogador } from "@/estado/jogador";
import { ProvedorConta } from "@/estado/conta";
import { ProvedorIdentidade } from "@/estado/identidade";
import { TransicaoNuvens } from "@/componentes/Nuvens";
import { Simbolo } from "@/componentes/Simbolo";
import { cor } from "@/tema";

// Na web, texto dentro de SVG herda a fonte serifada do navegador; usa a Inter.
if (Platform.OS === "web" && typeof document !== "undefined") {
  const css = document.createElement("style");
  css.textContent = "svg text { font-family: Inter_600SemiBold, Inter, system-ui, sans-serif; }";
  document.head.appendChild(css);
}

function RaizLayout() {
  const [fontesProntas, erroFontes] = useFonts({
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });
  if (erroFontes) throw erroFontes;

  if (!fontesProntas) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: cor.fundo }}>
        <Simbolo tamanho={72} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ProvedorAcessibilidade>
          <ProvedorIdentidade>
            <ProvedorJogador>
              <ProvedorConta>
                <ComTema>
                  <StatusBar style="dark" />
                  <TransicaoNuvens>
                    <Telas />
                  </TransicaoNuvens>
                </ComTema>
              </ProvedorConta>
            </ProvedorJogador>
          </ProvedorIdentidade>
        </ProvedorAcessibilidade>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default monitorarRaiz(RaizLayout);

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    registrarFalha(error);
  }, [error]);
  return (
    <View style={{ flex: 1, backgroundColor: "#F7F6FD", padding: 32, gap: 20, justifyContent: "center" }}>
      <Text accessibilityRole="header" style={{ fontSize: 24, color: "#1E2A78", fontWeight: "bold" }}>
        Não conseguimos abrir esta tela
      </Text>
      <Text style={{ fontSize: 17, color: "#1E2A78" }}>
        Tente novamente. Se continuar, feche e reabra o aplicativo.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void retry().catch(() => {});
        }}
        style={{ minHeight: 48, backgroundColor: "#7B61FF", borderRadius: 12, padding: 16 }}
      >
        <Text style={{ color: "#FFFFFF", textAlign: "center", fontSize: 17, fontWeight: "bold" }}>
          Tentar novamente
        </Text>
      </Pressable>
    </View>
  );
}

/**
 * Ao trocar o contraste, remonta as telas para que peguem a nova paleta. A
 * navegação continua onde estava: o React Navigation guarda o estado fora delas.
 */
function ComTema({ children }: { children: ReactNode }) {
  const { altoContraste } = useAcessibilidade();
  return <Fragment key={altoContraste ? "alto" : "padrao"}>{children}</Fragment>;
}

function Telas() {
  const { animacoesReduzidas } = useAcessibilidade();
  const anima = <T extends string>(tipo: T) => (animacoesReduzidas ? "none" : tipo);
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: cor.fundo },
        animation: anima("default"),
      }}
    >
      <Stack.Screen name="(abas)" />
      <Stack.Screen name="entrar" options={{ animation: anima("fade") }} />
      <Stack.Screen name="boas-vindas" options={{ animation: anima("fade"), gestureEnabled: false }} />
      <Stack.Screen
        name="jogar/[id]"
        options={({ route }) => ({
          // vindo das nuvens, a tela já aparece coberta por elas
          animation: (route.params as { nuvens?: string } | undefined)?.nuvens ? "none" : anima("slide_from_bottom"),
          gestureEnabled: false,
        })}
      />
      <Stack.Screen name="atividade/[id]" options={{ animation: anima("slide_from_bottom"), gestureEnabled: false }} />
      <Stack.Screen name="avisos" />
      <Stack.Screen name="feedback/[id]" />
      <Stack.Screen name="editar-perfil" options={{ presentation: "modal" }} />
      <Stack.Screen name="avatar" options={{ presentation: "modal" }} />
      <Stack.Screen name="loja" options={{ presentation: "modal" }} />
      <Stack.Screen name="relatorio" options={{ presentation: "modal" }} />
      <Stack.Screen name="acessibilidade" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="constelacao/[id]"
        options={{ animation: anima("fade"), contentStyle: { backgroundColor: "#0D1240" } }}
      />
    </Stack>
  );
}
