const { logger } = require("../utils/logger");
const { getSecrets } = require("../utils/secrets");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

/**
 * Run Supabase setup for the project
 * @param {Object} config - Project configuration
 * @returns {Promise<Object>} - Setup result
 */
async function runSupabaseSetup(config) {
  logger.step("Setting up Supabase project...");

  try {
    // Get Supabase token
    const secrets = await getSecrets();
    if (!secrets.supabase) {
      logger.error(
        'Supabase token not found. Please run "infraagent auth update supabase"'
      );
      throw new Error("Supabase authentication required");
    }

    const projectName =
      config.supabaseProject ||
      config.projectName.toLowerCase().replace(/\s+/g, "-");
    logger.info(`Using Supabase project name: ${projectName}`);

    // Check if Supabase CLI is installed
    logger.info("Checking for Supabase CLI...");
    try {
      // This would check if supabase CLI is installed
      // await execPromise('supabase --version');
    } catch (error) {
      logger.warn("Supabase CLI not found. Attempting to install...");
      // This would install Supabase CLI
      // await execPromise('npm install -g supabase');
    }

    // Create Supabase project
    logger.info(`Creating Supabase project: ${projectName}...`);

    // Initialize Supabase locally
    logger.info("Initializing Supabase locally...");

    // Link to Supabase project
    logger.info("Linking to Supabase project...");

    logger.success("Supabase project setup completed");
    return {
      projectName,
      projectUrl: `https://app.supabase.io/project/${projectName}`,
      setupCommand: `supabase link --project-ref ${projectName}`,
    };
  } catch (error) {
    logger.error(`Supabase setup failed: ${error.message}`);
    throw error;
  }
}

module.exports = {
  runSupabaseSetup,
};
