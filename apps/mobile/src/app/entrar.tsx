import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Redirect, router } from "expo-router";
import { codigoAcessoValido, formatarCodigoAcesso, normalizarCodigoAcesso } from "@modolume/core";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFalarAoAbrir } from "@/estado/acessibilidade";
import { useConta, type IdentificacaoAluno } from "@/estado/conta";
import { Simbolo } from "@/componentes/Simbolo";
import { Botao, Texto, Titulo } from "@/componentes/ui";
import { cor, criarEstilos, fonte, raio } from "@/tema";

/**
 * Entrada do aluno na própria conta (MOD-AUT-009, ADR 0017), sem e-mail:
 * 1. o código pessoal que o professor ou a coordenação passou (ex.: BDFH-2468);
 * 2. o PIN de 4 números. No primeiro acesso (ou depois que o professor zera),
 *    o aluno cria o PIN e confirma digitando de novo.
 * Ninguém escolhe nome numa lista: cada código abre só a conta daquele aluno.
 */

type Etapa = "codigo" | "pin" | "criar" | "confirmar";

const TAMANHO_PIN = 4;
export default function Entrar() {
  const insets = useSafeAreaInsets();
  const { temServidor, conta, identificar, entrar, continuarSemTurma } = useConta();
  const [etapa, setEtapa] = useState<Etapa>("codigo");
  const [codigoDigitado, definirCodigoDigitado] = useState("");
  const codigo = normalizarCodigoAcesso(codigoDigitado);
  const [quem, setQuem] = useState<IdentificacaoAluno | null>(null);
  const [pin, setPin] = useState("");
  const [primeiroPin, setPrimeiroPin] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [esperando, setEsperando] = useState(false);
  useFalarAoAbrir(etapa === "codigo" ? "Digite o código que o seu professor passou." : "Digite o seu PIN.");

  if (!temServidor || conta) return <Redirect href="/" />;

  async function continuar() {
    if (esperando) return;
    if (!codigoAcessoValido(codigo)) return setErro("Confira o código. O formato novo é BDFH-2468.");
    setErro(null);
    setEsperando(true);
    try {
      const r = await identificar(codigo);
      setQuem(r);
      setPin("");
      setEtapa(r.criarPin ? "criar" : "pin");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para achar o código.");
    } finally {
      setEsperando(false);
    }
  }

  async function enviar(pinFinal: string) {
    setEsperando(true);
    try {
      await entrar(codigo, pinFinal);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não deu para entrar.");
      setPin("");
      // PIN recusado na criação (fácil de adivinhar): volta a criar do zero
      if (etapa === "confirmar") {
        setPrimeiroPin("");
        setEtapa("criar");
      }
    } finally {
      setEsperando(false);
    }
  }

  function digitar(n: string) {
    if (esperando || pin.length >= TAMANHO_PIN) return;
    setErro(null);
    const novo = pin + n;
    setPin(novo);
    if (novo.length < TAMANHO_PIN) return;
    if (etapa === "criar") {
      setPrimeiroPin(novo);
      setPin("");
      setEtapa("confirmar");
    } else if (etapa === "confirmar") {
      if (novo !== primeiroPin) {
        setErro("Os PINs não são iguais. Crie de novo.");
        setPin("");
        setPrimeiroPin("");
        setEtapa("criar");
      } else void enviar(novo);
    } else void enviar(novo);
  }

  function trocarCodigo() {
    setEtapa("codigo");
    setQuem(null);
    setPin("");
    setPrimeiroPin("");
    setErro(null);
  }

  if (etapa !== "codigo" && quem) {
    const titulo =
      etapa === "criar" ? "Crie o seu PIN" : etapa === "confirmar" ? "Digite o PIN de novo" : "Digite o seu PIN";
    const apoio =
      etapa === "criar"
        ? "São 4 números só seus. Você vai usar para entrar no app."
        : etapa === "confirmar"
          ? "Para ter certeza de que está certo."
          : quem.turma;
    return (
      <View style={[e.tela, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
        <View style={e.topoPin}>
          <Simbolo tamanho={48} />
          <Texto style={e.ola}>Oi, {quem.primeiroNome}!</Texto>
          <Titulo tamanho={24} style={{ textAlign: "center" }}>
            {titulo}
          </Titulo>
          <Texto style={e.centro}>{apoio}</Texto>
          <View style={e.pontos} accessible accessibilityLabel={`${pin.length} de ${TAMANHO_PIN} números digitados`}>
            {Array.from({ length: TAMANHO_PIN }, (_, i) => (
              <View key={i} style={[e.ponto, i < pin.length && e.pontoCheio]} />
            ))}
          </View>
          {/* espaço fixo para a mensagem: o teclado não pula quando ela aparece */}
          <Texto style={e.erro} accessibilityLiveRegion="polite" numberOfLines={2}>
            {erro ?? (esperando ? "Entrando..." : " ")}
          </Texto>
        </View>

        <View style={e.teclado}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "apagar"].map((t) =>
            t === "" ? (
              <View key="vazio" style={e.tecla} />
            ) : (
              <Pressable
                key={t}
                onPress={() => (t === "apagar" ? setPin((p) => p.slice(0, -1)) : digitar(t))}
                accessibilityRole="button"
                accessibilityLabel={t === "apagar" ? "Apagar" : t}
                style={({ pressed }) => [e.tecla, e.teclaAtiva, pressed && e.teclaApertada]}
              >
                <Texto style={t === "apagar" ? e.teclaApagar : e.teclaNumero}>{t === "apagar" ? "Apagar" : t}</Texto>
              </Pressable>
            ),
          )}
        </View>

        <Botao titulo="Não sou eu, trocar o código" variante="fantasma" onPress={trocarCodigo} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: cor.fundo, paddingTop: insets.top }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[e.formulario, { paddingTop: 32, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Simbolo tamanho={64} />
        <Titulo tamanho={26} style={{ textAlign: "center" }}>
          Entre na sua conta
        </Titulo>
        <Texto style={e.centro}>
          Digite o código que o professor ou a coordenação passou. Os novos têm quatro letras e quatro números.
        </Texto>
        <TextInput
          value={codigoDigitado}
          onChangeText={(texto) => {
            const normalizado = normalizarCodigoAcesso(texto);
            definirCodigoDigitado(codigoAcessoValido(normalizado) ? formatarCodigoAcesso(normalizado) : texto);
            setErro(null);
          }}
          onSubmitEditing={continuar}
          placeholder="BDFH-2468"
          placeholderTextColor={cor.textoFraco}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          maxLength={20}
          returnKeyType="next"
          accessibilityLabel="Código de acesso"
          accessibilityHint="Os códigos novos têm quatro letras, um hífen e quatro números. O hífen é opcional."
          style={e.codigo}
        />
        <Texto style={e.erro} accessibilityLiveRegion="polite" numberOfLines={2}>
          {erro ?? " "}
        </Texto>
        <Botao
          titulo="Continuar"
          onPress={continuar}
          carregando={esperando}
          disabled={codigo.length === 0}
          style={e.largo}
        />
        <Botao
          titulo="Experimentar demonstração"
          variante="fantasma"
          onPress={() => {
            continuarSemTurma();
            router.replace("/");
          }}
          style={e.largo}
        />
        <Texto style={e.centro}>O progresso da demonstração fica só neste aparelho.</Texto>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const e = criarEstilos(() => ({
  tela: { flex: 1, backgroundColor: cor.fundo, paddingHorizontal: 24, justifyContent: "space-between" },
  formulario: { flexGrow: 1, alignItems: "center", gap: 14, paddingHorizontal: 24 },
  topoPin: { alignItems: "center", gap: 8 },
  ola: { fontFamily: fonte.textoForte, color: cor.roxoEscuro, marginTop: 8 },
  centro: { textAlign: "center", color: cor.textoSuave },
  largo: { alignSelf: "stretch" },
  codigo: {
    alignSelf: "stretch",
    minHeight: 64,
    borderRadius: raio.g,
    borderWidth: 2,
    borderColor: cor.bordaForte,
    backgroundColor: cor.superficie,
    textAlign: "center",
    fontSize: 28,
    letterSpacing: 4,
    fontFamily: fonte.titulo,
    color: cor.tinta,
  },
  erro: { minHeight: 40, color: cor.pessegoEscuro, textAlign: "center", fontFamily: fonte.textoForte },
  pontos: { flexDirection: "row", gap: 18, marginTop: 16 },
  ponto: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: cor.roxo },
  pontoCheio: { backgroundColor: cor.roxo },
  teclado: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 },
  tecla: { width: "31%", height: 64, alignItems: "center", justifyContent: "center", borderRadius: raio.g },
  teclaAtiva: { backgroundColor: cor.superficie, borderWidth: 1, borderColor: cor.borda },
  teclaApertada: { backgroundColor: cor.roxoClaro, borderColor: cor.roxo },
  teclaNumero: { fontFamily: fonte.titulo, fontSize: 26, color: cor.tinta },
  teclaApagar: { fontFamily: fonte.textoForte, fontSize: 15, color: cor.textoSuave },
}));
