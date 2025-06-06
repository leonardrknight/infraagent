const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { logger } = require("./logger");

// Paths for secrets and config
const INFRAAGENT_DIR = path.join(os.homedir(), ".infraagent");
const SECRETS_FILE = path.join(INFRAAGENT_DIR, ".secrets");
const SECRETS_BACKUP = path.join(INFRAAGENT_DIR, ".secrets.backup");
const GLOBAL_CONFIG_FILE = path.join(INFRAAGENT_DIR, "config.json");
const PROJECT_CONFIG_FILE = ".infraagentrc";

// Encryption key derived from system
const ENCRYPTION_KEY = crypto.scryptSync(
  process.env.USER + os.hostname(),
  "salt",
  32
);

/**
 * Custom error classes for better error handling
 */
class SecretsError extends Error {
  constructor(message) {
    super(message);
    this.name = "SecretsError";
  }
}

class ValidationError extends SecretsError {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Encrypt data using AES-256-GCM
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data
 */
function encrypt(data) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(data, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    iv: iv.toString("hex"),
    encrypted: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  });
}

/**
 * Decrypt data using AES-256-GCM
 * @param {string} encryptedData - Encrypted data
 * @returns {string} - Decrypted data
 */
function decrypt(encryptedData) {
  const { iv, encrypted, tag } = JSON.parse(encryptedData);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    ENCRYPTION_KEY,
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(tag, "hex"));
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
}

/**
 * Validate token format for a service
 * @param {string} service - Service name
 * @param {string} token - Token to validate
 * @throws {ValidationError} - If token is invalid
 */
function validateToken(service, token) {
  const validators = {
    github: /^ghp_[a-zA-Z0-9]{36}$/,
    vercel: /^[a-zA-Z0-9]{24}$/,
    supabase: /^[a-zA-Z0-9]{48}$/,
    cloudflare: /^[a-zA-Z0-9]{40}$/,
    stripe: /^(sk|pk)_(test|live)_[a-zA-Z0-9]{24}$/,
  };

  if (validators[service] && !validators[service].test(token)) {
    throw new ValidationError(`Invalid ${service} token format`);
  }
}

/**
 * Get stored secrets for services
 * @returns {Promise<Object>} - Object containing secrets for each service
 * @throws {SecretsError} - If secrets cannot be read or decrypted
 */
async function getSecrets() {
  try {
    await fs.ensureDir(INFRAAGENT_DIR);

    if (!(await fs.pathExists(SECRETS_FILE))) {
      return {};
    }

    const secretsContent = await fs.readFile(SECRETS_FILE, "utf8");
    try {
      const decrypted = decrypt(secretsContent);
      return JSON.parse(decrypted);
    } catch (error) {
      // Try to restore from backup if decryption fails
      if (await fs.pathExists(SECRETS_BACKUP)) {
        const backupContent = await fs.readFile(SECRETS_BACKUP, "utf8");
        await fs.writeFile(SECRETS_FILE, backupContent);
        const decrypted = decrypt(backupContent);
        return JSON.parse(decrypted);
      }
      throw new SecretsError("Failed to decrypt secrets");
    }
  } catch (error) {
    logger.error(`Failed to read secrets: ${error.message}`);
    throw new SecretsError("Failed to read secrets");
  }
}

/**
 * Save secret for a service
 * @param {string} service - Service name
 * @param {string} token - Authentication token
 * @returns {Promise<boolean>} - Success status
 * @throws {ValidationError|SecretsError} - If validation fails or save fails
 */
async function saveSecret(service, token) {
  try {
    await fs.ensureDir(INFRAAGENT_DIR);

    // Validate token format
    validateToken(service, token);

    // Get existing secrets
    let secrets = {};
    if (await fs.pathExists(SECRETS_FILE)) {
      const secretsContent = await fs.readFile(SECRETS_FILE, "utf8");
      secrets = JSON.parse(decrypt(secretsContent));
    }

    // Create backup before modifying
    if (await fs.pathExists(SECRETS_FILE)) {
      await fs.copy(SECRETS_FILE, SECRETS_BACKUP);
    }

    // Add or update secret
    secrets[service] = token;

    // Encrypt and save
    const encrypted = encrypt(JSON.stringify(secrets));
    await fs.writeFile(SECRETS_FILE, encrypted);
    await fs.chmod(SECRETS_FILE, 0o600);

    // Secure cleanup of backup
    if (await fs.pathExists(SECRETS_BACKUP)) {
      await fs.writeFile(SECRETS_BACKUP, "0".repeat(1000)); // Overwrite with zeros
      await fs.remove(SECRETS_BACKUP);
    }

    logger.success(`${service} token saved successfully`);
    return true;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    logger.error(`Failed to save ${service} token: ${error.message}`);
    throw new SecretsError(`Failed to save ${service} token`);
  }
}

/**
 * Remove secret for a service
 * @param {string} service - Service name
 * @returns {Promise<boolean>} - Success status
 * @throws {SecretsError} - If removal fails
 */
async function removeSecret(service) {
  try {
    if (!(await fs.pathExists(SECRETS_FILE))) {
      logger.warn(`No secrets found for ${service}`);
      return false;
    }

    // Create backup
    await fs.copy(SECRETS_FILE, SECRETS_BACKUP);

    const secretsContent = await fs.readFile(SECRETS_FILE, "utf8");
    const secrets = JSON.parse(decrypt(secretsContent));

    if (secrets[service]) {
      delete secrets[service];
      const encrypted = encrypt(JSON.stringify(secrets));
      await fs.writeFile(SECRETS_FILE, encrypted);

      // Secure cleanup
      await fs.writeFile(SECRETS_BACKUP, "0".repeat(1000));
      await fs.remove(SECRETS_BACKUP);

      logger.success(`${service} token removed successfully`);
      return true;
    }

    logger.warn(`No token found for ${service}`);
    return false;
  } catch (error) {
    logger.error(`Failed to remove ${service} token: ${error.message}`);
    throw new SecretsError(`Failed to remove ${service} token`);
  }
}

