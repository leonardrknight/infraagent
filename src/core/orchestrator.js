const { logger } = require("../utils/logger");
const { GitHubService } = require("../services/github");
const { getSecrets } = require("../utils/secrets");
const fs = require("fs-extra");
const path = require("path");

/**
 * Generate consistent names for all services
 * @param {string} projectName - Base project name
 * @param {Object} strategy - Naming strategy options
 * @returns {Object} Service names
 */
function generateConsistentNames(projectName, strategy = {}) {
  const slug =
    strategy.slug || projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return {
    github: slug,
    vercel: {
      dev: `${slug}-dev`,
      staging: `${slug}-staging`,
      prod: `${slug}-prod`,
    },
    supabase: `${slug}-db`,
  };
}

/**
 * Plan project configuration from brief
 * @param {Object} brief - Project brief
 * @returns {Object} Project configuration
 */
function planProject(brief) {
  const names = generateConsistentNames(brief.projectName, brief.branding);

  // Start with base configuration
  const config = {
    projectName: brief.projectName,
    description: brief.description,
    stack: brief.stack,
    services: {},
    environments: brief.environments || [
      "development",
      "staging",
      "production",
    ],
    features: brief.features || [],
  };

  // Add GitHub service configuration
  if (brief.services?.github) {
    config.services.github = {
      repo: brief.services.github.repo || names.github,
      private: brief.services.github.private ?? true, // Default to true if not specified
      description: brief.services.github.description || brief.description,
    };
  }

  // Add Vercel service configuration if specified
  if (brief.services?.vercel) {
    config.services.vercel = {
      projects: brief.services.vercel.projects || names.vercel,
    };
  }

  // Add Supabase service configuration if specified
  if (brief.services?.supabase) {
    config.services.supabase = {
      project: brief.services.supabase.project || names.supabase,
    };
  }

  return config;
}

/**
 * Execute the scaffolding plan
 * @param {Object} config - Project configuration
 * @param {Object} options - Execution options
 * @returns {Promise<Object>} Execution results
 */
async function execute(config, options = {}) {
  const results = {
    success: true,
    steps: [],
    errors: [],
  };

  try {
    // Get service tokens
    const secrets = await getSecrets();

    // Initialize GitHub service
    if (!secrets.github) {
      throw new Error(
        'GitHub token not found. Please run "infraagent auth update github"'
      );
    }

    const github = new GitHubService();
    await github.initialize(secrets.github);

    // Create GitHub repository
    logger.step("Creating GitHub repository...");
    const repo = await github.createRepository({
      name: config.services.github.repo,
      private: config.services.github.private,
      description: config.services.github.description,
      force: options.force,
    });
    results.steps.push({ name: "GitHub repository creation", success: true });

    // Prepare initial files
    const initialFiles = [
      {
        path: "README.md",
        content: `# ${config.projectName}\n\n${config.description}`,
      },
      {
        path: ".gitignore",
        content: "node_modules\n.env\n.env.local\n.DS_Store",
      },
      {
        path: ".infraagent/brief.json",
        content: JSON.stringify(config, null, 2),
      },
    ];

    // Add repository secrets only for services that are configured
    const repoSecrets = {};

    if (config.services.vercel && secrets.vercel) {
      repoSecrets.VERCEL_TOKEN = secrets.vercel;
    }

    if (config.services.supabase && secrets.supabase) {
      repoSecrets.SUPABASE_URL = `https://${config.services.supabase.project}.supabase.co`;
      repoSecrets.SUPABASE_KEY = secrets.supabase;
    }

    if (Object.keys(repoSecrets).length > 0) {
      await github.addSecrets(repo.owner.login, repo.name, repoSecrets);
      results.steps.push({ name: "Adding repository secrets", success: true });
    }

    // Push initial files
    await github.pushInitialFiles(repo.owner.login, repo.name, initialFiles);
    results.steps.push({ name: "Pushing initial files", success: true });

    results.repository = {
      name: config.services.github.repo,
      url: repo.html_url,
      cloneUrl: repo.clone_url,
    };
  } catch (error) {
    results.success = false;
    results.errors.push(error.message);
    logger.error(`Execution failed: ${error.message}`);
  }

  return results;
}

module.exports = {
  planProject,
  generateConsistentNames,
  execute,
};
