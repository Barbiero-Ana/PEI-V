-- Papel de banco com privilégio mínimo para a API do Modolume em produção (Railway).
--
-- A API não precisa criar nem alterar tabelas: isso é feito só pelas migrações,
-- com o usuário administrador (postgres). Rodar uma vez, como administrador,
-- trocando a senha. Depois, a DATABASE_URL da API usa o usuário modolume_api.
--
--   psql "$DATABASE_URL_ADMIN" -v senha="'troque-esta-senha'" -f prisma/sql/papel-da-api.sql

CREATE ROLE modolume_api LOGIN PASSWORD :senha;

-- só ler e gravar dados; sem DROP, ALTER, CREATE nem TRUNCATE
GRANT CONNECT ON DATABASE railway TO modolume_api;
GRANT USAGE ON SCHEMA public TO modolume_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO modolume_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO modolume_api;

-- tabelas criadas por migrações futuras recebem as mesmas permissões
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO modolume_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO modolume_api;

-- a tabela de controle das migrações fica só com o administrador
REVOKE ALL ON TABLE "_prisma_migrations" FROM modolume_api;
