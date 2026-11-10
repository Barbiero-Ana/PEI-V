-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "periodo" AS ENUM ('manhã', 'tarde', 'integral');

-- CreateEnum
CREATE TYPE "origem_jogada" AS ENUM ('mapa', 'professor');

-- CreateEnum
CREATE TYPE "status_atividade" AS ENUM ('rascunho', 'enviada');

-- CreateEnum
CREATE TYPE "tipo_questao" AS ENUM ('objetiva', 'completar', 'associacao-visual', 'sequencia');

-- CreateEnum
CREATE TYPE "status_plano" AS ENUM ('rascunho', 'planejada', 'realizada');

-- CreateTable
CREATE TABLE "formato_atividade" (
    "id" VARCHAR(40) NOT NULL,
    "rotulo" VARCHAR(80) NOT NULL,

    CONSTRAINT "formato_atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mapa" (
    "numero" SMALLINT NOT NULL,
    "titulo" VARCHAR(80) NOT NULL,
    "constelacao" VARCHAR(40) NOT NULL,

    CONSTRAINT "mapa_pkey" PRIMARY KEY ("numero")
);

-- CreateTable
CREATE TABLE "missao" (
    "id" VARCHAR(60) NOT NULL,
    "mapa_numero" SMALLINT NOT NULL,
    "formato_id" VARCHAR(40) NOT NULL,
    "titulo" VARCHAR(120) NOT NULL,
    "conteudo" VARCHAR(200) NOT NULL,
    "ordem" SMALLINT NOT NULL,

    CONSTRAINT "missao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habilidade_bncc" (
    "codigo" VARCHAR(12) NOT NULL,
    "resumo" VARCHAR(200) NOT NULL,

    CONSTRAINT "habilidade_bncc_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "unidade_tematica" (
    "nome" VARCHAR(60) NOT NULL,

    CONSTRAINT "unidade_tematica_pkey" PRIMARY KEY ("nome")
);

-- CreateTable
CREATE TABLE "instituicao" (
    "id" VARCHAR(40) NOT NULL,
    "nome" VARCHAR(160) NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instituicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professor" (
    "id" VARCHAR(40) NOT NULL,
    "instituicao_id" VARCHAR(40) NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(160) NOT NULL,
    "senha_hash" VARCHAR(100) NOT NULL,
    "disciplina" VARCHAR(60) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "turma" (
    "id" VARCHAR(40) NOT NULL,
    "instituicao_id" VARCHAR(40) NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "serie" VARCHAR(30) NOT NULL,
    "periodo" "periodo" NOT NULL,
    "ano_letivo" SMALLINT NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professor_turma" (
    "professor_id" VARCHAR(40) NOT NULL,
    "turma_id" VARCHAR(40) NOT NULL,
    "responsavel" BOOLEAN NOT NULL DEFAULT true,
    "desde" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professor_turma_pkey" PRIMARY KEY ("professor_id","turma_id")
);

-- CreateTable
CREATE TABLE "aluno" (
    "id" VARCHAR(40) NOT NULL,
    "turma_id" VARCHAR(40) NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "matricula" VARCHAR(30) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "luzes_gastas" INTEGER NOT NULL DEFAULT 0,
    "ultimo_acesso" TIMESTAMPTZ(3),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avatar_aluno" (
    "aluno_id" VARCHAR(40) NOT NULL,
    "pele" SMALLINT NOT NULL,
    "cabelo" VARCHAR(30) NOT NULL,
    "cor_cabelo" SMALLINT NOT NULL,
    "olhos" VARCHAR(30) NOT NULL,
    "boca" VARCHAR(30) NOT NULL,
    "acessorio" VARCHAR(30) NOT NULL,
    "fundo" SMALLINT NOT NULL,
    "capa" SMALLINT,
    "svg" TEXT NOT NULL,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "avatar_aluno_pkey" PRIMARY KEY ("aluno_id")
);

-- CreateTable
CREATE TABLE "progresso_missao" (
    "aluno_id" VARCHAR(40) NOT NULL,
    "missao_id" VARCHAR(60) NOT NULL,
    "estrelas" SMALLINT NOT NULL,
    "vezes" INTEGER NOT NULL,
    "melhor_acerto" SMALLINT NOT NULL,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "progresso_missao_pkey" PRIMARY KEY ("aluno_id","missao_id")
);

-- CreateTable
CREATE TABLE "pontos_mapa" (
    "aluno_id" VARCHAR(40) NOT NULL,
    "mapa_numero" SMALLINT NOT NULL,
    "pontos" INTEGER NOT NULL,

    CONSTRAINT "pontos_mapa_pkey" PRIMARY KEY ("aluno_id","mapa_numero")
);

-- CreateTable
CREATE TABLE "constelacao_conquistada" (
    "aluno_id" VARCHAR(40) NOT NULL,
    "mapa_numero" SMALLINT NOT NULL,
    "data" DATE NOT NULL,

    CONSTRAINT "constelacao_conquistada_pkey" PRIMARY KEY ("aluno_id","mapa_numero")
);

-- CreateTable
CREATE TABLE "desafio_concluido" (
    "aluno_id" VARCHAR(40) NOT NULL,
    "data" DATE NOT NULL,
    "missao_id" VARCHAR(60) NOT NULL,

    CONSTRAINT "desafio_concluido_pkey" PRIMARY KEY ("aluno_id","data")
);

-- CreateTable
CREATE TABLE "compra_loja" (
    "aluno_id" VARCHAR(40) NOT NULL,
    "item_id" VARCHAR(60) NOT NULL,
    "comprada_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compra_loja_pkey" PRIMARY KEY ("aluno_id","item_id")
);

-- CreateTable
CREATE TABLE "jogada" (
    "id" VARCHAR(80) NOT NULL,
    "aluno_id" VARCHAR(40) NOT NULL,
    "origem" "origem_jogada" NOT NULL,
    "missao_id" VARCHAR(60),
    "atividade_id" VARCHAR(40),
    "formato_id" VARCHAR(40) NOT NULL,
    "titulo" VARCHAR(160) NOT NULL,
    "rodadas" SMALLINT NOT NULL,
    "acertos_de_primeira" SMALLINT NOT NULL,
    "tentativas" SMALLINT NOT NULL,
    "percentual_conclusao" SMALLINT NOT NULL,
    "percentual_acerto" SMALLINT NOT NULL,
    "tempo_segundos" INTEGER NOT NULL,
    "estrelas" SMALLINT NOT NULL,
    "dicas" SMALLINT NOT NULL DEFAULT 0,
    "data" DATE NOT NULL,
    "recebida_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jogada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividade_professor" (
    "id" VARCHAR(40) NOT NULL,
    "professor_id" VARCHAR(40) NOT NULL,
    "titulo" VARCHAR(160) NOT NULL,
    "formato" VARCHAR(40) NOT NULL,
    "instrucao" VARCHAR(400) NOT NULL DEFAULT '',
    "habilidade_codigo" VARCHAR(12),
    "missao_id" VARCHAR(60),
    "plano_id" VARCHAR(40),
    "liberar_em" DATE NOT NULL,
    "status" "status_atividade" NOT NULL DEFAULT 'rascunho',
    "enviada_em" TIMESTAMPTZ(3),
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "atividade_professor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atividade_turma" (
    "atividade_id" VARCHAR(40) NOT NULL,
    "turma_id" VARCHAR(40) NOT NULL,

    CONSTRAINT "atividade_turma_pkey" PRIMARY KEY ("atividade_id","turma_id")
);

-- CreateTable
CREATE TABLE "questao_atividade" (
    "id" SERIAL NOT NULL,
    "atividade_id" VARCHAR(40) NOT NULL,
    "ordem" SMALLINT NOT NULL,
    "tipo" "tipo_questao" NOT NULL,
    "comando" VARCHAR(200) NOT NULL DEFAULT '',
    "enunciado" VARCHAR(1000),
    "texto" VARCHAR(1000),

    CONSTRAINT "questao_atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opcao_questao" (
    "id" SERIAL NOT NULL,
    "questao_id" INTEGER NOT NULL,
    "ordem" SMALLINT NOT NULL,
    "texto" VARCHAR(300) NOT NULL,
    "par" VARCHAR(300),
    "correta" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "opcao_questao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plano_aula" (
    "id" VARCHAR(40) NOT NULL,
    "professor_id" VARCHAR(40) NOT NULL,
    "turma_id" VARCHAR(40) NOT NULL,
    "data" DATE NOT NULL,
    "horario" VARCHAR(5) NOT NULL DEFAULT '',
    "aulas" SMALLINT NOT NULL,
    "tema" VARCHAR(200) NOT NULL,
    "unidade" VARCHAR(60) NOT NULL,
    "objetivos" TEXT NOT NULL DEFAULT '',
    "conteudos" TEXT NOT NULL DEFAULT '',
    "metodologia" TEXT NOT NULL DEFAULT '',
    "recursos" TEXT NOT NULL DEFAULT '',
    "avaliacao" TEXT NOT NULL DEFAULT '',
    "observacoes" TEXT NOT NULL DEFAULT '',
    "status" "status_plano" NOT NULL DEFAULT 'planejada',
    "registro" TEXT NOT NULL DEFAULT '',
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "plano_aula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plano_habilidade" (
    "plano_id" VARCHAR(40) NOT NULL,
    "habilidade_codigo" VARCHAR(12) NOT NULL,

    CONSTRAINT "plano_habilidade_pkey" PRIMARY KEY ("plano_id","habilidade_codigo")
);

-- CreateTable
CREATE TABLE "plano_formato" (
    "plano_id" VARCHAR(40) NOT NULL,
    "formato_id" VARCHAR(40) NOT NULL,

    CONSTRAINT "plano_formato_pkey" PRIMARY KEY ("plano_id","formato_id")
);

-- CreateTable
CREATE TABLE "plano_missao" (
    "plano_id" VARCHAR(40) NOT NULL,
    "missao_id" VARCHAR(60) NOT NULL,

    CONSTRAINT "plano_missao_pkey" PRIMARY KEY ("plano_id","missao_id")
);

-- CreateTable
CREATE TABLE "plano_aluno_foco" (
    "plano_id" VARCHAR(40) NOT NULL,
    "aluno_id" VARCHAR(40) NOT NULL,

    CONSTRAINT "plano_aluno_foco_pkey" PRIMARY KEY ("plano_id","aluno_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mapa_constelacao_key" ON "mapa"("constelacao");

-- CreateIndex
CREATE UNIQUE INDEX "missao_mapa_numero_ordem_key" ON "missao"("mapa_numero", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "professor_email_key" ON "professor"("email");

-- CreateIndex
CREATE INDEX "professor_instituicao_id_idx" ON "professor"("instituicao_id");

-- CreateIndex
CREATE UNIQUE INDEX "turma_codigo_key" ON "turma"("codigo");

-- CreateIndex
CREATE INDEX "turma_instituicao_id_idx" ON "turma"("instituicao_id");

-- CreateIndex
CREATE INDEX "professor_turma_turma_id_idx" ON "professor_turma"("turma_id");

-- CreateIndex
CREATE INDEX "aluno_turma_id_idx" ON "aluno"("turma_id");

-- CreateIndex
CREATE UNIQUE INDEX "aluno_turma_id_matricula_key" ON "aluno"("turma_id", "matricula");

-- CreateIndex
CREATE INDEX "jogada_aluno_id_data_idx" ON "jogada"("aluno_id", "data");

-- CreateIndex
CREATE INDEX "jogada_atividade_id_idx" ON "jogada"("atividade_id");

-- CreateIndex
CREATE INDEX "jogada_missao_id_idx" ON "jogada"("missao_id");

-- CreateIndex
CREATE INDEX "atividade_professor_professor_id_idx" ON "atividade_professor"("professor_id");

-- CreateIndex
CREATE INDEX "atividade_professor_status_liberar_em_idx" ON "atividade_professor"("status", "liberar_em");

-- CreateIndex
CREATE INDEX "atividade_turma_turma_id_idx" ON "atividade_turma"("turma_id");

-- CreateIndex
CREATE UNIQUE INDEX "questao_atividade_atividade_id_ordem_key" ON "questao_atividade"("atividade_id", "ordem");

-- CreateIndex
CREATE UNIQUE INDEX "opcao_questao_questao_id_ordem_key" ON "opcao_questao"("questao_id", "ordem");

-- CreateIndex
CREATE INDEX "plano_aula_professor_id_data_idx" ON "plano_aula"("professor_id", "data");

-- CreateIndex
CREATE INDEX "plano_aula_turma_id_idx" ON "plano_aula"("turma_id");

-- AddForeignKey
ALTER TABLE "missao" ADD CONSTRAINT "missao_mapa_numero_fkey" FOREIGN KEY ("mapa_numero") REFERENCES "mapa"("numero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missao" ADD CONSTRAINT "missao_formato_id_fkey" FOREIGN KEY ("formato_id") REFERENCES "formato_atividade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor" ADD CONSTRAINT "professor_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turma" ADD CONSTRAINT "turma_instituicao_id_fkey" FOREIGN KEY ("instituicao_id") REFERENCES "instituicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor_turma" ADD CONSTRAINT "professor_turma_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor_turma" ADD CONSTRAINT "professor_turma_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aluno" ADD CONSTRAINT "aluno_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avatar_aluno" ADD CONSTRAINT "avatar_aluno_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_missao" ADD CONSTRAINT "progresso_missao_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progresso_missao" ADD CONSTRAINT "progresso_missao_missao_id_fkey" FOREIGN KEY ("missao_id") REFERENCES "missao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontos_mapa" ADD CONSTRAINT "pontos_mapa_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pontos_mapa" ADD CONSTRAINT "pontos_mapa_mapa_numero_fkey" FOREIGN KEY ("mapa_numero") REFERENCES "mapa"("numero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constelacao_conquistada" ADD CONSTRAINT "constelacao_conquistada_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constelacao_conquistada" ADD CONSTRAINT "constelacao_conquistada_mapa_numero_fkey" FOREIGN KEY ("mapa_numero") REFERENCES "mapa"("numero") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desafio_concluido" ADD CONSTRAINT "desafio_concluido_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desafio_concluido" ADD CONSTRAINT "desafio_concluido_missao_id_fkey" FOREIGN KEY ("missao_id") REFERENCES "missao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_loja" ADD CONSTRAINT "compra_loja_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogada" ADD CONSTRAINT "jogada_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogada" ADD CONSTRAINT "jogada_missao_id_fkey" FOREIGN KEY ("missao_id") REFERENCES "missao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogada" ADD CONSTRAINT "jogada_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade_professor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogada" ADD CONSTRAINT "jogada_formato_id_fkey" FOREIGN KEY ("formato_id") REFERENCES "formato_atividade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_professor" ADD CONSTRAINT "atividade_professor_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_professor" ADD CONSTRAINT "atividade_professor_habilidade_codigo_fkey" FOREIGN KEY ("habilidade_codigo") REFERENCES "habilidade_bncc"("codigo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_professor" ADD CONSTRAINT "atividade_professor_missao_id_fkey" FOREIGN KEY ("missao_id") REFERENCES "missao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_professor" ADD CONSTRAINT "atividade_professor_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "plano_aula"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_turma" ADD CONSTRAINT "atividade_turma_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade_professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atividade_turma" ADD CONSTRAINT "atividade_turma_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questao_atividade" ADD CONSTRAINT "questao_atividade_atividade_id_fkey" FOREIGN KEY ("atividade_id") REFERENCES "atividade_professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opcao_questao" ADD CONSTRAINT "opcao_questao_questao_id_fkey" FOREIGN KEY ("questao_id") REFERENCES "questao_atividade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_aula" ADD CONSTRAINT "plano_aula_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "professor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_aula" ADD CONSTRAINT "plano_aula_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_aula" ADD CONSTRAINT "plano_aula_unidade_fkey" FOREIGN KEY ("unidade") REFERENCES "unidade_tematica"("nome") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_habilidade" ADD CONSTRAINT "plano_habilidade_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "plano_aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_habilidade" ADD CONSTRAINT "plano_habilidade_habilidade_codigo_fkey" FOREIGN KEY ("habilidade_codigo") REFERENCES "habilidade_bncc"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_formato" ADD CONSTRAINT "plano_formato_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "plano_aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_formato" ADD CONSTRAINT "plano_formato_formato_id_fkey" FOREIGN KEY ("formato_id") REFERENCES "formato_atividade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_missao" ADD CONSTRAINT "plano_missao_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "plano_aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_missao" ADD CONSTRAINT "plano_missao_missao_id_fkey" FOREIGN KEY ("missao_id") REFERENCES "missao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_aluno_foco" ADD CONSTRAINT "plano_aluno_foco_plano_id_fkey" FOREIGN KEY ("plano_id") REFERENCES "plano_aula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plano_aluno_foco" ADD CONSTRAINT "plano_aluno_foco_aluno_id_fkey" FOREIGN KEY ("aluno_id") REFERENCES "aluno"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ─────────────────────────────────────────────────────────────────────────────
-- Restrições de integridade (CHECK): o banco recusa dados impossíveis, mesmo que
-- algum código falhe na validação. Ver docs/05-referencia/Modelo de dados.md.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE "professor" ADD CONSTRAINT "professor_email_minusculo" CHECK ("email" = lower("email"));
ALTER TABLE "turma" ADD CONSTRAINT "turma_codigo_formato" CHECK ("codigo" ~ '^[A-Z0-9]{4,10}$');
ALTER TABLE "turma" ADD CONSTRAINT "turma_ano_letivo" CHECK ("ano_letivo" BETWEEN 2000 AND 2100);
ALTER TABLE "aluno" ADD CONSTRAINT "aluno_luzes_gastas" CHECK ("luzes_gastas" >= 0);

ALTER TABLE "avatar_aluno" ADD CONSTRAINT "avatar_indices" CHECK ("pele" >= 0 AND "cor_cabelo" >= 0 AND "fundo" >= 0 AND ("capa" IS NULL OR "capa" >= 0));
ALTER TABLE "avatar_aluno" ADD CONSTRAINT "avatar_svg" CHECK (left("svg", 4) = '<svg' AND length("svg") <= 60000);
ALTER TABLE "progresso_missao" ADD CONSTRAINT "progresso_valores" CHECK ("estrelas" BETWEEN 0 AND 3 AND "vezes" >= 0 AND "melhor_acerto" BETWEEN 0 AND 100);
ALTER TABLE "pontos_mapa" ADD CONSTRAINT "pontos_positivos" CHECK ("pontos" >= 0);

ALTER TABLE "jogada" ADD CONSTRAINT "jogada_percentuais" CHECK ("percentual_conclusao" BETWEEN 0 AND 100 AND "percentual_acerto" BETWEEN 0 AND 100);
ALTER TABLE "jogada" ADD CONSTRAINT "jogada_estrelas" CHECK ("estrelas" BETWEEN 1 AND 3);
ALTER TABLE "jogada" ADD CONSTRAINT "jogada_contagens" CHECK ("rodadas" >= 0 AND "acertos_de_primeira" BETWEEN 0 AND "rodadas" AND "tentativas" >= 0 AND "tempo_segundos" >= 0 AND "dicas" >= 0);
-- missão do mapa sempre aponta para a missão do catálogo
ALTER TABLE "jogada" ADD CONSTRAINT "jogada_origem_mapa" CHECK ("origem" <> 'mapa' OR "missao_id" IS NOT NULL);

ALTER TABLE "atividade_professor" ADD CONSTRAINT "atividade_formato" CHECK ("formato" IN ('objetiva', 'completar', 'associacao-visual', 'sequencia', 'pronta'));
-- atividade pronta tem missão do app; as demais, não
ALTER TABLE "atividade_professor" ADD CONSTRAINT "atividade_pronta_missao" CHECK (("formato" = 'pronta') = ("missao_id" IS NOT NULL));
ALTER TABLE "questao_atividade" ADD CONSTRAINT "questao_ordem" CHECK ("ordem" >= 0);
ALTER TABLE "questao_atividade" ADD CONSTRAINT "questao_conteudo" CHECK (
  ("tipo" <> 'objetiva' OR "enunciado" IS NOT NULL) AND ("tipo" <> 'completar' OR "texto" IS NOT NULL)
);
ALTER TABLE "opcao_questao" ADD CONSTRAINT "opcao_ordem" CHECK ("ordem" >= 0);

ALTER TABLE "plano_aula" ADD CONSTRAINT "plano_aulas" CHECK ("aulas" BETWEEN 1 AND 10);
ALTER TABLE "plano_aula" ADD CONSTRAINT "plano_horario" CHECK ("horario" ~ '^([0-9]{2}:[0-9]{2})?$');
