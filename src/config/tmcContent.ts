// Registro central de contenido — fuente: el encargo "TMC WORLD — INTEGRAL
// WEBSITE EVOLUTION" (secciones 15–26), que releva textualmente el contenido
// de TMC_World_Master_Content_Definitions_EN.docx.
//
// IMPORTANTE: ese .docx NO existe físicamente dentro del proyecto (se buscó
// en todo el repo, sin resultados). El contenido de este archivo se tomó
// verbatim de lo entregado en el encargo — no se inventó ni se completó
// nada por fuera de ese texto.
//
// Todos los componentes deben leer copy desde aquí — nunca escribir texto
// de marca directamente en un componente — mismo principio que
// src/config/tmcAssets.ts aplicado al contenido.

export interface OverlaySection {
  id: string;
  /** Etiqueta corta (nav/footer). */
  label: string;
  /** Subtítulo aprobado ("Why TMC Exists", etc.). */
  framing: string;
  /** Párrafos de cuerpo, en orden. */
  body: string[];
}

// ---------- Header — 5 overlays institucionales (sección 15, CERRADO) ----------

export const headerOverlays: OverlaySection[] = [
  {
    id: "purpose",
    label: "OUR PURPOSE",
    framing: "Why TMC Exists",
    body: [
      "A Life Well Managed.",
      "You have the lifestyle. We handle everything around it.",
    ],
  },
  {
    id: "vision",
    label: "OUR VISION",
    framing: "Where TMC Is Going",
    body: ["Time Is The Ultimate Luxury."],
  },
  {
    id: "promise",
    label: "OUR PROMISE",
    framing: "What You Can Expect From TMC",
    body: ["Your world. Handled.", "A private ecosystem for the way you live."],
  },
  {
    id: "values",
    label: "OUR VALUES",
    framing: "How TMC Operates",
    body: ["Discretion · Excellence · Trust · Time · Relationships · Possibilities"],
  },
  {
    id: "clients",
    label: "OUR CLIENTS",
    framing: "Who TMC Is Built Around",
    body: ["One company.", "Multiple capabilities.", "One standard."],
  },
];

// ---------- Footer — 4 bloques, cada uno con overlay propio (sección 22–26) ----------

export const aboutUsContent: OverlaySection = {
  id: "about-us",
  label: "ABOUT US",
  framing: "Who TMC Is",
  body: [
    "A private ecosystem for the way you live.",
    "Property. Mobility. Care. Investments. Advisory. Execution.",
    "Different capabilities. One company. One relationship. One standard.",
    "Home base: Miami.",
    "Your world. Handled.",
  ],
};

export const contactContent: OverlaySection = {
  id: "contact",
  label: "CONTACT",
  framing: "Start a Conversation With TMC",
  body: [
    "Your world. Handled.",
    "Every TMC relationship begins with a conversation.",
  ],
};

export const socialContent: OverlaySection = {
  id: "social",
  label: "SOCIAL",
  framing: "Experience the World of TMC",
  body: ["Stay connected to the TMC world."],
};

export const cultureContent: OverlaySection = {
  id: "culture",
  label: "THE TMC CULTURE",
  framing: "The Human Side of TMC",
  body: [
    "It's not about more things. It's about a better life.",
    "Handled by people who understand your world.",
    "Discretion · Excellence · Trust · Time · Relationships · Possibilities",
    "Your world. Handled. This is how your world moves.",
  ],
};

export const socialChannels = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "facebook", label: "Facebook" },
  { id: "email", label: "Email" },
] as const;

// ---------- Las 4 operating units (secciones 18–21, CERRADO) ----------

export interface OperatingUnitContent {
  id: string;
  route: `/${string}`;
  name: string;
  descriptor: string;
  intro: string;
  capabilities: string[];
  signature: string;
  supporting: string[];
  extra?: string[];
}

