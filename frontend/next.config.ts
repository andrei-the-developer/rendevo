import type { NextConfig } from "next";

const API = process.env.API_INTERNA ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Richiesto dal Dockerfile: la build produce .next/standalone.
  output: "standalone",

  // Solo sviluppo: senza questo Next blocca le risorse dev (incluso l'HMR)
  // quando il browser arriva da un host diverso da localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost", "172.22.0.2"],

  // In sviluppo Next sta su :3000 e FastAPI su :8000. Inoltrando qui, il
  // browser vede un solo origin: il cookie di sessione viaggia senza CORS,
  // ed è la stessa forma che avrà in produzione dietro Caddy.
  async rewrites() {
    return [
      { source: "/api/:percorso*", destination: `${API}/api/:percorso*` },
      { source: "/media/:percorso*", destination: `${API}/media/:percorso*` },
    ];
  },
};

export default nextConfig;
