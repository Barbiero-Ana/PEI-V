-- Acesso individual do aluno (ADR 0017): código pessoal + PIN, no lugar de "código da turma + escolher o nome".
-- Só acrescenta colunas; nenhum dado é apagado.

ALTER TABLE "aluno"
  ADD COLUMN "codigo_acesso" CHAR(8),
  ADD COLUMN "pin_hash" VARCHAR(100),
  ADD COLUMN "pin_falhas" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "bloqueado_ate" TIMESTAMPTZ(3),
  ADD COLUMN "versao_acesso" INTEGER NOT NULL DEFAULT 1;

-- código para os alunos que já existem: 8 caracteres de um alfabeto sem O, 0, I, 1 e L (fáceis de confundir)
DO $$
DECLARE
  alfabeto CONSTANT TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  r RECORD;
  novo TEXT;
BEGIN
  FOR r IN SELECT "id" FROM "aluno" WHERE "codigo_acesso" IS NULL LOOP
    LOOP
      novo := '';
      FOR i IN 1..8 LOOP
        novo := novo || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
      END LOOP;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM "aluno" WHERE "codigo_acesso" = novo);
    END LOOP;
    UPDATE "aluno" SET "codigo_acesso" = novo WHERE "id" = r."id";
  END LOOP;
END $$;

ALTER TABLE "aluno" ALTER COLUMN "codigo_acesso" SET NOT NULL;
CREATE UNIQUE INDEX "aluno_codigo_acesso_key" ON "aluno"("codigo_acesso");

ALTER TABLE "aluno"
  ADD CONSTRAINT "aluno_codigo_acesso_formato" CHECK ("codigo_acesso" ~ '^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$'),
  ADD CONSTRAINT "aluno_pin_falhas" CHECK ("pin_falhas" BETWEEN 0 AND 10),
  ADD CONSTRAINT "aluno_versao_acesso" CHECK ("versao_acesso" >= 1);
