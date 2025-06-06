const fs = require('fs-extra');
const path = require('path');
const { expect } = require('jest');

// Mock the fs-extra module
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn().mockResolvedValue(),
  pathExists: jest.fn().mockResolvedValue(false),
  readFile: jest.fn().mockResolvedValue('{}'),
  writeFile: jest.fn().mockResolvedValue(),
  chmod: jest.fn().mockResolvedValue()
}));

// Import the modules to test
const { getSecrets, saveSecret, removeSecret } = require('../src/utils/secrets');
const { getGlobalConfig, getProjectConfig, saveConfig } = require('../src/utils/config');

describe('InfraPal CLI Utils', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  describe('secrets.js', () => {
    it('should get secrets successfully', async () => {
      // Mock fs.pathExists to return true
      fs.pathExists.mockResolvedValueOnce(true);
      
      // Mock fs.readFile to return a JSON string
      fs.readFile.mockResolvedValueOnce(JSON.stringify({
        github: 'github-token',
        vercel: 'vercel-token'
      }));
      
      // Call the function
      const secrets = await getSecrets();
      
      // Check the result
      expect(secrets).toHaveProperty('github', 'github-token');
      expect(secrets).toHaveProperty('vercel', 'vercel-token');
    });

    it('should save secret successfully', async () => {
      // Call the function
      const result = await saveSecret('github', 'new-github-token');
      
      // Check that fs.writeFile was called
      expect(fs.writeFile).toHaveBeenCalled();
      expect(fs.chmod).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('config.js', () => {
    it('should get global config successfully', async () => {
      // Mock fs.pathExists to return true
      fs.pathExists.mockResolvedValueOnce(true);
      
      // Mock fs.readFile to return a JSON string
      fs.readFile.mockResolvedValueOnce(JSON.stringify({
        preferredStack: ['github', 'vercel']
      }));
      
      // Call the function
      const config = await getGlobalConfig();
      
      // Check the result
      expect(config).toHaveProperty('preferredStack');
      expect(config.preferredStack).toContain('github');
    });

    it('should save config successfully', async () => {
      // Call the function
      const result = await saveConfig({
        projectName: 'test-project',
        services: ['github', 'vercel']
      });
      
      // Check that fs.writeFile was called twice (project and global config)
      expect(fs.writeFile).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });
  });
});
