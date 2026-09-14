import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite probar el dev server desde un dispositivo en la misma red local
  // (ej. celular real, ver Header/Footer en móvil físico) — sin esto,
  // Next.js bloquea las peticiones de HMR que no vienen de localhost
  // ("Blocked cross-origin request to Next.js dev resource /_next/hmr").
  allowedDevOrigins: ["192.168.1.100"],
};

export default nextConfig;
