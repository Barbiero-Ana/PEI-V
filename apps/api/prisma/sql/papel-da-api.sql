-- Papel de banco com privilégio mínimo para a API do Modolume em produção (Railway).
--
-- A API não precisa criar nem alterar tabelas: isso é feito só pelas migrações,
-- com o usuário administrador (postgres). Rodar uma vez, como administrador,
-- trocando a senha. Depois, a DATABASE_URL da API usa o usuário modolume_api.
--
--   psql "$DATABASE_URL_ADMIN" -v senha="troque-esta-senha" -f prisma/sql/papel-da-api.sql

CREATE ROLE modolume_api LOGIN PASSWORD :'senha';

-- só ler e gravar dados; sem DROP, ALTER, CREATE nem TRUNCATE
DO $$ BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO modolume_api', current_database());
END $$;
GRANT USAGE ON SCHEMA public TO modolume_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO modolume_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO modolume_api;

-- tabelas criadas por migrações futuras recebem as mesmas permissões
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO modolume_api;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO modolume_api;

-- Auditoria é somente de acréscimo, inclusive quando o papel é criado após as migrações.
-- Quando o papel vem antes, a migração que cria registro aplica a mesma revogação.
DO $$ BEGIN
  IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
    REVOKE ALL ON TABLE public._prisma_migrations FROM modolume_api;
  END IF;
  IF to_regclass('public.registro') IS NOT NULL THEN
    REVOKE UPDATE, DELETE, TRUNCATE ON TABLE public.registro FROM modolume_api;
  END IF;
END $$;
