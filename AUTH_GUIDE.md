# Authentication Guide for InfraPal CLI

This guide explains how to set up and manage authentication for each service that InfraPal integrates with.

## Authentication Overview

InfraPal uses personal access tokens (PATs) for authentication with various services. These tokens are:

- Stored securely in `~/.infrapal/.secrets`
- Encrypted using AES-256-GCM
- Protected with file permissions (0o600)
- Validated for correct format before storage
- Backed up automatically before modifications

## Service-Specific Setup

### GitHub

1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" (classic)
3. Give your token a descriptive name (e.g., "InfraPal CLI")
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
5. Click "Generate token"
6. Copy the token (format: `ghp_[a-zA-Z0-9]{36}`)

### Vercel

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Click "Create" to create a new token
3. Give your token a descriptive name (e.g., "InfraPal CLI")
4. Choose an expiration date (or "No expiration")
5. Click "Create"
6. Copy the token (format: `[a-zA-Z0-9]{24}`)

### Supabase

1. Log in to your [Supabase Dashboard](https://app.supabase.io/)
2. Go to Project Settings > API
3. Copy the following keys:
   - `anon` key (format: `[a-zA-Z0-9]{48}`)
   - `service_role` key (format: `[a-zA-Z0-9]{48}`)
4. Go to Database Settings > Connection Info
5. Copy the database password

### Cloudflare

1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to "My Profile" > "API Tokens"
3. Click "Create Token"
4. Use the "Edit zone DNS" template
5. Under "Zone Resources", select the specific zones or "All zones"
6. Click "Continue to summary" and then "Create Token"
7. Copy the token (format: `[a-zA-Z0-9]{40}`)

### Stripe

1. Go to [Stripe Dashboard > Developers > API keys](https://dashboard.stripe.com/apikeys)
2. Copy the following keys:
   - Publishable key (format: `pk_(test|live)_[a-zA-Z0-9]{24}`)
   - Secret key (format: `sk_(test|live)_[a-zA-Z0-9]{24}`)
3. Go to Developers > Webhooks
4. Create a new webhook endpoint
5. Copy the signing secret

## Managing Your Tokens

### View Stored Tokens

```bash
# List all stored tokens
infrapal auth list

# List tokens for a specific service
infrapal auth list <service>
```

### Update Tokens

```bash
# Update a service token
infrapal auth update <service>

# Force re-authentication
infrapal auth update <service> --force
```

### Remove Tokens

```bash
# Remove a service token
infrapal auth remove <service>

# Remove all tokens
infrapal auth remove --all
```

## Security Features

### Token Storage

- Tokens are encrypted using AES-256-GCM
- Encryption key is derived from system information
- Files are protected with 0o600 permissions
- Automatic backup before modifications
- Secure cleanup of sensitive data

### Token Validation

Each service's token is validated for correct format:

- GitHub: `ghp_[a-zA-Z0-9]{36}`
- Vercel: `[a-zA-Z0-9]{24}`
- Supabase: `[a-zA-Z0-9]{48}`
- Cloudflare: `[a-zA-Z0-9]{40}`
- Stripe: `(sk|pk)_(test|live)_[a-zA-Z0-9]{24}`

### Error Recovery

If token storage becomes corrupted:

1. Automatic backup restoration is attempted
2. If restoration fails, you'll be prompted to re-authenticate
3. Previous tokens are securely wiped

## Best Practices

1. **Token Security**

   - Never share your personal access tokens
   - Use the minimum required permissions
   - Rotate tokens periodically
   - Revoke unused tokens

2. **Environment Files**

   - `.env.local` is gitignored by default
   - Never commit tokens to version control
   - Use `--force` carefully when overwriting files

3. **Debug Mode**
   - Use `--debug` flag for troubleshooting
   - Debug logs may contain sensitive information
   - Clear debug logs after use

## Troubleshooting

### Common Issues

1. **Invalid Token Format**

   - Ensure you're copying the entire token
   - Check for extra spaces or newlines
   - Verify token hasn't expired

2. **Permission Denied**

   - Check file permissions in `~/.infrapal`
   - Ensure you have write access
   - Try running with `--force` if needed

3. **Corrupted Storage**
   - Use `infrapal auth update --force` to re-authenticate
   - Check debug logs for specific errors
   - Contact support if issues persist
