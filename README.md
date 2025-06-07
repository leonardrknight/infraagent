# InfraAgent

<div align="center">

```
╦╔╗╔╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔╗╔╔╦╗
║║║║╠╣ ╠╦╝╠═╣╠═╣║ ╦║╣ ║║║ ║
╩╝╚╝╚  ╩╚═╩ ╩╩ ╩╚═╝╚═╝╝╚╝ ╩
```

[![npm version](https://img.shields.io/npm/v/infraagent.svg)](https://www.npmjs.com/package/infraagent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/infraagent.svg?style=social)](https://github.com/yourusername/infraagent)

**Infrastructure scaffolding for modern SaaS/web startup stacks**

[Quick Start](#quick-start) • [Features](#features) • [Why InfraAgent?](#why-infraagent) • [Documentation](#documentation)

</div>

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Why InfraAgent?](#why-infraagent)
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## 🚀 Quick Start

```bash
# Install InfraAgent
npm install -g infraagent

# Create a new project
infraagent scaffold --brief project.json
```

## ✨ Features

- 🎯 **One Brief, Complete Setup**: Define your infrastructure in a single JSON file
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

1. Create a brief file:

```json
{
  "projectName": "my-app",
  "description": "A modern web application",
  "projectType": "web-app",
  "services": {
    "github": {
      "repo": "username/my-app",
      "private": true
    },
    "vercel": {
      "project": "my-app"
    },
    "supabase": {
      "project": "my-app-db"
    }
  }
}
```

2. Run the scaffold command:

```bash
infraagent scaffold --brief project.json
```

## 📚 Examples

Check out our [examples directory](briefs/examples/) for sample briefs:

- [Full Stack App](briefs/examples/full-stack.json)
- [CLI Tool](briefs/examples/cli-tool.json)
- [Next.js + Supabase](briefs/examples/nextjs-supabase.json)
- [API Service](briefs/examples/api-only.json)

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Brief     │     │  InfraAgent │     │  Services   │
│  (JSON)     │────▶│   (CLI)     │────▶│  (GitHub,   │
└─────────────┘     └─────────────┘     │   Vercel,   │
                                        │  Supabase)  │
                                        └─────────────┘
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## 📄 License

MIT © [Your Name](https://github.com/yourusername)
