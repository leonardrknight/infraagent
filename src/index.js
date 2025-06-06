const inquirer = require("inquirer");
const { runGithubSetup } = require("./services/github");
const { runVercelSetup } = require("./services/vercel");
const { runSupabaseSetup } = require("./services/supabase");
const { runCloudflareSetup } = require("./services/cloudflare");
const { runStripeSetup } = require("./services/stripe");
const { saveConfig } = require("./utils/config");
const { generateEnvFiles } = require("./utils/secrets");
const { logger } = require("./utils/logger");
const { getPrompts } = require("./utils/prompts");

/**
 * Main initialization function for InfraPal CLI
 * @param {Object} options - Command line options
 * @param {boolean} [options.force] - Force initialization even if project exists
 * @param {string} [options.template] - Template to use for initialization
 * @param {boolean} [options.yes] - Skip confirmation prompts
 */
async function init(options = {}) {
  logger.info("Welcome to InfraPal CLI!");
  logger.info("Starting project initialization...");

  try {
    // Get user inputs through interactive prompts
    const prompts = getPrompts(options);
    const answers = options.yes
      ? await inquirer.prompt(prompts.filter((p) => p.required))
      : await inquirer.prompt(prompts);

    // Merge command line options with answers
    const finalAnswers = {
      ...answers,
      force: options.force || answers.force,
      template: options.template || answers.template,
    };

    // Save configuration to .infrapalrc and global config
    await saveConfig(finalAnswers);

    // Set up selected services
    const services = finalAnswers.services || [];

    // GitHub setup
    if (services.includes("github")) {
      await runGithubSetup(finalAnswers);
    }

    // Vercel setup
    if (services.includes("vercel")) {
      await runVercelSetup(finalAnswers);
    }

    // Supabase setup
    if (services.includes("supabase")) {
      await runSupabaseSetup(finalAnswers);
    }

    // Cloudflare setup
    if (services.includes("cloudflare")) {
      await runCloudflareSetup(finalAnswers);
    }

    // Stripe setup (optional)
    if (services.includes("stripe")) {
      await runStripeSetup(finalAnswers);
    }

    // Generate environment files if requested
    if (finalAnswers.createEnvFiles) {
      await generateEnvFiles(finalAnswers);
    }

    logger.success("Project initialization completed successfully!");
    logger.info("Check DEPLOYMENT_CHECKLIST.md for next steps.");

    return finalAnswers;
  } catch (error) {
    logger.error(`Initialization failed: ${error.message}`);
    if (process.env.DEBUG) {
      logger.error(error.stack);
    }
    throw error;
  }
}

module.exports = {
  init,
};
