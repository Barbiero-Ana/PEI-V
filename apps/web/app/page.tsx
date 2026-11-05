import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Simbolo } from "@/components/simbolo";
import { Wordmark } from "@/components/logo";
import { BotaoLink } from "@/components/ui";
import { Planos } from "@/components/site/planos";
import { EfeitosRolagem } from "@/components/site/efeitos";
import { Perguntas } from "@/components/site/perguntas";
import { Analise3D } from "@/components/site/analise-3d";
import { Rodape } from "@/components/site/rodape";
import { OndaDivisor, OndasAbertura, OndasFaixa } from "@/components/site/ondas";
import { CONTATO_EMAIL, SERVICOS_ADICIONAIS } from "@/lib/planos";
import meninaCelular from "@/public/fotos/menina-celular.webp";
import menino from "@/public/fotos/menino.webp";
import professora from "@/public/fotos/professora.webp";
import turmaMaos from "@/public/fotos/turma-maos.webp";
import turmaMesa from "@/public/fotos/turma-mesa.webp";
import meninoSala from "@/public/fotos/menino-sala.webp";
import meninoRiso from "@/public/fotos/menino-riso.webp";

/**
 * Página inicial do site: quem somos, o objetivo, como funciona, as soluções e
 * planos sem preço (lib/planos.ts), com demonstração e contato de vendas, e o acesso do professor.
 * O app do aluno é só para celular (ADR 0018). Fotos: Unsplash (licença livre),
 * recortadas com fundo transparente.
 */

export const metadata: Metadata = {
  title: "Modolume — Ideias que se iluminam",
  description:
    "Missões de Matemática no celular do aluno e um painel que mostra ao professor como cada aluno aprende. Conheça as soluções para a sua escola.",
};

const ACESSO_PROFESSOR = "/professor/entrar";
const contato = (assunto: string) => `mailto:${CONTATO_EMAIL}?subject=${encodeURIComponent(assunto)}`;

const FORMATOS = [
  { nome: "Associação visual", texto: "ligar imagens e símbolos aos conceitos" },
  { nome: "Montagem", texto: "juntar peças e blocos até formar a resposta" },
  { nome: "Sequência", texto: "colocar números e etapas na ordem certa" },
  { nome: "Manipulação", texto: "arrastar, posicionar e equilibrar objetos" },
  { nome: "Exploração 3D", texto: "girar e construir sólidos no espaço" },
  { nome: "Completar lacunas", texto: "preencher expressões e tabelas" },
  { nome: "Questão objetiva", texto: "escolher entre alternativas, como na prova" },
];

const PERGUNTAS = [
  {
    p: "O aluno precisa de internet para jogar?",
    r: "Não. O app guarda o progresso no aparelho e envia os resultados ao professor quando a conexão volta.",
  },
  {
    p: "Como o aluno entra na conta dele?",
    r: "Cada aluno recebe um código pessoal da escola e cria um PIN de 4 números no primeiro acesso. Não há lista de nomes nem e-mail. Se esquecer o PIN, o professor zera pelo painel.",
  },
  {
    p: "Funciona em iPhone?",
    r: "O aplicativo é para Android, com publicação na Google Play incluída. A versão para iPhone é opcional e combinada na proposta.",
  },
  {
    p: "Os resultados são um diagnóstico do aluno?",
    r: "Não. São referências pedagógicas: mostram em quais formatos de atividade o aluno acerta mais e onde tem mais dificuldade, para o professor decidir como ensinar e avaliar.",
  },
  {
    p: "E os dados dos alunos?",
    r: "O tratamento segue a LGPD e o instrumento de proteção de dados do contrato. O PIN nunca fica guardado como número, e cada professor vê apenas as próprias turmas.",
  },
  {
    p: "Posso pedir uma funcionalidade nova?",
    r: "Pode. Novas funcionalidades, integrações e mudanças de regra são avaliadas pela equipe e orçadas à parte, com aprovação antes de começar. A manutenção cobre correções, segurança e atualizações.",
  },
  {
    p: "Como funciona a contratação?",
    r: "A escola pode assinar, com hospedagem e manutenção incluídas, ou comprar a solução e manter uma mensalidade de hospedagem e manutenção. A equipe de vendas monta a proposta conforme o número de turmas e alunos.",
  },
];

