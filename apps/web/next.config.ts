import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@modolume/core"],
  // o indicador "N" do modo dev ficava por cima dos jogos no celular
  devIndicators: false,
  // pasta de build separada para um segundo servidor de teste (ex.: NEXT_DIST_DIR=.next-teste)
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // o login é um portal só para toda a equipe; o endereço antigo continua valendo
  async redirects() {
    return [{ source: "/professor/entrar", destination: "/entrar", permanent: true }];
  },
};

export default nextConfig;
