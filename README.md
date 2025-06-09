# InfraAgent

<div align="center">
  <h1>InfraAgent</h1>
  <p><strong>AI-powered DevOps architect that transforms project briefs into fully-configured infrastructure</strong></p>
  
  <p>
    <a href="https://www.npmjs.com/package/infraagent"><img src="https://img.shields.io/npm/v/infraagent.svg" alt="npm version"></a>
    <a href="https://github.com/leonardrknight/infraagent/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <a href="https://github.com/leonardrknight/infraagent/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
    <a href="#"><img src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" alt="code style: prettier"></a>
    <a href="https://github.com/leonardrknight/infraagent/stargazers"><img src="https://img.shields.io/github/stars/leonardrknight/infraagent.svg" alt="GitHub stars"></a>
  </p>
</div>

---

## 🚀 Transform your infrastructure setup from hours to minutes

[Quick Start](#quick-start) • [Features](#features) • [Why InfraAgent?](#why-infraagent) • [Documentation](#documentation)

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Why InfraAgent?](#why-infraagent)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## 🚀 Quick Start

```bash
# Install InfraAgent
npm install -g infraagent

# Set up authentication for your services
infraagent auth setup

# Create a new project with interactive wizard
infraagent init
```

## ✨ Features

- 🎯 **Interactive Setup**: Guided wizard for project configuration
- 🔄 **Multi-Service Integration**: GitHub, Vercel, Supabase, Cloudflare, Stripe
- 🔒 **Secure Credentials**: AES-256 encryption for all service tokens
- 🎨 **Beautiful CLI**: Progress tracking, spinners, and clear output
- 📦 **Zero Dependencies**: No global installs except Node.js
- 🔧 **Extensible**: Easy to add new services and features

## 🤔 Why InfraAgent?

Setting up infrastructure for modern web applications is tedious and error-prone. InfraAgent solves this by:

- **Reducing Setup Time**: From 2+ hours → Under 2 minutes
- **Eliminating Errors**: Automated configuration and validation
- **Standardizing Best Practices**: Security-first approach
- **Simplifying Maintenance**: One source of truth for infrastructure

### Before vs After

| Task                 | Manual      | InfraAgent   |
| -------------------- | ----------- | ------------ |
| Create GitHub repo   | 2 min       | ✅ Automated |
| Configure secrets    | 5 min       | ✅ Automated |
| Setup Vercel project | 3 min       | ✅ Automated |
| Configure Supabase   | 5 min       | ✅ Automated |
| Wire everything up   | 10 min      | ✅ Automated |
| **Total**            | **25+ min** | **< 2 min**  |

## 📦 Installation

```bash
# Using npm
npm install -g infraagent

# Using yarn
yarn global add infraagent
```

## 🎮 Usage

### 1. Authentication Setup

```bash
# Set up authentication for all services
infraagent auth setup

# Or configure individual services
infraagent auth add github
infraagent auth add vercel
infraagent auth add supabase
```

### 2. Project Creation

```bash
# Start the interactive wizard
infraagent init

# The wizard will guide you through:
# - Project name and description
# - Project type selection
# - Service configuration
# - Environment setup
```

### 3. Brief Management

```bash
# List all saved project briefs
infraagent briefs

# Execute a saved brief
infraagent exec <brief-name>

# Open a brief in your editor
infraagent edit <brief-name>
```

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  InfraAgent │     │  Brief      │     │  Services   │
│   (CLI)     │────▶│  Manager    │────▶│  (GitHub,   │
└─────────────┘     └─────────────┘     │   Vercel,   │
                                        │  Supabase)  │
                                        └─────────────┘
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## 📄 License

MIT © [Knight Ventures, Inc.](https://leonardknight.com)

## 📞 Contact

- **Website**: [leonardknight.com](https://leonardknight.com)
- **Email**: [leo@leonardknight.com](mailto:leo@leonardknight.com)
- **Support**: [support@leonardknight.com](mailto:support@leonardknight.com)
- **GitHub**: [github.com/leonardrknight/infraagent](https://github.com/leonardrknight/infraagent)
