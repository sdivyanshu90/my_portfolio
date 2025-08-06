# Contributing to AI-Powered Portfolio

First off, thank you for considering contributing to this project! 🎉

It's people like you that make this portfolio system a great tool for developers worldwide.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, pnpm, or yarn
- Git
- A text editor (VS Code recommended)

### First-time Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/portfolio.git
   cd portfolio
   ```
3. **Add the original repository** as upstream:
   ```bash
   git remote add upstream https://github.com/anujjainbatu/portfolio.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Add your Google Gemini API key
   ```

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

**When filing a bug report, please include:**
- A clear and descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node.js version, browser)
- Any relevant configuration (portfolio-config.json snippets)

### 💡 Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:
- A clear and descriptive title
- Detailed description of the enhancement
- Explain why this would be useful
- Provide examples or mockups if possible

### 🔧 Code Contributions

#### Types of Contributions We Welcome:

1. **Bug fixes** - Fix existing issues
2. **New features** - Add new portfolio sections or chat tools
3. **UI/UX improvements** - Better design and user experience
4. **Documentation** - Improve README, add examples, or create tutorials
5. **Performance optimizations** - Make the system faster
6. **Accessibility improvements** - Better a11y support
7. **Testing** - Add or improve tests

#### What We're Looking For:

- **New chat tools** for different portfolio sections
- **Theme customizations** and color schemes
- **Animation improvements** for better UX
- **Mobile responsiveness** enhancements
- **SEO optimizations**
- **Performance improvements**
- **Better error handling**

## Development Setup

### 1. Development Environment

```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests (when available)
npm run test
```

### 2. Project Structure

```
portfolio/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   ├── lib/           # Utility functions
│   ├── types/         # TypeScript definitions
│   └── hooks/         # Custom React hooks
├── public/            # Static assets
├── portfolio-config.json  # Main configuration
└── docs/              # Documentation
```

### 3. Key Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Google Gemini API** - AI chat functionality
- **Framer Motion** - Animations

## Pull Request Process

### 1. Branch Naming

Use descriptive branch names:
- `feature/add-new-chat-tool`
- `fix/image-loading-issue`
- `docs/update-setup-guide`
- `refactor/improve-config-loader`

### 2. Before Submitting

1. **Update from upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run quality checks**:
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

3. **Test your changes**:
   - Test with different portfolio configurations
   - Verify on mobile devices
   - Check dark/light mode compatibility

### 3. Pull Request Guidelines

**Your PR should:**
- Have a clear title and description
- Reference any related issues
- Include screenshots for UI changes
- Update documentation if needed
- Add tests for new features (when applicable)

**PR Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Tested locally
- [ ] Tested on mobile
- [ ] Tested dark/light modes
- [ ] Tested with different configs

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## Style Guidelines

### Code Style

We use ESLint and Prettier for consistent code formatting:

```bash
# Auto-fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

### TypeScript Guidelines

- Use strict TypeScript
- Define proper types in `src/types/`
- Avoid `any` type
- Use interface over type when possible

### React Guidelines

- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Keep components focused and reusable

### CSS Guidelines

- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Ensure dark mode compatibility
- Use semantic HTML

### Git Guidelines

**Commit Messages:**
```
feat: add new project carousel animation
fix: resolve image loading issue on mobile
docs: update API documentation
refactor: improve config loader performance
```

**Format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

### Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release notes
4. Tag the release
5. Deploy to production

## Development Guidelines

### Adding New Features

1. **Chat Tools**: Add new tools in `src/app/api/chat/tools/`
2. **Components**: Create reusable components in `src/components/`
3. **Configuration**: Update types in `src/types/portfolio.ts`
4. **Documentation**: Update README and examples

### Testing New Features

1. Test with multiple portfolio configurations
2. Verify mobile responsiveness
3. Check accessibility compliance
4. Test dark/light mode switching
5. Verify performance impact

### Performance Considerations

- Optimize images and assets
- Use dynamic imports for large components
- Implement proper loading states
- Consider bundle size impact

## Community

### Getting Help

- 💬 [GitHub Discussions](https://github.com/anujjainbatu/portfolio/discussions)
- 🐛 [Issues](https://github.com/anujjainbatu/portfolio/issues)
- 📧 Email: anujjainbatu@gmail.com

### Recognition

Contributors will be:
- Added to the README contributors section
- Mentioned in release notes
- Invited to our contributor Discord (coming soon)

### Code of Conduct Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at anujjainbatu@gmail.com.

---

## 🎉 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort in helping improve the AI-Powered Portfolio system.

**Happy coding!** 🚀

---

*This contribution guide is inspired by the best practices from the open-source community and is continuously improved based on contributor feedback.*
