ALTER TABLE aluno ADD COLUMN ajustes_progresso JSONB NOT NULL DEFAULT '{}';
ALTER TABLE aluno ADD COLUMN progresso_revisao INTEGER NOT NULL DEFAULT 0;
CREATE TABLE importacao_progresso (
 aluno_id VARCHAR(40) NOT NULL REFERENCES aluno(id) ON DELETE CASCADE,
 dispositivo_id VARCHAR(80) NOT NULL,
 PRIMARY KEY (aluno_id, dispositivo_id)
);
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'modolume_api') THEN
 GRANT SELECT, INSERT ON importacao_progresso TO modolume_api;
 END IF;
END $$;
