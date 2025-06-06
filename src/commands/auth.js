const inquirer = require("inquirer");
const open = require("open");
const os = require("os");
const { logger } = require("../utils/logger");
const { saveSecret, getSecrets, removeSecret } = require("../utils/secrets");
const { GitHubService } = require("../services/github");
const { VercelService } = require("../services/vercel");
const { SupabaseService } = require("../services/supabase");
const { CloudflareService } = require("../services/cloudflare");
const { StripeService } = require("../services/stripe");

// Service configurations
const SERVICES = {
  github: {
    name: "GitHub",
    description: "Repository management and secrets",
    tokenUrl: "https://github.com/settings/tokens/new",
    tokenFormat: /^ghp_[a-zA-Z0-9]{36}$/,
    scopes: ["repo", "workflow"],
    validate: async (token) => {
      const github = new GitHubService();
      await github.initialize(token);
      const { data } = await github.octokit.users.getAuthenticated();
      return data.login;
    },
  },
  vercel: {
    name: "Vercel",
    description: "Deployment and hosting",
    tokenUrl: "https://vercel.com/account/tokens",
    tokenFormat: /^[a-zA-Z0-9]{24}$/,
    validate: async (token) => {
      const vercel = new VercelService();
      await vercel.initialize(token);
      const user = await vercel.getUser();
      return user.username;
    },
  },
  supabase: {
    name: "Supabase",
    description: "Database and authentication",
    tokenUrl: "https://app.supabase.io/project/_/settings/api",
    tokenFormat: /^[a-zA-Z0-9]{48}$/,
    validate: async (token) => {
      const supabase = new SupabaseService();
      await supabase.initialize(token);
      const project = await supabase.getProject();
      return project.name;
    },
  },
  cloudflare: {
    name: "Cloudflare",
    description: "DNS and CDN management",
    tokenUrl: "https://dash.cloudflare.com/profile/api-tokens",
    tokenFormat: /^[a-zA-Z0-9]{40}$/,
    validate: async (token) => {
      const cloudflare = new CloudflareService();
      await cloudflare.initialize(token);
      const account = await cloudflare.getAccount();
      return account.name;
    },
  },
  stripe: {
    name: "Stripe",
    description: "Payment processing",
    tokenUrl: "https://dashboard.stripe.com/apikeys",
    tokenFormat: /^sk_(test|live)_[a-zA-Z0-9]{24}$/,
    validate: async (token) => {
      const stripe = new StripeService();
      await stripe.initialize(token);
      const account = await stripe.getAccount();
      return account.business_name || account.id;
    },
  },
};

/**
 * Open URL in browser or show instructions
 * @param {string} url - URL to open
 * @param {string} service - Service name
 */
async function openOrShowUrl(url, service) {
  try {
    await open(url);
    logger.success(`Opened ${service} token page in your browser`);
  } catch (error) {
    logger.info(`Please visit: ${url}`);
  }
}

/**
 * Configure a single service
 * @param {string} service - Service key
 * @returns {Promise<boolean>} - Success status
 */
async function configureService(service) {
  const config = SERVICES[service];
  logger.step(`\n→ ${config.name} Configuration`);
  logger.info(config.description);

  // Show token URL
  logger.info(`\nPlease create a Personal Access Token:`);
  logger.info(`1. Opening ${config.tokenUrl}`);
  await openOrShowUrl(config.tokenUrl, config.name);

  if (service === "github") {
    logger.info(`2. Name it: "InfraAgent - ${os.hostname()}"`);
    logger.info(
      `3. Select scopes: ${config.scopes.map((s) => `[${s}]`).join(" ")}`
    );
    logger.info(`4. Click "Generate token"`);
  }

  // Get token
  const { token } = await inquirer.prompt([
    {
      type: "password",
      name: "token",
      message: `Enter your ${config.name} token:`,
      validate: (input) => {
        if (!config.tokenFormat.test(input)) {
          return `Invalid token format for ${config.name}`;
        }
        return true;
      },
    },
  ]);

  // Validate token
  try {
    logger.info("Validating token...");
    const username = await config.validate(token);
    await saveSecret(service, token);
    logger.success(`✓ Token validated`);
    logger.success(`✓ Connected as ${username}`);
    return true;
  } catch (error) {
    logger.error(`✗ Token validation failed: ${error.message}`);
    return false;
  }
}

/**
 * Run the authentication setup wizard
 * @returns {Promise<void>}
 */
async function setup() {
  logger.info("\nWelcome to InfraAgent Authentication Setup");
  logger.info(
    "This wizard will help you configure access to your infrastructure services.\n"
  );

  const { services } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "services",
      message: "Select services to configure:",
      choices: Object.entries(SERVICES).map(([key, config]) => ({
        name: `${config.name} - ${config.description}`,
        value: key,
      })),
    },
  ]);

  const results = {
    success: [],
    failed: [],
  };

  for (const service of services) {
    const success = await configureService(service);
    if (success) {
      results.success.push(service);
    } else {
      results.failed.push(service);
    }
  }

  // Show summary
  logger.info("\nSetup Summary:");
  if (results.success.length > 0) {
    logger.success(`✓ Successfully configured: ${results.success.join(", ")}`);
  }
  if (results.failed.length > 0) {
    logger.error(`✗ Failed to configure: ${results.failed.join(", ")}`);
  }

  logger.info("\nRun 'infraagent auth test' to verify all connections.");
}

/**
 * List configured services
 * @returns {Promise<void>}
 */
async function list() {
  const secrets = await getSecrets();
  const configured = Object.keys(secrets);

  if (configured.length === 0) {
    logger.info("No services configured yet.");
    logger.info("Run 'infraagent auth setup' to configure services.");
    return;
  }

  logger.info("\nConfigured Services:");
  for (const service of configured) {
    const config = SERVICES[service];
    logger.success(`✓ ${config.name} - ${config.description}`);
  }
}

/**
 * Test all configured services
 * @returns {Promise<void>}
 */
async function test() {
  const secrets = await getSecrets();
  const configured = Object.keys(secrets);

  if (configured.length === 0) {
    logger.info("No services configured yet.");
    logger.info("Run 'infraagent auth setup' to configure services.");
    return;
  }

  logger.info("\nTesting Service Connections:");
  for (const service of configured) {
    const config = SERVICES[service];
    logger.step(`\n→ Testing ${config.name}...`);

    try {
      const username = await config.validate(secrets[service]);
      logger.success(`✓ Connected as ${username}`);
    } catch (error) {
      logger.error(`✗ Connection failed: ${error.message}`);
    }
  }
}

/**
 * Remove a service configuration
 * @param {string} service - Service to remove
 * @returns {Promise<void>}
 */
async function remove(service) {
  if (!SERVICES[service]) {
    logger.error(`Unknown service: ${service}`);
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to remove ${SERVICES[service].name} configuration?`,
      default: false,
    },
  ]);

  if (confirm) {
    await removeSecret(service);
    logger.success(`Removed ${SERVICES[service].name} configuration`);
  }
}

/**
 * Add or update a service configuration
 * @param {string} service - Service to configure
 * @returns {Promise<void>}
 */
async function add(service) {
  if (!SERVICES[service]) {
    logger.error(`Unknown service: ${service}`);
    return;
  }

  await configureService(service);
}

module.exports = {
  setup,
  list,
  test,
  remove,
  add,
};
