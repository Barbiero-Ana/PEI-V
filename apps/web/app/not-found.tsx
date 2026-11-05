import { Simbolo } from "@/components/simbolo";
import { BotaoLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="flex flex-col items-center">
        <Simbolo estado="pensando" tamanho={110} />
        <h1 className="mt-6 text-3xl">Página não encontrada</h1>
        <p className="mt-2 text-texto-suave">O endereço pode ter mudado. Volte ao início do site.</p>
        <BotaoLink href="/" className="mt-6">
          Voltar ao início
        </BotaoLink>
      </div>
    </main>
  );
}
