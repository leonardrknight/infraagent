# InfraAgent Project Briefs

This directory contains project briefs used by InfraAgent to scaffold infrastructure.

## Directory Structure

- `examples/` - Example briefs for different project types

  - `full-stack.json` - Complete SaaS application with all services
  - `cli-tool.json` - CLI tool with minimal services
  - `nextjs-supabase.json` - Next.js app with Supabase backend
  - `api-only.json` - Standalone REST API service

- `templates/` - Blank templates for customization

  - `blank.json` - Minimal template to start from scratch

- `projects/` - Your actual project briefs (not tracked in git)
  - `.gitkeep` - Keeps the directory in git

## Brief Schema

A project brief is a JSON file that describes your project's infrastructure needs:

```json
{
  "projectName": "string",     // Name of your project
  "description": "string",     // Project description
  "services": {               // Infrastructure services to set up
    "github": {               // GitHub repository
      "repo": "string",       // Repository name (username/repo)
      "private": boolean,     // Whether repository is private
      "description": "string" // Repository description
    },
    "vercel": {              // Vercel deployment
      "project": "string",   // Project name
      "framework": "string"  // Framework (nextjs, node, etc.)
    },
    "supabase": {            // Supabase backend
      "project": "string",   // Project name
      "region": "string",    // Region (us-east-1, etc.)
      "database": {          // Database configuration
        "name": "string",    // Database name
        "password": "string" // Database password
      }
    },
    "cloudflare": {          // Cloudflare DNS
      "domain": "string",    // Domain name
      "dns": {               // DNS records
        "type": "string",    // Record type (A, CNAME, etc.)
        "name": "string",    // Record name
        "value": "string"    // Record value
      }
    },
    "stripe": {              // Stripe payments
      "mode": "string",      // Mode (test, live)
      "webhook": {           // Webhook configuration
        "endpoint": "string", // Webhook endpoint
        "events": ["string"]  // Events to listen for
      }
    }
  },
  "environment": {           // Environment variables
    "production": {          // Production environment
      "KEY": "value"        // Environment variables
    },
    "development": {         // Development environment
      "KEY": "value"        // Environment variables
    }
  }
}
```

## Creating Custom Briefs

1. Start with a template:

   ```bash
   cp briefs/templates/blank.json briefs/projects/my-project.json
   ```

2. Or use an example:

   ```bash
   cp briefs/examples/nextjs-supabase.json briefs/projects/my-project.json
   ```

3. Edit the brief file to match your project needs

4. Use the brief with InfraAgent:
   ```bash
   infraagent scaffold --brief briefs/projects/my-project.json
   ```

## Best Practices

1. Keep sensitive information out of briefs:

   - Use placeholders for passwords and secrets
   - Store actual secrets in InfraAgent's secure storage

2. Version control your briefs:

   - Keep project briefs in `briefs/projects/`
   - Share example briefs in `briefs/examples/`

3. Use environment variables:

   - Define all environment variables in the brief
   - Use different values for development/production

4. Document your briefs:
   - Add comments explaining non-obvious choices
   - Keep the structure clean and organized
