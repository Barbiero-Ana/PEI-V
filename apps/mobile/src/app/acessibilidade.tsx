import type { ReactNode } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { falarExemplo, useAcessibilidade, useFalarAoAbrir } from "@/estado/acessibilidade";
import type { EscalaTexto } from "@/lib/acessibilidadeSalva";
import { voltar } from "@/lib/navegacao";
import { Fechar, IconeSom } from "@/componentes/Icones";
import { Interruptor } from "@/componentes/Interruptor";
import { Texto, Titulo } from "@/componentes/ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";

const ESCALAS: { valor: EscalaTexto; rotulo: string }[] = [
  { valor: 1, rotulo: "Normal" },
  { valor: 1.15, rotulo: "Grande" },
  { valor: 1.3, rotulo: "Muito grande" },
];

/** Opções de acessibilidade. Cada uma mostra o efeito na hora. */
export default function Acessibilidade() {
  const insets = useSafeAreaInsets();
  const a = useAcessibilidade();
  useFalarAoAbrir(
    "Acessibilidade. Ajuste o tamanho do texto, a leitura em voz, a fonte para dislexia, o alto contraste e as animações.",
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: cor.fundo }}
      contentContainerStyle={{
        padding: 20,
        paddingTop: Platform.OS === "ios" ? 20 : insets.top + 16,
        paddingBottom: insets.bottom + 28,
        gap: 14,
      }}
    >
      <View style={ac.topo}>
        <View style={{ flex: 1 }}>
          <Titulo tamanho={24}>Acessibilidade</Titulo>
          <Texto style={{ fontSize: 13, color: cor.textoSuave }}>
            Deixe o Modolume do jeito que fica melhor para você.
          </Texto>
        </View>
        <Pressable onPress={voltar} hitSlop={12} accessibilityLabel="Fechar" style={ac.fechar}>
          <Fechar tamanho={18} />
        </Pressable>
      </View>

      <Bloco titulo="Tamanho do texto" detalhe="Vale para todas as telas e jogos.">
        <View style={ac.escalas} accessibilityRole="radiogroup">
          {ESCALAS.map((e) => {
            const ativo = a.escala === e.valor;
            return (
              <Pressable
                key={e.valor}
                onPress={() => {
                  a.mudar({ escala: e.valor });
                  a.falar(`Texto ${e.rotulo.toLowerCase()}`);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: ativo }}
                accessibilityLabel={`Texto ${e.rotulo}`}
                style={[ac.escala, ativo && ac.escalaAtiva]}
              >
                <Texto
                  style={{ fontFamily: fonte.tituloForte, fontSize: 15 * e.valor, color: ativo ? cor.roxo : cor.tinta }}
                >
                  Aa
                </Texto>
                <Texto style={{ fontSize: 11, color: ativo ? cor.roxo : cor.textoSuave }}>{e.rotulo}</Texto>
              </Pressable>
            );
          })}
        </View>
        <View style={ac.amostra}>
          <Texto style={{ fontSize: 14, color: cor.texto }}>
            Na feira, a Dona Rosa separou caixotes de laranjas. Quantas laranjas tem em cada um?
          </Texto>
        </View>
      </Bloco>

      <Bloco>
        <Opcao
          titulo="Leitura em voz"
          detalhe="Lê as telas, os enunciados, as dicas e os botões tocados."
          valor={a.voz}
          onMudar={(v) => {
            a.mudar({ voz: v });
            if (v) falarExemplo("Leitura em voz ligada.");
          }}
        />
        <Pressable
          onPress={() => falarExemplo("Olá! Eu sou o Lilo. É assim que eu leio as telas e as missões para você.")}
          accessibilityRole="button"
          style={({ pressed }) => [ac.ouvir, pressed && { opacity: 0.8 }]}
        >
          <IconeSom tamanho={18} />
          <Texto style={{ fontFamily: fonte.textoForte, fontSize: 13, color: cor.roxo }}>Ouvir um exemplo</Texto>
        </Pressable>
      </Bloco>

      <Bloco>
        <Opcao
          titulo="Fonte para dislexia"
          detalhe="Letras mais abertas e espaçadas (Lexend), mais fáceis de diferenciar."
          valor={a.dislexia}
          onMudar={(v) => a.mudar({ dislexia: v })}
        />
      </Bloco>

      <Bloco>
        <Opcao
          titulo="Alto contraste"
          detalhe="Textos, bordas e cores mais fortes sobre fundos brancos, para ler e enxergar melhor."
          valor={a.altoContraste}
          onMudar={(v) => {
            a.falar(v ? "Alto contraste ligado." : "Alto contraste desligado.");
            a.mudar({ altoContraste: v });
          }}
        />
      </Bloco>

      <Bloco>
        <Opcao
          titulo="Menos animações"
          detalhe="Tira movimentos contínuos e transições. Também segue a configuração do aparelho."
          valor={a.menosAnimacoes}
          onMudar={(v) => a.mudar({ menosAnimacoes: v })}
        />
      </Bloco>

      <Texto style={{ fontSize: 12, color: cor.textoSuave, textAlign: "center", lineHeight: 18 }}>
        O Modolume também funciona com os leitores de tela do celular (TalkBack e VoiceOver).
      </Texto>
    </ScrollView>
  );
}

function Bloco({ titulo, detalhe, children }: { titulo?: string; detalhe?: string; children: ReactNode }) {
  return (
    <View style={ac.bloco}>
      {titulo ? (
        <View style={{ marginBottom: 12 }}>
          <Texto style={{ fontFamily: fonte.titulo, fontSize: 16, color: cor.tinta }}>{titulo}</Texto>
          {detalhe ? <Texto style={{ fontSize: 13, color: cor.textoSuave }}>{detalhe}</Texto> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

function Opcao({
  titulo,
  detalhe,
  valor,
  onMudar,
}: {
  titulo: string;
  detalhe: string;
  valor: boolean;
  onMudar: (v: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <View style={{ flex: 1 }}>
        <Texto style={{ fontFamily: fonte.titulo, fontSize: 16, color: cor.tinta }}>{titulo}</Texto>
        <Texto style={{ fontSize: 13, color: cor.textoSuave, lineHeight: 18 }}>{detalhe}</Texto>
      </View>
      <Interruptor rotulo={titulo} valor={valor} onMudar={onMudar} />
    </View>
  );
}

const ac = criarEstilos(() => ({
  topo: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  fechar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: cor.borda,
    backgroundColor: cor.superficie,
  },
  bloco: { padding: 16, borderRadius: raio.g, backgroundColor: cor.superficie, borderWidth: 1, borderColor: cor.borda },
  escalas: { flexDirection: "row", gap: 10 },
  escala: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: 10,
    borderRadius: raio.m,
    borderWidth: 2,
    borderColor: cor.borda,
  },
  escalaAtiva: { borderColor: cor.roxo, backgroundColor: cor.roxoClaro },
  amostra: { marginTop: 12, padding: 12, borderRadius: raio.m, backgroundColor: cor.fundo },
  ouvir: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: cor.roxoClaro,
  },
}));
