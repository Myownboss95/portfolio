/**
 * Single source of truth for the professional history.
 *
 * Rendered in two places, so it lives here rather than in either page:
 *  - `/about`   — the full timeline (`ExperienceItem`)
 *  - `/`        — the "Professional Journey" summary (`JourneyRow`)
 *
 * Order is reverse-chronological and is relied on by both consumers.
 */
export interface Job {
  role: string;
  company: string;
  period: string;
  location: string;
  points: string[];
}

export const experience: Job[] = [
  {
    role: 'Technical Lead / CTO',
    company: 'Hizo Africa — Pan-African Neobank',
    period: 'Oct 2023 — Present',
    location: 'Remote',
    points: [
      'Led platform architecture for a neobank serving cross-border payments, KYC-gated services, and virtual USD cards across multiple African markets. Live on iOS & Android.',
      'Shipped LLM-powered features to production: a support and operations assistant using RAG (vector + keyword retrieval over internal docs) with Anthropic Claude and OpenAI, grounding answers to reduce hallucination across customer and internal flows.',
      'Engineered agentic workflows that take real actions across internal APIs via tool-use / function calling — automating multi-step KYC, transaction, and support tasks with human-in-the-loop verification.',
      'Built a custom Model Context Protocol (MCP) server exposing internal tools and connectors to LLM agents, standardising how agents call company systems.',
      'Applied LLM-assisted document extraction to KYC/identity flows, turning unstructured documents into structured, validated fields feeding the Prova verification pipeline.',
      'Architected the cross-border RateEngine — the core pricing layer driving FX conversion, internal rate sourcing, and liquidity routing across remittance and crypto flows.',
      'Built Prova, a provider-agnostic tiered KYC platform — primarily Laravel, with Go and Python microservices for high-throughput verification paths — with progressive feature gating across user journeys.',
      'Architected a bidirectional USDT-to-fiat remittance platform with payout via local rails (SasaPay, PawaPay, M-Pesa), priced by the RateEngine.',
      'Owned the Hizo Global Virtual Card system end to end — architecture, schema, REST API, security, and Interlace SDK integration.',
      'Designed an end-to-end encryption layer (X25519, HKDF-SHA256, AES-256-GCM) for secure card-detail reveals, with a Flutter client SDK.',
      'Managed a team of 6 engineers and seven third-party vendor relationships across product, design, and compliance.',
    ],
  },
  {
    role: 'Senior Backend Engineer',
    company: 'Glyde — Payment Service Provider',
    period: '2023 — Present',
    location: 'Remote',
    points: [
      'Built the core payment infrastructure for Glyde, an all-in-one payments platform for businesses.',
      'Built the business KYB (Know Your Business) system — onboarding and verifying merchant entities before they can transact.',
      'Built collections — the payment collection flows merchants use to take money in.',
      'Engineered across Laravel and TypeScript / Node.js microservices, with Nuxt on the front end.',
    ],
  },
  {
    role: 'Senior Engineering Consultant',
    company: 'Coriftech · TIVA Tech Africa · TECH4DEV',
    period: '2021 — Present',
    location: 'Remote (project basis)',
    points: [
      'Delivered LLM features for clients — RAG-based assistants and agentic automations integrating Anthropic Claude and OpenAI — alongside full-stack Node/TypeScript and Python builds.',
      'Delivered full stack engineering training to 1,000+ youths across multiple cohorts.',
      'Built client-facing software and in-house SaaS; ongoing backend/platform architecture support for Trazo (food vending) and advising Vent Africa.',
    ],
  },
  {
    role: 'Lead Web Developer (WordPress & Three.js)',
    company: 'Spiral Marketing — Fairfax, Virginia, USA',
    period: '2022 — 2023',
    location: 'Remote',
    points: [
      'Led the team delivering client web projects across SaaS, marketing, and interactive web.',
      'Built immersive Three.js / WebGL marketing sites and 3D product showcases; mentored junior developers.',
    ],
  },
  {
    role: 'Backend Developer & Team Lead',
    company: 'Abegyi Corporation — Jos, Nigeria',
    period: '2018 — 2020',
    location: 'On-site',
    points: [
      'Led a backend team on a fintech product that secured $500,000+ in seed funding.',
      'Owned backend architecture, payments integration, and release coordination.',
    ],
  },
];
