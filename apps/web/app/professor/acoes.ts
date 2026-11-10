"use server";

import { redirect } from "next/navigation";
import { ErroApi, chamarApi, usandoApi } from "@/lib/painel/api";
import { professorPorEmail } from "@/lib/painel/dados";
import { gravarSessao } from "@/lib/painel/cookie-sessao";
import { INICIO_DO_PAPEL, type PapelEquipe } from "@/lib/painel/sessao";

export interface EstadoEntrar {
  erro: string | null;
  email: string;
}

/**
 * Login da equipe (professor, coordenação ou administrador). Com a API ligada, quem confere e-mail e senha é a API
 * (senha guardada com bcrypt), e o token dela fica na sessão. Sem API, vale o
 * login de demonstração (e-mail dos dados de exemplo e senha de demonstração).
 */
export async function entrar(_anterior: EstadoEntrar, form: FormData): Promise<EstadoEntrar> {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  if (!email || !senha) return { erro: "Preencha o e-mail e a senha.", email };

  let professorId: string;
  let tokenApi: string | undefined;
  let papel: PapelEquipe = "professor";
  let trocarSenha = false;
  if (usandoApi()) {
    // a API confere a senha (guardada com bcrypt) e devolve o token do professor
    try {
      const r = await chamarApi<{
        token: string;
        professor: { id: string; papel?: PapelEquipe; senhaProvisoria?: boolean };
      }>("/auth/professor", {
        metodo: "POST",
        corpo: { email, senha },
      });
      professorId = r.professor.id;
      tokenApi = r.token;
      papel = r.professor.papel ?? "professor";
      trocarSenha = Boolean(r.professor.senhaProvisoria);
    } catch (e) {
      const semServidor = e instanceof ErroApi && e.status >= 500;
      return { erro: semServidor ? (e as ErroApi).message : "E-mail ou senha incorretos.", email };
    }
  } else {
    const professor = await professorPorEmail(email);
    const senhaDemo = process.env.PAINEL_SENHA_DEMO ?? "modolume2026";
    if (!professor || senha !== senhaDemo) {
      // mesma mensagem nos dois casos, para não revelar quais e-mails existem
      return { erro: "E-mail ou senha incorretos.", email };
    }
    professorId = professor.id;
  }

  await gravarSessao({ professorId, papel, trocarSenha, token: tokenApi });
  // cada papel abre a sua área; senha provisória precisa ser trocada antes
  redirect(trocarSenha ? "/conta/senha" : INICIO_DO_PAPEL[papel]);
}
