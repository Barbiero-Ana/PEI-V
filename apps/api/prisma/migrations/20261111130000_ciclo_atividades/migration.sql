ALTER TABLE atividade_professor ADD COLUMN arquivada BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE atividade_professor ADD COLUMN prazo DATE;
ALTER TABLE atividade_professor ADD CONSTRAINT atividade_prazo_valido CHECK (prazo IS NULL OR prazo >= liberar_em);
ALTER TABLE jogada ADD COLUMN fases JSONB;
CREATE TABLE atividade_inicio (
 aluno_id VARCHAR(40) NOT NULL REFERENCES aluno(id) ON DELETE CASCADE,
 atividade_id VARCHAR(40) NOT NULL REFERENCES atividade_professor(id) ON DELETE CASCADE,
 iniciada_em TIMESTAMPTZ(3) NOT NULL,
 PRIMARY KEY(aluno_id, atividade_id)
);
CREATE TABLE avaliacao_atividade (
 id VARCHAR(40) PRIMARY KEY,
 aluno_id VARCHAR(40) NOT NULL REFERENCES aluno(id) ON DELETE RESTRICT,
 atividade_id VARCHAR(40) NOT NULL REFERENCES atividade_professor(id) ON DELETE RESTRICT,
 professor_id VARCHAR(40) NOT NULL REFERENCES professor(id) ON DELETE RESTRICT,
 jogada_id VARCHAR(80) NOT NULL REFERENCES jogada(id) ON DELETE RESTRICT,
 titulo_atividade VARCHAR(160) NOT NULL,
 habilidade_codigo VARCHAR(12),
 feedback VARCHAR(2000) NOT NULL,
 percepcao VARCHAR(30),
 publicada BOOLEAN NOT NULL DEFAULT false,
 criada_em TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK (NOT publicada OR length(trim(feedback)) > 0),
 CHECK (percepcao IS NULL OR percepcao IN ('consolidada', 'em desenvolvimento', 'precisa de apoio'))
);
CREATE INDEX avaliacao_aluno_data ON avaliacao_atividade(aluno_id, criada_em);
CREATE INDEX avaliacao_atividade_aluno ON avaliacao_atividade(atividade_id, aluno_id);
CREATE TABLE leitura_aviso_aluno (
 aluno_id VARCHAR(40) NOT NULL REFERENCES aluno(id) ON DELETE CASCADE,
 aviso_id VARCHAR(180) NOT NULL,
 lida_em TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY(aluno_id, aviso_id)
);
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'modolume_api') THEN
 GRANT SELECT, INSERT, UPDATE, DELETE ON atividade_inicio, leitura_aviso_aluno TO modolume_api;
 GRANT SELECT, INSERT ON avaliacao_atividade TO modolume_api;
 REVOKE UPDATE, DELETE, TRUNCATE ON avaliacao_atividade FROM modolume_api;
 END IF;
END $$;
