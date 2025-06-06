# Contributing to InfraPal CLI

Welcome! We're excited that you're interested in contributing to InfraPal CLI. This document provides guidelines and instructions for contributing to the project.

## Project Philosophy

InfraPal CLI is built with these core principles:

- **CLI-First**: Everything should be automatable and scriptable
- **Secure-by-Default**: Security is not an afterthought
- **Developer Experience**: Focus on speed and ease of use
- **Local-First**: Work offline when possible, sync when needed
- **Modular Design**: Easy to extend with new services

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- Git

### Local Development Setup

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/your-username/infrapal.git
   cd infrapal
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Link the package for local development:

   ```bash
   npm link
   ```

4. Verify the installation:
   ```bash
   infrapal --version
   ```

## Development Workflow

### Branch Naming

We use the following branch naming conventions:

- `feat/` - New features
- `fix/` - Bug fixes
- `chore/` - Maintenance tasks
- `docs/` - Documentation updates
- `test/` - Adding or updating tests
- `refactor/` - Code refactoring

Example: `feat/add-netlify-support`

### Running Tests

1. Run all tests:

   ```bash
   npm test
   ```

2. Run tests in watch mode:

   ```bash
   npm run test:watch
   ```

3. Run tests with coverage:
   ```bash
   npm run test:coverage
   ```

### Writing Tests

We use Jest for testing. Here's a basic example:

```typescript
describe("Service Module", () => {
  it("should handle successful authentication", async () => {
    // Test implementation
  });

  it("should handle authentication errors", async () => {
    // Test implementation
  });
});
```

## Adding New Service Modules

To add support for a new service (e.g., Netlify, Firebase):

1. Create a new module in `src/services/`:

   ```typescript
   // src/services/netlify.ts
   export async function runNetlifySetup(config: Config) {
     // Implementation
   }
   ```

2. Add token validation in `src/utils/secrets.ts`:

   ```typescript
   const validators = {
     // ... existing validators
     netlify: /^[a-zA-Z0-9]{32}$/,
   };
   ```

3. Update environment file generation in `src/utils/secrets.ts`:

   ```typescript
   if (services.includes("netlify")) {
     envContent += `# Netlify Configuration\n`;
     envContent += `NETLIFY_TOKEN=${secrets.netlify || ""}\n`;
     // ... other Netlify variables
   }
   ```

4. Add service-specific prompts in `src/utils/prompts.ts`

5. Update the main CLI in `bin/index.js` to include the new service

6. Write tests for the new service module

## Pull Request Process

1. Update the README.md and AUTH_GUIDE.md if your changes affect:

   - New features
   - Configuration options
   - Authentication methods
   - Environment variables

2. Add tests for new functionality

3. Ensure all tests pass:

   ```bash
   npm test
   ```

4. Update documentation:

   - Add JSDoc comments
   - Update relevant guides
   - Add examples if applicable

5. Submit your PR with:
   - Clear description of changes
   - Link to related issues
   - Screenshots if UI changes
   - Test coverage report

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Example:

```
feat(auth): add Netlify authentication support

- Add Netlify token validation
- Implement Netlify setup flow
- Add environment variable generation

Closes #123
```

## Getting Help

- Open a [GitHub Issue](https://github.com/your-username/infrapal/issues) for:

  - Bug reports
  - Feature requests
  - Questions about implementation
  - Documentation improvements

- Join our [Discord Community](https://discord.gg/infrapal) for:
  - Real-time help
  - Discussion of ideas
  - Community support

## License

By contributing to InfraPal CLI, you agree that your contributions will be licensed under the project's [MIT License](./LICENSE).

## Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

## Thank You!

Thank you for contributing to InfraPal CLI! Your work helps make infrastructure setup easier for developers everywhere. 🚀
