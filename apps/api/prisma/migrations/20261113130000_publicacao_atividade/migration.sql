CREATE TABLE atividade_publicacao (
  id VARCHAR(40) PRIMARY KEY,
  atividade_id VARCHAR(40) NOT NULL REFERENCES atividade_professor(id) ON DELETE RESTRICT,
  numero INTEGER NOT NULL CHECK(numero > 0),
  conteudo JSONB NOT NULL CHECK(jsonb_typeof(conteudo)='object'),
  turmas JSONB NOT NULL CHECK(jsonb_typeof(turmas)='array' AND jsonb_array_length(turmas)>0),
  liberar_em DATE NOT NULL,
  prazo DATE CHECK(prazo IS NULL OR prazo >= liberar_em),
  publicada_em TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  legada BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(atividade_id, numero),
  UNIQUE(atividade_id, id)
);

-- Observação do conteúdo atualmente publicado; não atribui revisões a jogadas antigas.
INSERT INTO atividade_publicacao(id,atividade_id,numero,conteudo,turmas,liberar_em,prazo,legada)
SELECT 'pub-' || md5(a.id),a.id,1,
 jsonb_build_object('titulo',a.titulo,'formato',a.formato,'instrucao',a.instrucao,
 'habilidade',coalesce(a.habilidade_codigo,''),'missaoId',coalesce(a.missao_id,''),
 'planoId',coalesce(a.plano_id,''),'liberarEm',a.liberar_em::text,
 'prazo',coalesce(a.prazo::text,''),'turmas',t.ids,'questoes',coalesce(q.itens,'[]'::jsonb)),
 t.ids,a.liberar_em,a.prazo,true
FROM atividade_professor a
CROSS JOIN LATERAL (SELECT coalesce(jsonb_agg(turma_id ORDER BY turma_id),'[]'::jsonb) AS ids FROM atividade_turma WHERE atividade_id=a.id) t
CROSS JOIN LATERAL (
 SELECT jsonb_agg(
   jsonb_build_object('tipo',replace(q.tipo::text,'associacao_visual','associacao-visual'),'feedbackErro',q.feedback_erro) ||
   CASE q.tipo::text
   WHEN 'objetiva' THEN jsonb_build_object('enunciado',coalesce(q.enunciado,''),'alternativas',coalesce(o.textos,'[]'::jsonb),'correta',coalesce(o.correta,0))
   WHEN 'completar' THEN jsonb_build_object('comando',q.comando,'texto',coalesce(q.texto,''))
   WHEN 'associacao_visual' THEN jsonb_build_object('comando',q.comando,'pares',coalesce(o.pares,'[]'::jsonb))
   ELSE jsonb_build_object('comando',q.comando,'itens',coalesce(o.textos,'[]'::jsonb)) END
 ORDER BY q.ordem) AS itens
 FROM questao_atividade q
 CROSS JOIN LATERAL (
   SELECT jsonb_agg(texto ORDER BY ordem) AS textos,
    jsonb_agg(jsonb_build_object('a',texto,'b',coalesce(par,'')) ORDER BY ordem) AS pares,
    min(ordem) FILTER(WHERE correta) AS correta
   FROM opcao_questao WHERE questao_id=q.id
 ) o WHERE q.atividade_id=a.id
) q WHERE a.status='enviada' AND NOT a.arquivada AND jsonb_array_length(t.ids)>0;

ALTER TABLE jogada ADD COLUMN publicacao_id VARCHAR(40);
ALTER TABLE jogada ADD CONSTRAINT jogada_atividade_id_publicacao_id_fkey FOREIGN KEY(atividade_id,publicacao_id) REFERENCES atividade_publicacao(atividade_id,id) ON DELETE RESTRICT;
ALTER TABLE jogada ADD CONSTRAINT jogada_publicacao_origem CHECK(publicacao_id IS NULL OR origem='professor');
ALTER TABLE atividade_inicio ADD COLUMN publicacao_id VARCHAR(40);
ALTER TABLE atividade_inicio ADD CONSTRAINT atividade_inicio_atividade_id_publicacao_id_fkey FOREIGN KEY(atividade_id,publicacao_id) REFERENCES atividade_publicacao(atividade_id,id) ON DELETE RESTRICT;
ALTER TABLE atividade_inicio DROP CONSTRAINT atividade_inicio_pkey;
ALTER TABLE atividade_inicio ADD COLUMN id BIGSERIAL PRIMARY KEY;
CREATE UNIQUE INDEX atividade_inicio_aluno_id_atividade_id_publicacao_id_key ON atividade_inicio(aluno_id,atividade_id,publicacao_id);

DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='modolume_api') THEN
   GRANT SELECT,INSERT ON atividade_publicacao TO modolume_api;
   REVOKE UPDATE,DELETE,TRUNCATE ON atividade_publicacao FROM modolume_api;
   GRANT UPDATE(prazo) ON atividade_publicacao TO modolume_api;
   GRANT USAGE,SELECT ON SEQUENCE atividade_inicio_id_seq TO modolume_api;
 END IF;
END $$;
