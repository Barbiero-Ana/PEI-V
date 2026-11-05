import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@modolume/core"],
  // o indicador "N" do modo dev ficava por cima dos jogos no celular
  devIndicators: false,
  // pasta de build separada para um segundo servidor de teste (ex.: NEXT_DIST_DIR=.next-teste)
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
