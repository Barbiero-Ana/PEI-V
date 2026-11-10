-- Corrige instalações existentes sem alterar registros ou relações.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'modolume_api') THEN
    REVOKE UPDATE, DELETE, TRUNCATE ON TABLE public.registro FROM modolume_api;
    IF to_regclass('public._prisma_migrations') IS NOT NULL THEN
      REVOKE ALL ON TABLE public._prisma_migrations FROM modolume_api;
    END IF;
  END IF;
END $$;
