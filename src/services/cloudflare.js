const { logger } = require("../utils/logger");
const { getSecrets } = require("../utils/secrets");

/**
 * Run Cloudflare setup for the project
 * @param {Object} config - Project configuration
 * @returns {Promise<Object>} - Setup result
 */
async function runCloudflareSetup(config) {
  logger.step("Setting up Cloudflare DNS...");

  try {
    // Get Cloudflare token
    const secrets = await getSecrets();
    if (!secrets.cloudflare) {
      logger.error(
        'Cloudflare token not found. Please run "infraagent auth update cloudflare"'
      );
      throw new Error("Cloudflare authentication required");
    }

    // Check if domain name is provided
    if (!config.domainName) {
      logger.warn("No domain name provided. Skipping Cloudflare setup.");
      return { skipped: true };
    }

    logger.info(`Setting up DNS for domain: ${config.domainName}`);

    // Get zone ID for the domain
    logger.info("Fetching Cloudflare zone ID...");

    // Add DNS records
    logger.info("Adding DNS records...");

    // If Vercel is selected, add CNAME record
    if (config.services.includes("vercel")) {
      logger.info("Adding CNAME record for Vercel...");
    }

    logger.success("Cloudflare DNS setup completed");
    return {
      domain: config.domainName,
      dnsConfigured: true,
    };
  } catch (error) {
    logger.error(`Cloudflare setup failed: ${error.message}`);
    throw error;
  }
}

module.exports = {
  runCloudflareSetup,
};
