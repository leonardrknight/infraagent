const { Octokit } = require("@octokit/rest");
const { logger } = require("../utils/logger");
const { getSecrets } = require("../utils/secrets");
const { encryptMessage } = require("../utils/encryption");
const simpleGit = require("simple-git");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

/**
 * GitHub service class for repository management
 */
class GitHubService {
  constructor() {
    this.octokit = null;
    this.rateLimit = null;
  }

  /**
   * Initialize GitHub client with token
   * @param {string} token - GitHub personal access token
   */
  async initialize(token) {
    this.octokit = new Octokit({ auth: token });
    await this.updateRateLimit();
  }

  /**
   * Update rate limit information
   */
  async updateRateLimit() {
    try {
      const { data } = await this.octokit.rateLimit.get();
      this.rateLimit = {
        limit: data.resources.core.limit,
        remaining: data.resources.core.remaining,
        reset: new Date(data.resources.core.reset * 1000),
      };
    } catch (error) {
      logger.warn("Failed to fetch rate limit information");
    }
  }

  /**
   * Check if repository exists
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<boolean>} - Whether repository exists
   */
  async checkRepoExists(owner, repo) {
    try {
      await this.octokit.repos.get({ owner, repo });
      return true;
    } catch (error) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Create a new repository
   * @param {Object} config - Repository configuration
   * @param {string} config.name - Repository name
   * @param {boolean} [config.private=true] - Whether repository is private
   * @param {string} [config.description] - Repository description
   * @param {boolean} [config.force=false] - Whether to force creation if exists
   * @returns {Promise<Object>} - Created repository information
   */
  async createRepository(config) {
    const {
      name,
      private: isPrivate = true,
      description,
      force = false,
    } = config;

    // Check rate limit
    if (this.rateLimit && this.rateLimit.remaining < 2) {
      throw new Error(
        `GitHub API rate limit exceeded. Resets at ${this.rateLimit.reset.toLocaleString()}`
      );
    }

    // Check if repository exists
    const [owner] = name.split("/");
    const repoName = name.includes("/") ? name.split("/")[1] : name;

    const exists = await this.checkRepoExists(owner, repoName);
    if (exists && !force) {
      throw new Error(
        `Repository ${name} already exists. Use --force to overwrite.`
      );
    }

    try {
      const { data: repo } =
        await this.octokit.repos.createForAuthenticatedUser({
          name: repoName,
          private: isPrivate,
          description,
          auto_init: true,
        });

      logger.success(`Repository ${name} created successfully`);
      return repo;
    } catch (error) {
      if (error.status === 401) {
        throw new Error(
          "Invalid GitHub token. Please run 'infraagent auth update github'"
        );
      }
      throw error;
    }
  }

  /**
   * Add secrets to repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} secrets - Secrets to add
   * @returns {Promise<void>}
   */
  async addSecrets(owner, repo, secrets) {
    for (const [name, value] of Object.entries(secrets)) {
      try {
        // Get repository public key
        const {
          data: { key, key_id },
        } = await this.octokit.actions.getRepoPublicKey({
          owner,
          repo,
        });

        // Encrypt secret value
        const { encrypted, keyId } = await encryptMessage(value, key);

        // Create or update secret
        await this.octokit.actions.createOrUpdateRepoSecret({
          owner,
          repo,
          secret_name: name,
          encrypted_value: encrypted,
          key_id,
        });

        logger.success(`Added secret ${name} to repository`);
      } catch (error) {
        logger.error(`Failed to add secret ${name}: ${error.message}`);
      }
    }
  }

  /**
   * Push initial files to repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object[]} files - Files to push
   * @returns {Promise<void>}
   */
  async pushInitialFiles(owner, repo, files) {
    const git = simpleGit();
    const repoUrl = `https://github.com/${owner}/${repo}.git`;

    try {
      // Initialize git repository
      if (!(await git.checkIsRepo())) {
        await git.init();
      }

      // Add remote
      await git.addRemote("origin", repoUrl);

      // Create and commit files
      for (const file of files) {
        const filePath = path.join(process.cwd(), file.path);
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, file.content);
        await git.add(filePath);
      }

      await git.commit("Initial commit");
      await git.push("origin", "main", ["--force"]);

      logger.success("Initial files pushed to repository");
    } catch (error) {
      logger.error(`Failed to push initial files: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Run GitHub setup for the project
 * @param {Object} config - Project configuration
 * @returns {Promise<Object>} - Setup result
 */
async function runGithubSetup(config) {
  logger.step("Setting up GitHub repository...");

  try {
    // Get GitHub token
    const secrets = await getSecrets();
    if (!secrets.github) {
      logger.error(
        'GitHub token not found. Please run "infraagent auth update github"'
      );
      throw new Error("GitHub authentication required");
    }

    // Initialize GitHub service
    const github = new GitHubService();
    await github.initialize(secrets.github);

    // Parse repo name
    const repoName = parseGitHubRepo(config.githubRepo);
    logger.info(`Using GitHub repository: ${repoName}`);

    // Create repository
    const repo = await github.createRepository({
      name: repoName,
      private: config.private !== false,
      description: config.description,
      force: config.force,
    });

    // Add repository secrets if any
    if (config.secrets) {
      await github.addSecrets(repo.owner.login, repo.name, config.secrets);
    }

    // Push initial files
    const initialFiles = [
      {
        path: "README.md",
        content: `# ${config.projectName}\n\n${config.description}`,
      },
      {
        path: ".gitignore",
        content: "node_modules\n.env\n.env.local\n.DS_Store",
      },
    ];

    await github.pushInitialFiles(repo.owner.login, repo.name, initialFiles);

    logger.success("GitHub repository setup completed");
    return {
      repoName,
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
    };
  } catch (error) {
    logger.error(`GitHub setup failed: ${error.message}`);
    throw error;
  }
}

/**
 * Parse GitHub repository name from input
 * @param {string} input - Repository name or URL
 * @returns {string} - Parsed repository name (username/repo)
 */
function parseGitHubRepo(input) {
  // Handle URLs like https://github.com/username/repo
  if (input.includes("github.com")) {
    const url = new URL(input);
    return url.pathname.substring(1); // Remove leading slash
  }

  // Handle username/repo format
  if (input.includes("/")) {
    return input;
  }

  // Handle repo name only (would need to get username from GitHub API)
  return `username/${input}`;
}

module.exports = {
  runGithubSetup,
  GitHubService,
};
