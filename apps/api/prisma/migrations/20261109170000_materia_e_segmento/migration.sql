CREATE TYPE "segmento" AS ENUM ('fundamental_i', 'fundamental_ii', 'medio');

CREATE TABLE "materia" (
  "id" VARCHAR(40) NOT NULL PRIMARY KEY,
  "instituicao_id" VARCHAR(40) NOT NULL REFERENCES "instituicao"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "nome" VARCHAR(60) NOT NULL,
  "chave" VARCHAR(60) NOT NULL
);
CREATE UNIQUE INDEX "materia_instituicao_id_chave_key" ON "materia"("instituicao_id", "chave");

ALTER TABLE "professor" ADD COLUMN "materia_id" VARCHAR(40) REFERENCES "materia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "professor" ADD COLUMN "segmento" "segmento";
ALTER TABLE "turma" ADD COLUMN "segmento" "segmento";
CREATE INDEX "professor_materia_id_idx" ON "professor"("materia_id");
CREATE INDEX "turma_instituicao_id_segmento_idx" ON "turma"("instituicao_id", "segmento");

INSERT INTO "materia" ("id", "instituicao_id", "nome", "chave")
SELECT gen_random_uuid()::text, "instituicao_id", min(trim("disciplina")), lower(trim("disciplina"))
FROM "professor"
WHERE "papel" = 'professor' AND trim("disciplina") <> ''
GROUP BY "instituicao_id", lower(trim("disciplina"));

UPDATE "professor" p SET "materia_id" = m."id"
FROM "materia" m
WHERE p."papel" = 'professor' AND p."instituicao_id" = m."instituicao_id" AND lower(trim(p."disciplina")) = m."chave";

-- Uma série antiga pode ser ambígua. A administração classifica os demais casos.
UPDATE "turma" SET "segmento" = CASE
  WHEN lower("serie") ~ '^[4-5][º°]?[[:space:]]+ano[[:space:]]*$' THEN 'fundamental_i'::segmento
  WHEN lower("serie") ~ '^[6-9][º°]?[[:space:]]+ano[[:space:]]*$' THEN 'fundamental_ii'::segmento
  WHEN lower("serie") ~ '^[1-3][ª°]?[[:space:]]+série[[:space:]]+do[[:space:]]+ensino[[:space:]]+médio$' THEN 'medio'::segmento
END;
