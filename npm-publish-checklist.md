# InfraPal NPM Publishing Checklist

This checklist ensures a smooth and professional release process for InfraPal on NPM.

## Pre-Release Checks

### 1. Package.json Validation

- [ ] **Basic Information**

  - [ ] `name` is available on NPM
  - [ ] `version` follows semver
  - [ ] `description` is clear and concise
  - [ ] `bin` entry points are correct
  - [ ] `main` and `types` fields are set
  - [ ] `engines` specifies Node.js version

- [ ] **Metadata**

  - [ ] `author` information is complete
  - [ ] `license` is specified (MIT)
  - [ ] `repository` URL is correct
  - [ ] `keywords` are relevant
  - [ ] `bugs` URL is set
  - [ ] `homepage` URL is set

- [ ] **Scripts**
  - [ ] `test` script is present
  - [ ] `build` script is present
  - [ ] `prepare` script for TypeScript
  - [ ] `prepublishOnly` for safety checks

### 2. Code Quality

- [ ] **TypeScript**

  - [ ] All types are properly defined
  - [ ] No `any` types in production code
  - [ ] `tsconfig.json` is properly configured
  - [ ] Type definitions are generated

- [ ] **Testing**

  - [ ] All tests pass (`npm test`)
  - [ ] Coverage meets minimum threshold
  - [ ] Edge cases are covered
  - [ ] Integration tests pass

- [ ] **Linting**
  - [ ] ESLint passes (`npm run lint`)
  - [ ] No warnings in production code
  - [ ] Code style is consistent

### 3. Documentation

- [ ] **README.md**

  - [ ] Installation instructions
  - [ ] Usage examples
  - [ ] Configuration options
  - [ ] API documentation
  - [ ] Troubleshooting guide
  - [ ] License information

- [ ] **CHANGELOG.md**
  - [ ] Updated with new changes
  - [ ] Follows [Keep a Changelog](https://keepachangelog.com/)
  - [ ] Breaking changes are noted
  - [ ] Migration guides if needed

### 4. Local Testing

- [ ] **CLI Testing**

  - [ ] `npm link` works
  - [ ] All commands function
  - [ ] Help text is accurate
  - [ ] Error messages are clear

- [ ] **Installation Testing**
  - [ ] Fresh install works
  - [ ] Dependencies are correct
  - [ ] No unnecessary dependencies
  - [ ] Peer dependencies are specified

## Release Process

### 1. Version Management

- [ ] **Semantic Versioning**
  - [ ] Determine version bump type
  - [ ] Update version in package.json
  - [ ] Update version in CHANGELOG.md
  - [ ] Commit version changes

### 2. NPM Publishing

- [ ] **Pre-publish Checks**

  - [ ] NPM registry is set correctly
  - [ ] NPM login is active
  - [ ] 2FA is enabled (if required)
  - [ ] Package is not already published

- [ ] **Publishing**
  - [ ] Run `npm publish --access public`
  - [ ] Verify package on NPM website
  - [ ] Check package size
  - [ ] Verify all files are included

### 3. Post-Publish

- [ ] **GitHub Release**

  - [ ] Create new release
  - [ ] Tag matches version
  - [ ] Release notes are complete
  - [ ] Assets are attached

- [ ] **Documentation**

  - [ ] Update documentation site
  - [ ] Update API docs
  - [ ] Update examples

- [ ] **Announcement**
  - [ ] Update social media
  - [ ] Notify community
  - [ ] Update status page

## Common Issues

### Package Size

- [ ] Check for unnecessary files
- [ ] Verify `.npmignore` is correct
- [ ] Consider using `files` field

### Dependencies

- [ ] Audit dependencies (`npm audit`)
- [ ] Check for outdated packages
- [ ] Verify peer dependencies

### TypeScript

- [ ] Check for type conflicts
- [ ] Verify declaration files
- [ ] Test with strict mode

## Rollback Plan

1. **Immediate Issues**

   - [ ] Unpublish if critical bug found
   - [ ] Document the issue
   - [ ] Create hotfix

2. **Version Management**
   - [ ] Keep previous version available
   - [ ] Document breaking changes
   - [ ] Provide migration guide

## Maintenance

- [ ] **Monitoring**

  - [ ] Set up error tracking
  - [ ] Monitor download stats
  - [ ] Track issue reports

- [ ] **Updates**
  - [ ] Schedule regular updates
  - [ ] Plan dependency updates
  - [ ] Review security advisories
