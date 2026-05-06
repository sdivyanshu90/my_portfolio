# Developer Portfolio

> A modern, AI-enhanced developer portfolio built with Next.js, Tailwind CSS, and the Vercel AI SDK.

![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38b2ac)

---

## Live Demo

**[https://div90.vercel.app/](https://div90.vercel.app/)**

---

## About

A fully customizable portfolio template for developers and engineers. Personalize it entirely through `portfolio-config.json` — no code changes required for content. Features an AI-powered chatbot that answers questions about your skills, projects, and experience using tool-calling.

---

## Features

- **Config-driven** — all personal data, projects, and skills live in `portfolio-config.json`
- **AI chatbot** — powered by Vercel AI SDK with OpenAI-compatible models; uses tool-calling to answer contextual questions
- **Dynamic sections** — projects, resume, skills, internships, and contact
- **Dark mode** — theme support with `next-themes`
- **Responsive** — mobile-first layout with Framer Motion animations
- **SEO ready** — meta tags and `sitemap.xml` included

---

## Tech Stack

| Technology        | Role                          |
|-------------------|-------------------------------|
| **Next.js 15**    | React framework (App Router)  |
| **TypeScript**    | Type-safe development         |
| **Tailwind CSS**  | Utility-first styling         |
| **Vercel AI SDK** | AI chat with tool-calling     |
| **Framer Motion** | Animations                    |
| **Radix UI**      | Accessible UI primitives      |
| **Vercel**        | Recommended deployment        |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   └── api/chat/             # AI chat API route + tools
├── components/               # UI and section components
│   └── chat/                 # Chat UI components
├── lib/                      # Config loader and utilities
└── types/                    # TypeScript types
public/                       # Static assets
docs/                         # Contributing guide and license
portfolio-config.json         # All portfolio content
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- pnpm (or npm/yarn)
- An OpenAI-compatible API key (e.g. OpenAI, Groq, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sdivyanshu90/my_portfolio.git
   cd my_portfolio
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your API key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   # Optional: OPENAI_BASE_URL=https://api.groq.com/openai/v1
   ```

4. **Start the dev server**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## Configuration

Edit `portfolio-config.json` to set your personal info, projects, skills, and more:

```json
{
  "personal": {
    "name": "Your Name",
    "title": "Your Title",
    "bio": "Short bio...",
    "email": "you@example.com"
  },
  "projects": [...],
  "skills": [...],
  "chatbot": { ... }
}
```

The AI chatbot reads this config at runtime via tool-calls, so updates take effect without redeployment.

---

## Deployment

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/sdivyanshu90/my_portfolio)

Set your environment variables in the Vercel dashboard, then deploy.

### Manual build

```bash
pnpm build
pnpm start
```

---

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
```

---

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

- [Open an issue](https://github.com/sdivyanshu90/my_portfolio/issues)
- [Start a discussion](https://github.com/sdivyanshu90/my_portfolio/discussions)

---

## License

MIT — see [docs/LICENSE](docs/LICENSE).
