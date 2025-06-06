# InfraPal Repository Setup Guide

This guide outlines the recommended setup for the InfraPal GitHub repository to ensure a smooth open-source experience.

## Branch Protection Rules

### Main Branch Protection

Enable the following rules for the `main` branch:

1. **Require pull request reviews before merging**

   - Required approving reviews: 1
   - Dismiss stale pull request approvals when new commits are pushed
   - Require review from Code Owners

2. **Require status checks to pass before merging**

   - Require branches to be up to date before merging
   - Status checks to require:
     - `npm test`
     - `npm run lint`
     - `npm run type-check`

3. **Require signed commits**

   - Enable "Require signed commits"

4. **Include administrators**
   - Apply these rules to administrators

## Conventional Commits

### GitHub Actions Workflow

Create `.github/workflows/commitlint.yml`:

```yaml
name: Lint Commits
on: [pull_request]

jobs:
  commitlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - uses: wagoid/commitlint-github-action@v5
```

### Commitlint Configuration

Create `commitlint.config.js`:

```javascript
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "test",
        "chore",
        "security",
        "perf",
      ],
    ],
  },
};
```

## Issue Templates

### Bug Report Template

Create `.github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug Report
about: Create a report to help us improve
title: "[BUG] "
labels: bug
assignees: ""
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:

1. Run '...'
2. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Environment:**

- OS: [e.g. macOS, Windows]
- Node Version: [e.g. 18.0.0]
- InfraPal Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Feature Request Template

Create `.github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: "[FEAT] "
labels: enhancement
assignees: ""
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Issue Labels

Create the following labels:

### Type

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `security` - Security related issues
- `performance` - Performance improvements

### Priority

- `high` - High priority
- `medium` - Medium priority
- `low` - Low priority

### Status

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `in progress` - Currently being worked on
- `blocked` - Blocked by other issues

### Scope

- `cli` - CLI related changes
- `auth` - Authentication related
- `config` - Configuration related
- `service` - Service integration related

## GitHub Settings

### Repository Settings

1. **General**

   - Enable "Allow forking"
   - Enable "Allow editing of maintainer's code"
   - Enable "Automatically delete head branches"

2. **Features**

   - Enable "Discussions"
   - Enable "Wikis"
   - Enable "Issues"

3. **Security**
   - Enable "Dependency graph"
   - Enable "Dependabot alerts"
   - Enable "Code scanning"

### Automation

#### Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "npm"
```

#### Code Owners

Create `CODEOWNERS`:

```
# Default owners for everything in the repo
* @maintainer1 @maintainer2

# CLI specific
/bin/ @cli-maintainer
/src/ @cli-maintainer

# Documentation
/docs/ @docs-maintainer
*.md @docs-maintainer
```

## Security Policy

Create `SECURITY.md`:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please report security vulnerabilities to security@infrapal.dev

We will acknowledge receipt of your vulnerability report within 48 hours.
```

## Community Guidelines

1. **Code of Conduct**

   - Adopt the [Contributor Covenant](https://www.contributor-covenant.org/)
   - Create `CODE_OF_CONDUCT.md`

2. **Contributing Guidelines**

   - Link to `CONTRIBUTING.md`
   - Add PR and issue templates

3. **Community Health**
   - Enable community health files
   - Set up issue templates
   - Configure branch protection

## Additional Recommendations

1. **Project Board**

   - Create a project board for tracking issues
   - Set up automation for issue/PR status

2. **Release Automation**

   - Set up GitHub Actions for releases
   - Automate changelog generation
   - Configure semantic versioning

3. **Documentation**

   - Enable GitHub Pages
   - Set up documentation site
   - Add API documentation

4. **CI/CD**
   - Set up GitHub Actions for testing
   - Configure automated deployments
   - Add status badges to README
