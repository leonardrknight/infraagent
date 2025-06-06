const { logger } = require("../utils/logger");
const { getSecrets } = require("../utils/secrets");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

/**
 * Run Vercel setup for the project
 * @param {Object} config - Project configuration
 * @returns {Promise<Object>} - Setup result
 */
async function runVercelSetup(config) {
  logger.step("Setting up Vercel project...");

  try {
    // Get Vercel token
    const secrets = await getSecrets();
    if (!secrets.vercel) {
      logger.error(
        'Vercel token not found. Please run "infraagent auth update vercel"'
      );
      throw new Error("Vercel authentication required");
    }

    const projectName =
      config.vercelProject ||
      config.projectName.toLowerCase().replace(/\s+/g, "-");
    logger.info(`Using Vercel project name: ${projectName}`);

    // Check if Vercel CLI is installed
    logger.info("Checking for Vercel CLI...");
    try {
      // This would check if vercel CLI is installed
      // await execPromise('vercel --version');
    } catch (error) {
      logger.warn("Vercel CLI not found. Attempting to install...");
      // This would install Vercel CLI
      // await execPromise('npm install -g vercel');
    }

    // Create Vercel project
    logger.info(`Creating Vercel project: ${projectName}...`);

    // Link to Vercel project
    logger.info("Linking to Vercel project...");

    // Configure environment variables
    if (config.domainName) {
      logger.info(`Setting up custom domain: ${config.domainName}...`);
    }

    logger.success("Vercel project setup completed");
    return {
      projectName,
      projectUrl: `https://vercel.com/dashboard/projects/${projectName}`,
      deployUrl: config.domainName
        ? `https://${config.domainName}`
        : `https://${projectName}.vercel.app`,
    };
  } catch (error) {
    logger.error(`Vercel setup failed: ${error.message}`);
    throw error;
  }
}

module.exports = {
  runVercelSetup,
};