/**
 * Generate environment files based on selected services
 * @param {Object} config - Project configuration
 * @param {Object} options - Generation options
 * @param {boolean} [options.force=false] - Force overwrite existing files
 * @returns {Promise<boolean>} - Success status
 */
async function generateEnvFiles(config, options = {}) {
  try {
    logger.step("Generating environment files...");

    // Check for existing files
    const envFiles = [".env", ".env.local"];
    for (const file of envFiles) {
      if ((await fs.pathExists(file)) && !options.force) {
        logger.warn(`${file} already exists. Use --force to overwrite.`);
        return false;
      }
    }

    // Get secrets for services
    const secrets = await getSecrets();

    // Basic environment variables
    let envContent = `# Generated by InfraAgent CLI\n`;
    envContent += `# Last updated: ${new Date().toISOString()}\n\n`;
    envContent += `# Project Configuration\n`;
    envContent += `PROJECT_NAME=${config.projectName}\n`;
    envContent += `NODE_ENV=development\n\n`;

    // Add service-specific environment variables
    const services = config.services || [];

    // GitHub
    if (services.includes("github")) {
      envContent += `# GitHub Configuration\n`;
      envContent += `GITHUB_TOKEN=${secrets.github || ""}\n`;
      envContent += `GITHUB_REPO=${config.githubRepo}\n`;
      envContent += `GITHUB_OWNER=${config.githubOwner || ""}\n`;
      envContent += `GITHUB_BRANCH=${config.githubBranch || "main"}\n\n`;
    }

    // Vercel
    if (services.includes("vercel")) {
      envContent += `# Vercel Configuration\n`;
      envContent += `VERCEL_TOKEN=${secrets.vercel || ""}\n`;
      envContent += `VERCEL_PROJECT_ID=${config.vercelProject || ""}\n`;
      envContent += `VERCEL_TEAM_ID=${config.vercelTeam || ""}\n`;
      envContent += `VERCEL_ORG_ID=${config.vercelOrg || ""}\n\n`;
    }

    // Supabase
    if (services.includes("supabase")) {
      envContent += `# Supabase Configuration\n`;
      envContent += `SUPABASE_URL=${
        config.supabaseUrl || "https://your-project-ref.supabase.co"
      }\n`;
      envContent += `SUPABASE_ANON_KEY=${
        secrets.supabase?.anonKey || "your-anon-key"
      }\n`;
      envContent += `SUPABASE_SERVICE_ROLE_KEY=${
        secrets.supabase?.serviceRoleKey || "your-service-role-key"
      }\n`;
      envContent += `SUPABASE_PROJECT_ID=${config.supabaseProjectId || ""}\n`;
      envContent += `SUPABASE_DB_PASSWORD=${
        secrets.supabase?.dbPassword || ""
      }\n\n`;
    }

    // Cloudflare
    if (services.includes("cloudflare")) {
      envContent += `# Cloudflare Configuration\n`;
      envContent += `CLOUDFLARE_API_TOKEN=${secrets.cloudflare || ""}\n`;
      envContent += `CLOUDFLARE_ACCOUNT_ID=${
        config.cloudflareAccountId || ""
      }\n`;
      envContent += `CLOUDFLARE_ZONE_ID=${config.cloudflareZoneId || ""}\n`;
      if (config.domainName) {
        envContent += `DOMAIN_NAME=${config.domainName}\n`;
        envContent += `NEXT_PUBLIC_DOMAIN=${config.domainName}\n`;
      }
      envContent += "\n";
    }

    // Stripe
    if (services.includes("stripe")) {
      envContent += `# Stripe Configuration\n`;
      envContent += `STRIPE_PUBLISHABLE_KEY=${
        secrets.stripe?.publishableKey || "your-publishable-key"
      }\n`;
      envContent += `STRIPE_SECRET_KEY=${
        secrets.stripe?.secretKey || "your-secret-key"
      }\n`;
      envContent += `STRIPE_WEBHOOK_SECRET=${
        secrets.stripe?.webhookSecret || "your-webhook-secret"
      }\n`;
      envContent += `STRIPE_PRICE_ID=${config.stripePriceId || ""}\n`;
      envContent += `STRIPE_CUSTOMER_ID=${config.stripeCustomerId || ""}\n\n`;
    }

    // Add common configuration
    envContent += `# Common Configuration\n`;
    envContent += `PORT=${config.port || 3000}\n`;
    envContent += `API_URL=${config.apiUrl || "http://localhost:3000"}\n`;
    envContent += `NEXT_PUBLIC_API_URL=${
      config.apiUrl || "http://localhost:3000"
    }\n\n`;

    // Write files with proper permissions
    for (const file of envFiles) {
      await fs.writeFile(file, envContent);
      await fs.chmod(file, 0o600); // Restrict permissions to owner only
      logger.success(`${file} created successfully`);
    }

    return true;
  } catch (error) {
    logger.error(`Failed to generate environment files: ${error.message}`);
    if (process.env.DEBUG) {
      logger.error(error.stack);
    }
    return false;
  }
}

module.exports = {
  getSecrets,
  saveSecret,
  removeSecret,
  generateEnvFiles,
  SecretsError,
  ValidationError,
};
