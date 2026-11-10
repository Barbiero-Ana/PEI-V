import { router } from "expo-router";

/** Volta uma tela; se a tela foi aberta direto (link, recarga), vai ao início. */
export function voltar() {
  if (router.canGoBack()) router.back();
  else router.replace("/");
}
