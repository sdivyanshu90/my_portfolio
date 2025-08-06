Thanks, Divanshu! Here's your fully personalized and enhanced `CONTRIBUTING.md` with your name, GitHub username, and project URL added in the right places. I've also removed references to the previous maintainer.

---

# 🤖 Contributing to AI-Powered Portfolio

Thank you for considering a contribution! 🧠💻  
This project thrives because of developers like you helping build a better, more accessible, and intelligent portfolio platform.

---

## 📚 Table of Contents

- [🌈 Code of Conduct](#-code-of-conduct)
- [🚀 Getting Started](#-getting-started)
- [🛠️ How Can I Contribute?](#-how-can-i-contribute)
- [🧪 Development Setup](#-development-setup)
- [📦 Pull Request Process](#-pull-request-process)
- [🎨 Style & Commit Guidelines](#-style--commit-guidelines)
- [📈 Release Process](#-release-process)
- [🧭 Development Guidelines](#-development-guidelines)
- [🤝 Community](#-community)
- [❓ FAQs](#-faqs)
- [🙏 Thank You!](#-thank-you)

---

## 🌈 Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).  
We are committed to a respectful and inclusive environment for all.

### We Pledge To:
- Foster a harassment-free community
- Respect all contributors regardless of background
- Act with empathy, kindness, and integrity

---

## 🚀 Getting Started

### 🔧 Prerequisites

Ensure the following are installed:

- **Node.js v18+**
- **npm**, **yarn**, or **pnpm**
- **Git**
- **VS Code** or preferred editor

### 🔄 First-Time Setup

1. **Fork** the repo and **clone** it:
   ```
   git clone https://github.com/your-username/portfolio.git
   cd portfolio
   ````

2. **Add upstream**:

   ```
   git remote add upstream https://github.com/sdivyanshu90/my_portfolio.git
   ```

3. **Install dependencies**:

   ```bash
   npm install
   ```

4. **Set up your environment**:

   ```bash
   cp .env.example .env.local
   # Add your Google Gemini API Key in .env.local
   ```

---

## 🛠️ How Can I Contribute?

There are many ways to contribute:

### 🐛 Report Bugs

* Search existing issues first.
* Include steps to reproduce, actual vs expected results, and screenshots if possible.
* Provide your system details (OS, Node.js version, browser).

### 💡 Suggest Features

* Clearly describe your idea and why it's beneficial.
* Include mockups, sketches, or examples if possible.

### 🔧 Code Contributions

You can:

* Add **new features** or **chat tools**
* Improve **performance**, **design**, or **accessibility**
* Expand or fix **documentation**
* Write or enhance **tests**
* Contribute **translations**

We welcome PRs both big and small!

---

## 🧪 Development Setup

### ⚙️ Local Dev Commands

```bash
npm run dev           # Run local development server
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript checks
npm run format        # Auto-format code
npm run test          # Run test suite (when available)
```

### 🗂️ Project Structure

```
portfolio/
├── src/
│   ├── app/             # Next.js app router
│   ├── components/      # UI components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── types/           # TypeScript definitions
├── public/              # Static assets
├── docs/                # Documentation
├── portfolio-config.json # Site-wide configuration
└── .env.local           # API keys and secrets
```

### 🧰 Tech Stack

* **Next.js 15**
* **TypeScript**
* **Tailwind CSS**
* **Google Gemini API**
* **Framer Motion**
* **ESLint & Prettier**

---

## 📦 Pull Request Process

### 🔖 Branch Naming

Use clear, conventional names:

```
feature/add-xyz
fix/issue-101
docs/improve-setup-guide
refactor/clean-hero-component
```

### 🧹 Before Submitting

1. **Sync with upstream**:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests and quality checks**:

   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

3. **Test thoroughly**:

   * ✅ Responsive design
   * ✅ Light/dark mode
   * ✅ Browser compatibility
   * ✅ Different configs in `portfolio-config.json`

### 📝 Pull Request Template

```markdown
## 📄 Description
Brief overview of the change.

## 📦 Type of Change
- [ ] Bug fix 🐛
- [ ] New feature ✨
- [ ] Documentation 📚
- [ ] Refactor 🔁
- [ ] Performance improvement ⚡

## 🧪 Testing
- [ ] Ran locally
- [ ] Mobile responsive
- [ ] Dark/light mode checked
- [ ] Config variations tested

## 📸 Screenshots (if UI changes)

## ✅ Checklist
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Docs updated
- [ ] No breaking changes
```

---

## 🎨 Style & Commit Guidelines

### 🖌️ Code Style

* Format with Prettier: `npm run format`
* Lint fix: `npm run lint -- --fix`
* Use Tailwind CSS for styling

### ⚛️ React

* Functional components only
* Hooks over class components
* Keep components reusable

### 🔠 TypeScript

* Avoid `any`; use defined interfaces
* Define new types in `src/types/`
* Use `interface` over `type` for extensibility

### 🧾 Commit Messages

Format:

```
<type>: <summary>

[optional body]

[optional footer: references or issues]
```

Examples:

* `feat: add language switcher to navbar`
* `fix: resolve undefined config error`
* `docs: update contributing.md`
* `test: add coverage for config parser`

Types:

* `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 📈 Release Process

We follow **Semantic Versioning**:
`MAJOR.MINOR.PATCH`

### 🔁 Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Tag the release:

   ```bash
   git tag v1.2.0
   git push origin --tags
   ```
4. Create GitHub release with release notes
5. Deploy to production

---

## 🧭 Development Guidelines

### 📦 Adding New Features

* Add chat tools to `src/app/api/chat/tools/`
* Create new UI components in `src/components/`
* Update config types in `src/types/portfolio.ts`
* Update documentation and usage examples

### 🧪 Testing Focus Areas

* Different `portfolio-config.json` variations
* Mobile and tablet views
* Dark/light mode support
* Accessibility via screen readers and keyboard navigation
* Performance via Lighthouse or Web Vitals

### 🚀 Performance Best Practices

* Lazy load large components
* Optimize image sizes
* Use `next/image` where applicable
* Avoid unnecessary re-renders
* Implement loading states for slow APIs

---

## 🤝 Community

### 💬 Need Help?

* GitHub [Discussions](https://github.com/sdivyanshu90/my_portfolio/discussions)
* GitHub [Issues](https://github.com/sdivyanshu90/my_portfolio/issues)

### 🏅 Recognition

All contributors will:

* Be listed in the README
* Be mentioned in changelogs
* Get an invite to our upcoming **Discord Community** *(coming soon)*

### ⚖️ Code of Conduct Enforcement

Unacceptable behavior will be addressed directly and may result in a ban.
Please report concerns via [GitHub Issues](https://github.com/sdivyanshu90/my_portfolio/issues).

---

## ❓ FAQs

**Q: Do I need to be an expert to contribute?**
No! Beginners and first-timers are very welcome. We’ll help you through your first PR.

**Q: Can I use this project in my portfolio or job interview?**
Yes! Just make sure to credit the repo appropriately.

**Q: How do I test a new chat tool?**
Add your tool in `src/app/api/chat/tools/`, import it, and use `npm run dev` to test via the local interface.

---

## 🙏 Thank You!

We appreciate your time, skills, and effort in making **AI-Powered Portfolio** better for the entire community.
Whether it's a typo fix or a new feature — **your contribution matters**. 💙

Happy coding! 🚀