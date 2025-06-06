const fs = require('fs-extra');
const path = require('path');
const { expect } = require('jest');

// Mock the inquirer module
jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue({
    projectName: 'test-project',
    services: ['github', 'vercel'],
    githubRepo: 'username/test-project',
    vercelProject: 'test-project',
    createEnvFiles: true
  })
}));

// Mock the logger to avoid console output during tests
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    step: jest.fn(),
    debug: jest.fn()
  }
}));

// Mock the service modules
jest.mock('../src/services/github', () => ({
  runGithubSetup: jest.fn().mockResolvedValue({ repoName: 'username/test-project' })
}));

jest.mock('../src/services/vercel', () => ({
  runVercelSetup: jest.fn().mockResolvedValue({ projectName: 'test-project' })
}));

// Import the module to test
const { init } = require('../src/index');

describe('InfraPal CLI', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  describe('init command', () => {
    it('should run initialization process successfully', async () => {
      // Run the init function
      const result = await init();
      
      // Check that the result contains expected properties
      expect(result).toHaveProperty('projectName', 'test-project');
      expect(result).toHaveProperty('services');
      expect(result.services).toContain('github');
      expect(result.services).toContain('vercel');
      
      // Verify that GitHub setup was called
      const { runGithubSetup } = require('../src/services/github');
      expect(runGithubSetup).toHaveBeenCalledTimes(1);
      
      // Verify that Vercel setup was called
      const { runVercelSetup } = require('../src/services/vercel');
      expect(runVercelSetup).toHaveBeenCalledTimes(1);
    });
  });
});
