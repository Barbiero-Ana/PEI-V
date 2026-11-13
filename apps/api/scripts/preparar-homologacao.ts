import "reflect-metadata";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
let etapa = "validacao";

/** Exclusivo do pre-deploy do ambiente Railway homologacao. Nunca restaura dados de produção. */
async function preparar() {
  if (process.env.RAILWAY_ENVIRONMENT_NAME !== "homologacao" || process.env.AMBIENTE_DADOS_FICTICIOS !== "true")
    throw new Error("Preparação permitida apenas na homologação com dados fictícios.");
  const admin = process.env.DIRECT_URL,
    runtime = process.env.DATABASE_URL;
  const senhaApi = process.env.API_BANCO_SENHA,
    senhaDemo = process.env.SENHA_DEMO,
    pin = process.env.PIN_HOMOLOGACAO;
  if (
    !admin ||
    !runtime ||
    !senhaApi ||
    !/^[a-f0-9]{64}$/.test(senhaApi) ||
    !senhaDemo ||
    senhaDemo.length < 16 ||
    !pin ||
    !/^\d{4}$/.test(pin)
  )
    throw new Error("Defina as conexões e credenciais privadas de homologação.");
  const origem = new URL(admin),
    destino = new URL(runtime);
  if (
    origem.hostname !== destino.hostname ||
    origem.port !== destino.port ||
    origem.pathname !== destino.pathname ||
    destino.username !== "modolume_api" ||
    decodeURIComponent(destino.password) !== senhaApi
  )
    throw new Error("As conexões devem apontar ao mesmo banco isolado, com usuários distintos.");
  const pg = new Client({ connectionString: admin });
  etapa = "conexao";
  await pg.connect();
  try {
    const marca = (
      await pg.query(
        "SELECT current_setting('app.ambiente', true) AS ambiente, to_regclass('public.instituicao') AS tabela",
      )
    ).rows[0];
    if (
      marca.ambiente !== "homologacao" &&
      marca.tabela &&
      (await pg.query("SELECT count(*)::int AS n FROM instituicao")).rows[0].n > 0
    )
      throw new Error("Banco com dados preexistentes sem marca de homologação. Operação recusada.");
    const banco = (await pg.query("SELECT current_database() AS nome")).rows[0].nome as string;
    await pg.query(`ALTER DATABASE "${banco.replaceAll('"', '""')}" SET app.ambiente='homologacao'`);
    const raiz = resolve(import.meta.dirname, "../../..");
    etapa = "migracoes";
    execFileSync(
      process.execPath,
      [
        resolve(raiz, "node_modules/prisma/build/index.js"),
        "migrate",
        "deploy",
        "--schema",
        resolve(import.meta.dirname, "../prisma/schema.prisma"),
      ],
      {
        env: { ...process.env, DATABASE_URL: admin, DIRECT_URL: admin },
        timeout: 180000,
        stdio: "pipe",
      },
    );
    etapa = "permissoes";
    const sql = readFileSync(resolve(import.meta.dirname, "../prisma/sql/papel-da-api.sql"), "utf8").replace(
      "CREATE ROLE modolume_api LOGIN PASSWORD :'senha';",
      () =>
        `DO $$ BEGIN IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='modolume_api') THEN CREATE ROLE modolume_api LOGIN PASSWORD '${senhaApi}'; ELSE ALTER ROLE modolume_api LOGIN PASSWORD '${senhaApi}'; END IF; END $$;`,
    );
    await pg.query(sql);
    etapa = "dados-ficticios";
    execFileSync(
      process.execPath,
      [resolve(raiz, "node_modules/tsx/dist/cli.mjs"), resolve(import.meta.dirname, "../prisma/seed.ts")],
      {
        env: { ...process.env, NODE_ENV: "development", DATABASE_URL: admin, DIRECT_URL: admin },
        timeout: 180000,
        stdio: "pipe",
      },
    );
    const prisma = new PrismaClient({ datasources: { db: { url: admin } } });
    etapa = "acesso-alunos";
    try {
      const alunos = await prisma.aluno.findMany({ orderBy: { id: "asc" }, take: 2 });
      const pinHash = await bcrypt.hash(pin, 12);
      for (const aluno of alunos)
        await prisma.aluno.updateMany({ where: { id: aluno.id, pinHash: null }, data: { pinHash } });
    } finally {
      await prisma.$disconnect();
    }
    console.log(
      "OK: homologação migrada; papel mínimo e contas fictícias preparados. Nenhuma credencial é registrada nos logs.",
    );
  } finally {
    await pg.end();
  }
}

preparar().catch(() => {
  console.error(
    `Falha na preparação da homologação, etapa ${etapa}. Confira a configuração; implantação interrompida.`,
  );
  process.exitCode = 1;
});
