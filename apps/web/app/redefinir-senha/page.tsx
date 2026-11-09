import Link from "next/link";
import { FormularioRecuperacao } from "./formulario";

export default function RecuperarAcesso() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 p-6">
      <h1>Recuperar acesso</h1>
      <p>
        Defina sua senha pelo link enviado ao e-mail cadastrado pela escola. Confira a validade na mensagem; o link só
        pode ser usado uma vez.
      </p>
      <FormularioRecuperacao />
      <Link href="/entrar">Voltar para entrar</Link>
    </main>
  );
}
