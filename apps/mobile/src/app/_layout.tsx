import { Fragment, type ReactNode } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Poppins_600SemiBold, Poppins_700Bold } from "@expo-google-fonts/poppins";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold } from "@expo-google-fonts/lexend";
import { AcessibilidadeProvider, useAcessibilidade } from "@/estado/acessibilidade";
import { JogadorProvider } from "@/estado/jogador";
import { ContaProvider } from "@/estado/conta";
import { TransicaoNuvens } from "@/componentes/Nuvens";
import { Simbolo } from "@/componentes/Simbolo";
import { cor } from "@/tema";

// Na web, texto dentro de SVG herda a fonte serifada do navegador; usa a Inter.
if (Platform.OS === "web" && typeof document !== "undefined") {
  const css = document.createElement("style");
  css.textContent = "svg text { font-family: Inter_600SemiBold, Inter, system-ui, sans-serif; }";
  document.head.appendChild(css);
}

export default function RaizLayout() {
  const [fontesProntas] = useFonts({
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
        <AcessibilidadeProvider>
          <JogadorProvider>
            <ContaProvider>
              <ComTema>
                <StatusBar style="dark" />
                <TransicaoNuvens>
                  <Telas />
                </TransicaoNuvens>
              </ComTema>
            </ContaProvider>
          </JogadorProvider>
        </AcessibilidadeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
