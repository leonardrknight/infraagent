# {{PROJECT_NAME}}

This project was scaffolded using [InfraAgent](https://github.com/your-username/infraagent).

## Project Overview

{{PROJECT_DESCRIPTION}}

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone {{GITHUB_REPO_URL}}
cd {{PROJECT_NAME}}
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials.

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## Infrastructure

This project uses the following infrastructure:

{{#GITHUB}}

- **GitHub**: Repository at [{{GITHUB_REPO_URL}}]({{GITHUB_REPO_URL}})
  {{/GITHUB}}

{{#VERCEL}}

- **Vercel**: Deployment at [{{VERCEL_PROJECT_URL}}]({{VERCEL_PROJECT_URL}})
  {{/VERCEL}}

{{#SUPABASE}}

- **Supabase**: Database and authentication at [{{SUPABASE_PROJECT_URL}}]({{SUPABASE_PROJECT_URL}})
  {{/SUPABASE}}

{{#CLOUDFLARE}}

- **Cloudflare**: DNS and CDN for [{{DOMAIN_NAME}}](https://{{DOMAIN_NAME}})
  {{/CLOUDFLARE}}

{{#STRIPE}}

- **Stripe**: Payment processing
  {{/STRIPE}}

## Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for deployment instructions.

## License

MIT
