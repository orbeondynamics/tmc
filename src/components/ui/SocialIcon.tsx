// Íconos genéricos para el bloque SOCIAL del footer (prompt maestro sección
// 6.2, calibrado sobre tmc-website-base.png: "el bloque SOCIAL usa íconos
// de marca... en vez de solo texto"). Trazos simples/genéricos en línea
// dorada — no son los logotipos oficiales de cada red (evitar cualquier
// activo de marca de terceros), son pictogramas universales reconocibles
// (cámara, nota musical, burbuja de mensaje, sobre) en el mismo lenguaje
// visual hairline dorado que el resto del sitio.

interface SocialIconProps {
  channelId: string;
}

export function SocialIcon({ channelId }: SocialIconProps) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (channelId) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common}>
          <path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M14 4c0 2.5 2 4.5 4.5 4.5" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M13.5 21v-8h2.7l.4-3h-3.1V8a1.5 1.5 0 0 1 1.5-1.5h1.8V3.8C16.3 3.6 15.2 3.5 14.2 3.5 11.6 3.5 10 5.1 10 7.7V10H7.3v3H10v8" />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="m4 6.5 8 6.5 8-6.5" />
        </svg>
      );
    default:
      return null;
  }
}