export const operatingUnits: OperatingUnitContent[] = [
  {
    id: "tmc-luxury",
    route: "/luxury",
    name: "TMC Luxury",
    descriptor: "Property Management",
    intro: "TMC Luxury is the operating partner behind a well-managed high-value residence.",
    capabilities: [
      "Property Management",
      "Maintenance & Contractors",
      "Inspections & Reporting",
      "Vendor Coordination",
      "Preparation & Home Readiness",
      "Additional Property Support",
    ],
    signature: "Your property. Our responsibility.",
    supporting: ["CARE", "PRESERVE", "OPTIMIZE", "ENHANCE", "ENJOY"],
    extra: [
      "White-Glove philosophy: discreet, proactive, highly responsive, anticipatory, accountable, centered on the owner's experience.",
      "Integrated operating model: People · Estate Management · Vendor Ecosystem · Operating System · Technology + AI · Owner Experience.",
      "Owner outcomes: less operational burden, more time, confidence, one trusted point of accountability, visibility, proactive handling, and an experience designed around living in the home.",
    ],
  },
  {
    id: "tmc-transport",
    route: "/transport",
    name: "TMC Transport",
    descriptor: "Mobility · Logistics",
    intro:
      "From airport arrival to ground transportation, marine services and aviation support, TMC Transport coordinates drivers, pilots and crew across destinations.",
    capabilities: [
      "Ground Transportation",
      "Marine Services",
      "Aviation Support",
      "Drivers / Pilots / Crew",
      "Client-Owned Assets Support",
      "Logistics & Coordination",
    ],
    signature: "Your destination. Our expertise.",
    supporting: ["ANY ASSET", "ANY DESTINATION", "ANY TIME", "WE MAKE IT MOVE"],
    extra: [
      "Coordination extends to client-owned vehicles, yachts and aircraft — asset coordination built around mobility and logistics, not just a single trip.",
    ],
  },
  {
    id: "tmc-cleaners",
    route: "/cleaners",
    name: "TMC Cleaners",
    descriptor: "Home · Property Care",
    intro: "More than cleaning. Cleaning is the capability. Readiness is the experience.",
    capabilities: [
      "Luxury Home Cleaning",
      "Airbnb Turnovers",
      "Recurring Cleaning Services",
      "Pre-Arrival Preparation",
      "Post-Stay Care",
      "Additional Property Support",
    ],
    signature: "Immaculate spaces for a better life.",
    supporting: ["CLEANER", "HEALTHIER", "BRIGHTER", "READY", "ALWAYS"],
    extra: [
      "Built around consistency and property rhythm — from short-term rental turnovers and pre-arrival preparation to post-stay care and recurring service.",
    ],
  },
  {
    id: "tmc-project-office",
    route: "/project-office",
    name: "TMC Project Office",
    descriptor: "Investments · Advisory",
    intro:
      "The Project Office connects capabilities when a requirement involves multiple moving parts — advisory with execution behind it.",
    capabilities: [
      "Investment Projects",
      "New Business Ventures",
      "Project & Program Management",
      "Business & Operational Advisory",
      "Strategic Initiatives",
      "Special Projects",
    ],
    signature: "Turning opportunities into execution.",
    supporting: ["OPPORTUNITY", "STRATEGY", "STRUCTURE", "PLANNING", "EXECUTION", "RESULTS"],
    extra: [
      "Evaluate opportunities, structure initiatives, define priorities, build execution plans, coordinate stakeholders, manage delivery, track progress, resolve issues and move decisions forward.",
    ],
  },
];

// ---------- Home (sección 16, 28) ----------

export const homeContent = {
  narrativeLeft: {
    eyebrow: "A LIFE WELL MANAGED",
    body: "You have the lifestyle. We handle everything around it.",
  },
  narrativeRight: {
    eyebrow: "TIME IS THE ULTIMATE LUXURY",
  },
  promise: "Your world. Handled.",
  positioning: "A private ecosystem for the way you live.",
  closing: ["ONE COMPANY.", "MULTIPLE CAPABILITIES.", "ONE STANDARD."],
  movement: ["THIS IS HOW", "YOUR WORLD MOVES."],
};

// ---------- Narrativa Home extendida (evolución §8, Master §4.1 "Estructura
// conceptual del website") — TMC Philosophy / The Client-Lifestyle /
// The Ecosystem / The TMC Standard / Miami. Copy tomado verbatim de
// fragmentos ya aprobados en el Master (secciones 1, 2.1, 2.2, 4, 4.2) —
// ningún texto nuevo, solo reorganizado bajo el encabezado de cada sección
// conceptual. El .docx de contenido (home.md, etc.) sustituirá esto cuando
// el usuario lo confirme (ver content/tmc-world/). ----------

export interface HomeNarrativeSection {
  id: string;
  eyebrow: string;
  title: string;
  body: string[];
}

export const homeNarrativeSections: HomeNarrativeSection[] = [
  {
    id: "philosophy",
    eyebrow: "THE TMC PHILOSOPHY",
    title: "A Life Well Managed.",
    body: ["Time is the ultimate luxury."],
  },
  {
    id: "client-lifestyle",
    eyebrow: "THE CLIENT · THE LIFESTYLE",
    title: "Less friction. More time.",
    body: [
      "More control. More freedom. Peace of mind.",
      "A better life with less to manage.",
    ],
  },
  {
    id: "ecosystem",
    eyebrow: "THE ECOSYSTEM",
    title: "One ecosystem. Every capability connected.",
    body: [
      "Service: cleaning, property management, transportation and project management.",
      "Capability: people, vendors, contractors, drivers, pilots, crew and specialists.",
      "System: coordination, information, processes, reporting, technology and AI.",
      "Relationship: a trusted relationship that understands your world.",
    ],
  },
];

export const tmcStandardContent = {
  eyebrow: "THE TMC STANDARD",
  values: ["Discretion", "Excellence", "Trust", "Time", "Relationships", "Possibilities"],
};

export const miamiContent = {
  eyebrow: "MIAMI",
  title: "Our Home Base",
  body: ["A global mindset.", "A local advantage."],
};

// ---------- Private Inquiry (evolución §19) — CTA principal. Sin datos de
// contacto inventados: el flujo es el aprobado; el formulario queda
// preparado para un endpoint real cuando exista (no se fabrica ninguno). ----------

export const privateInquiryContent = {
  eyebrow: "PRIVATE INQUIRY",
  title: "Start a Conversation With TMC",
  body: ["Every TMC relationship begins with a conversation."],
  flow: ["You Connect", "We Understand", "We Connect the Right Capabilities", "We Move Forward"],
  submitLabel: "Send Private Inquiry",
};

// ---------- SEO — descripciones aprobadas (Master Handoff sección 11.1) ----------

export const seoDescriptions = {
  tmc: "A private ecosystem that manages the complexities around the way you live.",
  "tmc-luxury": "Private property management for high-value residences and estates.",
  "tmc-transport": "Private mobility across ground, marine and aviation services.",
  "tmc-cleaners": "Private home and property care for luxury residences and short-term rentals.",
  "tmc-project-office":
    "Projects, investments and advisory focused on turning opportunities into execution.",
} as const;
