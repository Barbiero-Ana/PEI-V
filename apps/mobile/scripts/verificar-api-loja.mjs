import { isIP } from "node:net";

const { EAS_BUILD_PROFILE: perfil } = process.env;
if (perfil === "play-internal" || perfil === "production") {
  const endereco = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";
  let url;
  try {
    url = new URL(endereco);
  } catch {
    // A mensagem abaixo é a mesma para valores ausentes ou inválidos.
  }
  const dominio = url?.hostname.replace(/\.$/, "");
  if (
    !url ||
    !/^https:\/\//i.test(endereco) ||
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !dominio?.includes(".") ||
    isIP(dominio) ||
    /\.(localhost|local|internal|lan|test|invalid|example)$/i.test(dominio)
  ) {
    throw new Error(
      "Defina EXPO_PUBLIC_API_URL no ambiente EAS deste perfil com a URL HTTPS da API em um domínio acessível.",
    );
  }
}
