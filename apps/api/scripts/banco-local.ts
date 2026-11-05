import { existsSync } from "node:fs";
import { resolve } from "node:path";
import EmbeddedPostgres from "embedded-postgres";

/**
 * PostgreSQL de desenvolvimento, sem instalar nada: um Postgres de verdade
 * baixado pelo npm, com os dados em apps/api/.banco-local (fora do git).
 * Em produção, a API usa o PostgreSQL do Railway (DATABASE_URL). O banco é
 * criado em UTF-8, igual ao do Railway.
 *
 * Uso: pnpm --filter @modolume/api banco:local  (deixe aberto enquanto desenvolve)
 */
const pasta = resolve(import.meta.dirname, "../.banco-local");
const porta = Number(process.env.BANCO_LOCAL_PORTA ?? 5433);

const pg = new EmbeddedPostgres({
  databaseDir: pasta,
  user: "postgres",
  password: "modolume-local",
  port: porta,
  persistent: true,
  // UTF-8 como no Railway (o padrão do Windows seria WIN1252, que não guarda todos os caracteres)
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (!existsSync(pasta)) await pg.initialise();
await pg.start();
try {
  await pg.createDatabase("modolume");
} catch {
  // o banco já existe
}
console.log(`PostgreSQL local em postgresql://postgres:modolume-local@localhost:${porta}/modolume`);

const parar = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", parar);
process.on("SIGTERM", parar);
