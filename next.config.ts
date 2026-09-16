import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Foto de camera de celular passa de 1 MB, o limite padrao de Server Action.
    // O cliente ainda comprime antes de enviar; isto e a folga de seguranca
    // (a Vercel corta o corpo da requisicao em 4,5 MB).
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
