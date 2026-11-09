ALTER TABLE professor
  ADD COLUMN versao_acesso INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN redefinicao_hash CHAR(64),
  ADD COLUMN redefinicao_expira_em TIMESTAMPTZ(3);
CREATE UNIQUE INDEX professor_redefinicao_hash_key ON professor(redefinicao_hash);
ALTER TABLE professor ADD CONSTRAINT professor_redefinicao_completa
  CHECK ((redefinicao_hash IS NULL) = (redefinicao_expira_em IS NULL));
-- Nenhuma senha/histórico existente é alterado. Tokens antigos expiram na implantação
-- porque agora a guarda exige a versão explícita da credencial da equipe.
