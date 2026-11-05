-- Equipe da escola com papéis (professor, coordenação, administrador) e registro de atividades (auditoria).
-- Só acréscimos: quem já existe continua professor; nenhuma linha é apagada.

-- 1. papel de cada pessoa da equipe (a tabela "professor" guarda toda a equipe da escola)
CREATE TYPE "papel_equipe" AS ENUM ('professor', 'coordenacao', 'admin');

ALTER TABLE "professor" ADD COLUMN "papel" "papel_equipe" NOT NULL DEFAULT 'professor';
-- coordenação e administração não têm disciplina
ALTER TABLE "professor" ALTER COLUMN "disciplina" DROP NOT NULL;
ALTER TABLE "professor" ADD COLUMN "ultimo_acesso" TIMESTAMPTZ(3);
-- senha criada pelo administrador: a pessoa troca no primeiro acesso
ALTER TABLE "professor" ADD COLUMN "senha_provisoria" BOOLEAN NOT NULL DEFAULT false;

-- professor precisa de disciplina; os outros papéis, não
ALTER TABLE "professor" ADD CONSTRAINT "professor_disciplina_do_papel"
  CHECK ("papel" <> 'professor' OR ("disciplina" IS NOT NULL AND length(trim("disciplina")) > 0));

CREATE INDEX "professor_instituicao_id_papel_idx" ON "professor"("instituicao_id", "papel");

-- 2. registro de atividades: quem fez o quê, quando (MOD-SEG, auditoria)
CREATE TABLE "registro" (
  "id" BIGSERIAL NOT NULL,
  "instituicao_id" VARCHAR(40),
  "usuario_id" VARCHAR(40),
  "usuario_nome" VARCHAR(120),
  "papel" VARCHAR(20),
  "acao" VARCHAR(60) NOT NULL,
  "alvo_tipo" VARCHAR(30),
  "alvo_id" VARCHAR(80),
  "detalhe" VARCHAR(300),
  "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "registro_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "registro_instituicao_id_fkey" FOREIGN KEY ("instituicao_id")
    REFERENCES "instituicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "registro_acao_formato" CHECK ("acao" ~ '^[a-z_.]{3,60}$')
);
CREATE INDEX "registro_instituicao_id_criado_em_idx" ON "registro"("instituicao_id", "criado_em" DESC);
CREATE INDEX "registro_acao_idx" ON "registro"("acao");
CREATE INDEX "registro_usuario_id_idx" ON "registro"("usuario_id");

-- o registro só cresce: o usuário da API pode ler e incluir, mas não alterar nem apagar
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'modolume_api') THEN
    GRANT SELECT, INSERT ON TABLE "registro" TO modolume_api;
    REVOKE UPDATE, DELETE, TRUNCATE ON TABLE "registro" FROM modolume_api;
    GRANT USAGE, SELECT ON SEQUENCE "registro_id_seq" TO modolume_api;
  END IF;
END $$;
