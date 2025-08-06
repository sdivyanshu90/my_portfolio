
# 🌟 AI-Powered Portfolio

> A modern, customizable, AI-enhanced developer portfolio powered by Next.js, Tailwind CSS, and Google Gemini.

![License](https://img.shields.io/github/license/sdivyanshu90/my_portfolio)
![Next.js](https://img.shields.io/badge/Next.js-15-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38b2ac)
![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red)

---

## 📸 Demo

> **Live Preview:** [https://your-portfolio-url.com](https://your-portfolio-url.com) *(Replace with actual URL)*

![Preview Screenshot](/public/portfolio.png)

---

## 🧠 About the Project

**AI-Powered Portfolio** is a dynamic and intelligent portfolio template for developers, freelancers, and creators. It blends sleek design with AI-driven features to showcase your work, resume, and skills — with support for customizable sections, themes, and smart chat tools.

Built with:

- ⚡️ **Next.js 15** with App Router
- 🎨 **Tailwind CSS** for modern UI styling
- 🧠 **Google Gemini API** for intelligent chat interactions
- 📱 Fully responsive and mobile-ready
- 🌘 Dark mode and accessibility support

---

## 🚀 Features

- ✅ Fully customizable via `portfolio-config.json`
- 🧠 AI chatbot powered by Google Gemini API
- 📄 Dynamic resume and project sections
- 🎯 SEO optimized with meta tags
- 💬 Contact form and social media links
- 🎨 Theme-ready and animation-rich
- 📱 Mobile-first responsive layout
- 🌐 Deployable anywhere: Vercel, Netlify, etc.

---

## 🛠️ Tech Stack

| Tech             | Role                        |
|------------------|-----------------------------|
| **Next.js**      | React framework             |
| **TypeScript**   | Type-safe development       |
| **Tailwind CSS** | Utility-first styling       |
| **Framer Motion**| Smooth animations           |
| **Google Gemini**| AI chat integration         |
| **Vercel**       | Recommended deployment host |

---

## 📂 Folder Structure

```

portfolio/
├── src/
│   ├── app/             # Next.js app router
│   ├── components/      # UI Components
│   ├── hooks/           # React Hooks
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript types
│   └── styles/          # Global styles
├── public/              # Static assets
├── docs/                # Documentation and preview assets
├── portfolio-config.json # User configuration
└── .env.local           # Environment variables (API keys, etc.)

````

---

## ⚙️ Getting Started

### 🧰 Prerequisites

- Node.js v18+
- npm / yarn / pnpm
- Git
- Google Gemini API key

### 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sdivyanshu90/my_portfolio.git
   cd my_portfolio
    ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Add your Google Gemini API key here
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser.

---

## 🔧 Configuration

All portfolio data is configured through `portfolio-config.json`.

```json
{
  "name": "Divanshu",
  "title": "Full Stack Developer",
  "about": "Passionate about building scalable and efficient web applications.",
  "projects": [...],
  "skills": [...],
  "theme": "dark",
  "aiChatEnabled": true
}
```

You can also modify:

* Chat tool responses
* UI theme and layout
* Social profiles
* SEO meta tags

---

## ☁️ Deployment

> Easily deploy using **[Vercel](https://vercel.com/)** (recommended), **Netlify**, or **GitHub Pages**

### 📦 Vercel (1-click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/sdivyanshu90/my_portfolio)

Or deploy manually with:

```bash
npm run build
npm start
```

---

## 🧪 Testing

```bash
npm run lint         # Code linting
npm run type-check   # TypeScript validation
npm run format       # Code formatting
npm run test         # Run tests (when available)
```

---

## 🤝 Contributing

We love contributions from the community! 💜

Start with:

* [CONTRIBUTING.md](/docs/CONTRIBUTING.md)
* [Open Issues](https://github.com/sdivyanshu90/my_portfolio/issues)
* [Discussions](https://github.com/sdivyanshu90/my_portfolio/discussions)

All contributors will be credited in the README, releases, and upcoming contributor board.

---

## 🧾 License

This project is licensed under the **MIT License**.
See [`LICENSE`](/docs/LICENSE) for details.

---

## 🙋‍♂️ About Me

**Divanshu** — Full Stack Developer, tech enthusiast, and open-source contributor.
GitHub: [@sdivyanshu90](https://github.com/sdivyanshu90)

---

## 📣 Feedback & Support

Have suggestions or need help?

* 💬 [Open a discussion](https://github.com/sdivyanshu90/my_portfolio/discussions)
* 🐛 [Report a bug](https://github.com/sdivyanshu90/my_portfolio/issues)

---

## 🌟 Star This Repo

If you like this project, **star it on GitHub** to help others discover it:

[👉 Star Now](https://github.com/sdivyanshu90/my_portfolio)