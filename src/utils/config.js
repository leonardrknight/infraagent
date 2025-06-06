const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const { logger } = require("./logger");

// Paths for config
const INFRAAGENT_DIR = path.join(os.homedir(), ".infraagent");
const GLOBAL_CONFIG_FILE = path.join(INFRAAGENT_DIR, "config.json");
const PROJECT_CONFIG_FILE = ".infraagentrc";

/**
 * Get global configuration
 * @returns {Promise<Object>} - Global configuration object
 */
async function getGlobalConfig() {
  try {
    // Ensure directory exists
    await fs.ensureDir(INFRAAGENT_DIR);

    // Check if global config file exists
    if (await fs.pathExists(GLOBAL_CONFIG_FILE)) {
      const configContent = await fs.readFile(GLOBAL_CONFIG_FILE, "utf8");
      return JSON.parse(configContent);
    }

    // Return empty object if no config found
    return {};
  } catch (error) {
    logger.error(`Failed to read global config: ${error.message}`);
    return {};
  }
}

/**
 * Get project configuration
 * @returns {Promise<Object>} - Project configuration object
 */
async function getProjectConfig() {
  try {
    // Check if project config file exists
    if (await fs.pathExists(PROJECT_CONFIG_FILE)) {
      const configContent = await fs.readFile(PROJECT_CONFIG_FILE, "utf8");
      return JSON.parse(configContent);
    }

    // Return empty object if no config found
    return {};
  } catch (error) {
    logger.error(`Failed to read project config: ${error.message}`);
    return {};
  }
}

/**
 * Save configuration to both project and global config files
 * @param {Object} config - Configuration object to save
 * @returns {Promise<boolean>} - Success status
 */
async function saveConfig(config) {
  try {
    // Save project config
    await fs.writeFile(PROJECT_CONFIG_FILE, JSON.stringify(config, null, 2));
    logger.success("Project configuration saved to .infraagentrc");

    // Ensure global config directory exists
    await fs.ensureDir(INFRAAGENT_DIR);

    // Get existing global config
    let globalConfig = {};
    if (await fs.pathExists(GLOBAL_CONFIG_FILE)) {
      const configContent = await fs.readFile(GLOBAL_CONFIG_FILE, "utf8");
      globalConfig = JSON.parse(configContent);
    }

    // Update global config with recent project settings
    globalConfig.recentProjects = globalConfig.recentProjects || [];

    // Add current project to recent projects if not already present
    const projectEntry = {
      name: config.projectName,
      path: process.cwd(),
      timestamp: new Date().toISOString(),
    };

    // Remove existing entry for this path if present
    globalConfig.recentProjects = globalConfig.recentProjects.filter(
      (project) => project.path !== process.cwd()
    );

    // Add new entry at the beginning
    globalConfig.recentProjects.unshift(projectEntry);

    // Limit to 10 recent projects
    globalConfig.recentProjects = globalConfig.recentProjects.slice(0, 10);

    // Save preferred stack settings
    globalConfig.preferredStack = config.services;

    // Save global config
    await fs.writeFile(
      GLOBAL_CONFIG_FILE,
      JSON.stringify(globalConfig, null, 2)
    );
    logger.success("Global configuration updated");

    return true;
  } catch (error) {
    logger.error(`Failed to save configuration: ${error.message}`);
    return false;
  }
}

module.exports = {
  getGlobalConfig,
  getProjectConfig,
  saveConfig,
};
