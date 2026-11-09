BEGIN;
ALTER TABLE pontos_mapa RENAME TO ponto_mapa;
ALTER TABLE ponto_mapa RENAME CONSTRAINT pontos_mapa_pkey TO ponto_mapa_pkey;
ALTER TABLE ponto_mapa RENAME CONSTRAINT pontos_mapa_aluno_id_fkey TO ponto_mapa_aluno_id_fkey;
ALTER TABLE ponto_mapa RENAME CONSTRAINT pontos_mapa_mapa_numero_fkey TO ponto_mapa_mapa_numero_fkey;
COMMIT;