export default function Inicio() {
  return (
    <div className="relative overflow-x-clip">
      <EfeitosRolagem />
      <OndasAbertura id="abertura" className="flutuar" />

      {/* barra fixa no topo; ganha borda e sombra depois de rolar (html.rolou) */}
      <header data-topo className="sticky top-0 z-40 border-b border-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <Link href="/" className="inline-flex items-end gap-2" aria-label="Modolume, início">
            <Simbolo tamanho={38} rotulo="" />
            <Wordmark className="text-[1.5rem] leading-none" />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Seções">
            {[
              ["#sobre", "Sobre", "lg:block"],
              ["#como-funciona", "Como funciona", "lg:block"],
              ["#planos", "Planos", "sm:block"],
            ].map(([href, rotulo, mostra]) => (
              <a
                key={href}
                href={href}
                className={`hidden rounded-xl px-3 py-3 text-sm font-medium text-texto-suave hover:text-tinta ${mostra}`}
              >
                {rotulo}
              </a>
            ))}
            <BotaoLink href={ACESSO_PROFESSOR} className="min-h-11 whitespace-nowrap px-4 py-2.5">
              {/* no celular, o rótulo curto cabe numa linha ao lado da marca */}
              <span className="sm:hidden">Professor</span>
              <span className="hidden sm:inline">Acesso do professor</span>
            </BotaoLink>
          </nav>
        </div>
      </header>

      <main id="conteudo" className="relative">
        {/* abertura */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-12">
          <div data-rolagem="saida">
            <h1 data-revelar className="text-[2.6rem] leading-[1.08] sm:text-6xl">
              Ideias que se <span className="text-roxo">iluminam.</span>
            </h1>
            <p data-revelar style={atraso(120)} className="mt-6 max-w-xl text-lg leading-relaxed text-texto-suave">
              O Modolume ajuda a escola a entender como cada aluno aprende de verdade. No celular, o aluno joga missões
              de Matemática. No painel, o professor descobre em quais formatos cada um compreende melhor e onde precisa
              de apoio.
            </p>
            <div data-revelar style={atraso(240)} className="mt-8 flex flex-wrap gap-3">
              <BotaoLink href="#planos" className="min-h-12">
                Conhecer os planos
              </BotaoLink>
              <BotaoLink href="#sobre" variante="secundario" className="min-h-12">
                Por que o Modolume
              </BotaoLink>
            </div>
          </div>

          <div data-revelar="crescer" style={atraso(150)} className="relative mx-auto w-full max-w-[440px]">
            <div
              aria-hidden
              data-rolagem="parallax"
              style={forca(-50)}
              className="absolute inset-x-[6%] bottom-0 top-[14%] rounded-full bg-lilas-claro"
            />
            <div aria-hidden className="absolute right-[2%] top-[6%] size-24 rounded-full bg-pessego-claro" />
            <div aria-hidden className="absolute bottom-[10%] left-0 size-16 rounded-full bg-azul-claro" />
            <Image
              src={meninaCelular}
              alt="Menina sentada no chão jogando no celular"
              priority
              sizes="(min-width: 1024px) 440px, 90vw"
              data-rolagem="parallax"
              style={forca(40)}
              className="relative mx-auto h-auto w-[88%]"
            />
            <Etiqueta forcaRolagem={140} className="left-0 top-[22%] sm:-left-6">
              <span className="grid size-8 place-items-center rounded-full bg-pessego-claro">
                <Estrela />
              </span>
              <span>
                <span className="block font-display text-sm font-semibold text-tinta">Estrela acesa!</span>
                <span className="block text-xs text-texto-suave">Órion, 4 de 7</span>
              </span>
            </Etiqueta>
            <Etiqueta forcaRolagem={-120} className="bottom-[8%] right-0 sm:-right-4">
              <span className="block">
                <span className="block text-xs text-texto-suave">Aprende melhor</span>
                <span className="block font-display text-sm font-semibold text-tinta">manipulando objetos</span>
              </span>
              <span className="font-display text-lg font-semibold text-roxo">92%</span>
            </Etiqueta>
          </div>
        </section>

        {/* sobre */}
        <section
          id="sobre"
          className="mx-auto grid max-w-6xl scroll-mt-24 items-center gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]"
        >
          <div data-revelar="esquerda" className="relative mx-auto w-full max-w-[380px]">
            <div aria-hidden className="absolute inset-x-0 bottom-0 top-[18%] rounded-[3rem] bg-azul-claro" />
            <div
              aria-hidden
              data-rolagem="parallax"
              style={forca(160)}
              className="absolute -right-3 top-[10%] size-20 rounded-full bg-lilas-claro"
            />
            <Image
              src={professora}
              alt="Professora sorrindo em frente a um quadro com contas de Matemática"
              sizes="(min-width: 1024px) 300px, 65vw"
              className="relative mx-auto h-auto w-[78%]"
            />
          </div>
          <div data-revelar>
            <h2 className="text-3xl leading-tight sm:text-4xl">
              Uma prova mostra o erro. <span className="text-roxo">O Modolume mostra o porquê.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-texto-suave">
              Dois alunos podem errar a mesma conta por motivos diferentes: um não entendeu a ideia, o outro entende
              quando pode mexer nas peças, mas trava no papel. O Modolume nasceu para mostrar essa diferença à escola,
              de um jeito leve para o aluno e objetivo para o professor.
            </p>
            <ul className="mt-8 grid gap-5 sm:grid-cols-3">
              {[
                [
                  "bg-roxo",
                  "Lúdico de verdade",
                  "Missões curtas, céu de constelações e um mascote que ajuda sem dar a resposta.",
                ],
                [
                  "bg-pessego",
                  "Leitura pedagógica",
                  "Cada jogada registra formato, tentativas e tempo, sem tirar ponto por pedir dica.",
                ],
                [
                  "bg-azul",
                  "Feito para a escola",
                  "Planejamento com a BNCC, atividades do professor e indicadores com metas.",
                ],
              ].map(([cor, titulo, texto], i) => (
                <li key={titulo} data-revelar style={atraso(150 + i * 120)} className="border-l-2 border-borda pl-4">
                  <span aria-hidden className={`mb-3 block h-1.5 w-8 rounded-full ${cor}`} />
                  <h3 className="text-lg">{titulo}</h3>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-texto-suave">{texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* formatos */}
        <OndaDivisor id="onda-formatos-entra" cor="#1E2A78" className="-mb-px" />
        <section aria-labelledby="titulo-formatos" className="relative overflow-hidden bg-tinta text-white">
          <OndasFaixa id="ondas-formatos" className="opacity-35" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
            {/* o título fica parado enquanto a lista passa (telas largas) */}
            <div data-revelar className="lg:sticky lg:top-32 lg:self-start">
              <h2 id="titulo-formatos" className="text-3xl leading-tight text-white sm:text-4xl">
                Sete jeitos de resolver. Cada aluno se ilumina em um.
              </h2>
              <p className="mt-5 max-w-md leading-relaxed text-lilas">
                As missões partem de situações do dia a dia, como o troco do mercadinho, a pizza dividida e a jarra
                medidora. Cada uma usa um formato. Com o tempo, o painel mostra em quais o aluno compreende melhor.
              </p>
            </div>
            <ol className="grid gap-x-8 sm:grid-cols-2">
              {FORMATOS.map((f, i) => (
                <li
                  key={f.nome}
                  data-revelar
                  style={atraso((i % 2) * 120 + Math.floor(i / 2) * 60)}
                  className="flex gap-4 border-b border-white/10 py-4"
                >
                  <span className="font-display text-sm font-semibold text-pessego">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="block font-display font-semibold text-white">{f.nome}</span>
                    <span className="block text-sm text-lilas">{f.texto}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <OndaDivisor id="onda-formatos-sai" cor="#1E2A78" invertida className="-mt-px" />

        {/* análise: pentagrama em 3D */}
        <section id="analise" aria-labelledby="titulo-analise" className="relative scroll-mt-24 overflow-x-clip">
          <div
            aria-hidden
            className="flutuar pointer-events-none absolute -right-40 top-10 size-[520px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#E9DDFF,transparent_65%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-32 bottom-0 size-[420px] rounded-full bg-[radial-gradient(circle_at_60%_40%,#DDF2FF,transparent_65%)]"
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div data-revelar="esquerda">
              <p className="font-display text-sm font-semibold text-roxo">Análise de aprendizagem</p>
              <h2 id="titulo-analise" className="mt-2 text-3xl leading-tight sm:text-4xl">
                Cinco jeitos de aprender, <span className="text-roxo">num só desenho.</span>
              </h2>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-texto-suave">
                O pentagrama junta os sete formatos em cinco jeitos de aprender: visual, mãos na massa, lógico,
                simbólico e espacial. O professor compara cada aluno com a média da turma, vê onde ele brilha e onde
                precisa de apoio.
              </p>
              <ul className="mt-8 flex flex-col gap-4">
                {[
                  ["bg-roxo", "Atualizado a cada jogada", "Os resultados chegam do app e o desenho muda sozinho."],
                  ["bg-pessego", "Comparação com a turma", "O tracejado mostra a média da turma em cada jeito."],
                  ["bg-azul", "Sugestões, não rótulos", "Ideias práticas para a próxima aula, sem diagnóstico."],
                ].map(([cor, titulo, texto], i) => (
                  <li key={titulo} data-revelar style={atraso(150 + i * 120)} className="flex gap-4">
                    <span aria-hidden className={`mt-1.5 size-3 shrink-0 rounded-full ${cor}`} />
                    <span>
                      <span className="block font-display font-semibold text-tinta">{titulo}</span>
                      <span className="block text-texto-suave">{texto}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Analise3D />
          </div>
        </section>

        {/* para quem */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
          <h2 data-revelar className="max-w-2xl text-3xl leading-tight sm:text-4xl">
            Uma ponte entre quem aprende e quem ensina
          </h2>
          <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
            <div data-revelar="esquerda">
              <p className="font-display text-sm font-semibold text-roxo">Para o aluno</p>
              <h3 className="mt-2 text-2xl">Praticar parece brincadeira</h3>
              <p className="mt-3 max-w-lg leading-relaxed text-texto-suave">
                A cada missão o aluno junta pontos de luz e acende as estrelas de uma constelação. Tem desafio do dia,
                álbum do céu e a lâmpada de dica sempre à mão. Tudo com acessibilidade: texto maior, leitura em voz
                alta, alto contraste e menos animação.
              </p>
            </div>
            <div data-revelar="direita" className="relative mx-auto flex w-full max-w-[460px] items-end justify-center">
              <div aria-hidden className="absolute inset-x-[4%] bottom-0 top-[25%] rounded-[3rem] bg-pessego-claro" />
              <Image
                src={menino}
                alt="Menino sorrindo"
                sizes="(min-width: 1024px) 260px, 50vw"
                data-rolagem="parallax"
                style={forca(30)}
                className="relative -mr-10 h-auto w-[55%]"
              />
              <div data-rolagem="parallax" style={forca(-90)} className="relative mb-6 w-[48%]">
                <Celular />
              </div>
            </div>
          </div>

          <div className="mt-20 grid items-center gap-12 lg:grid-cols-2">
            <MiniPainel />
            <div data-revelar="esquerda" className="lg:order-first">
              <p className="font-display text-sm font-semibold text-roxo">Para o professor</p>
              <h3 className="mt-2 text-2xl">Saber como ensinar cada um</h3>
              <p className="mt-3 max-w-lg leading-relaxed text-texto-suave">
                O painel mostra a turma por formato de atividade, aponta quem precisa de atenção e ajuda a montar planos
                de aula e provas nos formatos que funcionam. O professor também cria atividades e envia direto para o
                app dos alunos.
              </p>
              <p className="mt-6 font-display text-sm font-semibold text-roxo">Para a gestão da escola</p>
              <p className="mt-2 max-w-lg leading-relaxed text-texto-suave">
                Indicadores com metas comparam as últimas semanas e mostram a evolução de cada turma, para decidir com
                dados onde investir tempo e apoio.
              </p>
            </div>
          </div>
        </section>

        {/* galeria */}
        <section aria-label="Na sala de aula" className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
          <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr] md:grid-rows-[auto_auto]">
            {/* a foto alta ocupa as duas linhas sem esticar a grade */}
            <div data-rolagem="zoom" className="relative h-80 overflow-hidden rounded-[2.5rem] md:row-span-2 md:h-auto">
              <Image
                src={meninoSala}
                alt="Menino sorrindo na sala de aula, com colegas ao fundo"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover object-[50%_35%]"
              />
            </div>
            <Image
              src={turmaMaos}
              alt="Turma levantando a mão para responder à professora"
              sizes="(min-width: 768px) 60vw, 100vw"
              data-rolagem="zoom"
              className="h-64 w-full rounded-[2.5rem] rounded-tr-[6rem] object-cover md:h-80"
            />
            <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
              <blockquote
                data-revelar="crescer"
                className="flex flex-col justify-center rounded-[2.5rem] bg-pessego-claro p-7"
              >
                <p className="font-display text-xl leading-snug text-tinta">
                  “Aprender Matemática fica mais fácil quando dá para ver, mexer e tentar de novo.”
                </p>
                <footer className="mt-3 text-sm text-texto-suave">A ideia por trás de cada missão</footer>
              </blockquote>
              <Image
                src={turmaMesa}
                alt="Crianças trabalhando juntas numa mesa da sala de aula"
                sizes="(min-width: 768px) 30vw, 100vw"
                data-rolagem="zoom"
                className="h-56 w-full rounded-[2.5rem] rounded-bl-[6rem] object-cover sm:h-full"
              />
            </div>
          </div>
        </section>

        {/* como funciona */}
        <section id="como-funciona" className="scroll-mt-24 border-y border-borda bg-superficie/70">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
            <h2 data-revelar className="max-w-xl text-3xl sm:text-4xl">
              Do celular do aluno ao planejamento da aula
            </h2>
            <ol className="relative mt-12 grid gap-10 md:grid-cols-4 md:gap-8">
              <span
                aria-hidden
                data-revelar="linha"
                className="absolute left-6 right-6 top-6 hidden h-0.5 origin-left bg-borda-forte md:block"
              />
              {[
                [
                  "bg-lilas",
                  "A escola entrega os códigos",
                  "Cada aluno recebe o seu código pessoal e cria um PIN no primeiro acesso.",
                ],
                [
                  "bg-roxo",
                  "O aluno joga no app",
                  "Missões curtas em oito mapas. O mascote Lilo ajuda quando a resposta não sai.",
                ],
                [
                  "bg-pessego",
                  "O professor acompanha",
                  "Envia atividades e vê, no mesmo dia, quem acertou e quem precisa de outra explicação.",
                ],
                [
                  "bg-azul",
                  "A aula muda",
                  "Planos e provas nos formatos que funcionam para a turma e atenção para quem mais precisa.",
                ],
              ].map(([cor, titulo, texto], i) => (
                <li key={titulo} data-revelar style={atraso(200 + i * 160)} className="relative">
                  <span
                    className={`relative grid size-12 place-items-center rounded-full font-display text-lg font-semibold text-tinta ring-8 ring-fundo ${cor}`}
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-xl">{titulo}</h3>
                  <p className="mt-2 leading-relaxed text-texto-suave">{texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* planos */}
        <section id="planos" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-8">
          <h2 data-revelar className="text-3xl sm:text-4xl">
            Planos para a sua escola
          </h2>
          <p data-revelar style={atraso(100)} className="mb-8 mt-3 max-w-2xl text-texto-suave">
            Três soluções para o momento da sua escola. A proposta é feita sob medida, conforme o número de turmas e
            alunos.
          </p>
          <Planos />

          <div className="mt-14 border-t border-borda pt-12">
            <h3 className="text-xl">Serviços adicionais</h3>
            <ul className="mt-5 grid gap-6 md:grid-cols-3">
              {SERVICOS_ADICIONAIS.map((x, i) => (
                <li key={x.nome} data-revelar style={atraso(i * 120)} className="border-l-2 border-lilas pl-4">
                  <p className="font-display font-semibold text-tinta">{x.nome}</p>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-texto-suave">{x.detalhe}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* perguntas */}
        <section aria-labelledby="titulo-perguntas" className="mx-auto max-w-3xl px-4 pb-20 sm:px-8">
          <h2 id="titulo-perguntas" data-revelar className="text-3xl sm:text-4xl">
            Perguntas frequentes
          </h2>
          <div data-revelar className="mt-8">
            <Perguntas itens={PERGUNTAS} />
          </div>
        </section>

        {/* fechamento */}
        <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-8">
          <div data-revelar="crescer" className="relative rounded-[2.5rem] bg-roxo px-7 py-12 sm:px-12">
            <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[2.5rem]">
              <OndasFaixa id="ondas-fechamento" />
            </div>
            {/* a criança "sai" da faixa por cima */}
            <Image
              src={meninoRiso}
              alt=""
              sizes="300px"
              data-rolagem="parallax"
              style={forca(70)}
              className="pointer-events-none absolute bottom-0 right-10 hidden h-[125%] w-auto md:block lg:right-20"
            />
            <div className="relative max-w-xl">
              <h2 className="text-3xl leading-tight text-white sm:text-4xl">Vamos iluminar as ideias da sua escola?</h2>
              <p className="mt-4 leading-relaxed text-white/85">
                Conte quantas turmas e alunos vocês têm. A equipe responde com a proposta e uma demonstração do app e do
                painel.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={contato("Quero uma demonstração do Modolume")}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-pessego px-5 py-3 font-display text-[0.95rem] font-semibold text-tinta hover:bg-[#ff9d66]"
                >
                  Solicite uma demo
                </a>
                <Link
                  href={ACESSO_PROFESSOR}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 px-5 py-3 font-display text-[0.95rem] font-semibold text-white hover:bg-white/10"
                >
                  Já uso: acesso do professor
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Rodape />
    </div>
  );
}

/** Atraso da entrada (ms) e força da paralaxe (px), lidos pelo CSS dos efeitos. */
const atraso = (ms: number) => ({ "--atraso": `${ms}ms` }) as CSSProperties;
const forca = (px: number) => ({ "--forca": `${px}px` }) as CSSProperties;

function Etiqueta({
  className = "",
  forcaRolagem,
  children,
}: {
  className?: string;
  forcaRolagem: number;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden
      data-rolagem="parallax"
      style={forca(forcaRolagem)}
      className={`absolute flex items-center gap-3 rounded-2xl bg-superficie px-3.5 py-2.5 shadow-[0_18px_40px_-20px_rgb(30_42_120/0.45)] ${className}`}
    >
      {children}
    </div>
  );
}

function Estrela() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
      <path d="M10 1.8l2.4 5 5.4.6-4 3.7 1.1 5.4L10 13.8l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" fill="#FFAC7A" />
    </svg>
  );
}

/** Recorte do painel do professor: acertos da turma por formato. */
function MiniPainel() {
  const barras: [string, number, string][] = [
    ["Manipulação", 86, "bg-roxo"],
    ["Associação visual", 78, "bg-lilas"],
    ["Exploração 3D", 64, "bg-azul"],
    ["Questão objetiva", 49, "bg-pessego"],
  ];
  return (
    <div aria-hidden data-revelar="direita" className="relative mx-auto w-full max-w-[480px]">
      <div className="absolute -left-6 -top-6 size-28 rounded-full bg-lilas-claro" />
      <div className="relative rounded-[2rem] border border-borda bg-superficie p-6 shadow-[0_30px_70px_-40px_rgb(30_42_120/0.6)]">
        <div className="flex items-center justify-between">
          <p className="font-display font-semibold text-tinta">6º Ano A · acertos por formato</p>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-suave px-2.5 py-1 text-xs text-texto-suave">
            4 semanas
          </span>
        </div>
        <ul className="mt-5 flex flex-col gap-4">
          {barras.map(([nome, v, cor]) => (
            <li key={nome}>
              <div className="flex justify-between text-sm">
                <span className="text-texto">{nome}</span>
                <span className="font-semibold text-tinta">{v}%</span>
              </div>
              <div className="mt-1.5 h-2.5 rounded-full bg-suave">
                <div className={`barra h-full rounded-full ${cor}`} style={{ width: `${v}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-pessego-claro px-4 py-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-pessego font-display text-sm font-semibold text-tinta">
            3
          </span>
          <p className="text-sm text-tinta">alunos precisam de atenção em questões objetivas</p>
        </div>
      </div>
    </div>
  );
}

/** Celular com o céu de Órion, como o aluno vê no app. */
function Celular() {
  const estrelas: [number, number, boolean][] = [
    [62, 70, true],
    [172, 62, true],
    [96, 128, true],
    [140, 124, true],
    [118, 150, false],
    [74, 206, false],
    [168, 200, false],
  ];
  const linhas: [number, number][] = [
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 4],
    [4, 5],
    [4, 6],
  ];
  return (
    <div
      aria-hidden
      className="rounded-[2rem] border-[7px] border-tinta bg-tinta shadow-[0_40px_80px_-40px_rgb(30_42_120/0.8)]"
    >
      <div className="rounded-[1.5rem] bg-[#151d5c] px-3.5 pb-4 pt-5">
        <p className="font-display text-xs text-lilas">Oi, Bernardo.</p>
        <svg viewBox="0 0 230 250" className="mt-2 w-full">
          {linhas.map(([a, b]) => {
            const acesa = estrelas[a]![2] && estrelas[b]![2];
            return (
              <line
                key={`${a}-${b}`}
                x1={estrelas[a]![0]}
                y1={estrelas[a]![1]}
                x2={estrelas[b]![0]}
                y2={estrelas[b]![1]}
                stroke={acesa ? "#C9B4FF" : "#3A4590"}
                strokeWidth={acesa ? 2.5 : 2}
                strokeDasharray={acesa ? undefined : "4 5"}
              />
            );
          })}
          {estrelas.map(([x, y, acesa]) =>
            acesa ? (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="13" fill="#FFAC7A" opacity="0.2" />
                <circle cx={x} cy={y} r="6" fill="#FFF4EA" />
              </g>
            ) : (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" fill="none" stroke="#5A64AE" strokeWidth="2" />
            ),
          )}
        </svg>
        <p className="font-display text-lg font-semibold text-white">Órion</p>
        <p className="text-xs text-lilas">4 de 7 estrelas</p>
        <div className="mt-3 rounded-xl bg-white px-3 py-2">
          <p className="text-[0.65rem] font-medium text-azul-escuro">Próxima missão</p>
          <p className="font-display text-sm font-semibold text-tinta">Mercadinho</p>
        </div>
      </div>
    </div>
  );
}
