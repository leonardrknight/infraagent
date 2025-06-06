const { logger } = require("../utils/logger");
const { parseBrief } = require("../core/brief-schema");
const { planProject, execute } = require("../core/orchestrator");
const ProgressTracker = require("../utils/progress");
const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");

// Brief directories
const BRIEFS_DIR = path.join(process.cwd(), "briefs");
const EXAMPLES_DIR = path.join(BRIEFS_DIR, "examples");
const TEMPLATES_DIR = path.join(BRIEFS_DIR, "templates");
const PROJECTS_DIR = path.join(BRIEFS_DIR, "projects");

/**
 * List available example briefs
 * @returns {Promise<string[]>} - List of example briefs
 */
async function listExamples() {
  const examples = await fs.readdir(EXAMPLES_DIR);
  return examples.filter((file) => file.endsWith(".json"));
}

/**
 * Show example brief selection menu
 * @returns {Promise<string>} - Selected example path
 */
async function selectExample() {
  const examples = await listExamples();

  const { selected } = await inquirer.prompt([
    {
      type: "list",
      name: "selected",
      message: "Select an example brief:",
      choices: examples.map((file) => ({
        name: file
          .replace(".json", "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        value: file,
      })),
    },
  ]);

  return path.join(EXAMPLES_DIR, selected);
}

/**
 * Output a sample brief file
 * @param {boolean} listOnly - Whether to only list examples
 */
async function handleExample(listOnly) {
  if (listOnly) {
    const examples = await listExamples();
    logger.info("\nAvailable example briefs:");
    examples.forEach((file) => {
      const name = file
        .replace(".json", "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      logger.info(`  • ${name} (${file})`);
    });
    return;
  }

  const examplePath = await selectExample();
  const content = await fs.readFile(examplePath, "utf8");
  console.log(content);
}

/**
 * Scaffold a project from a brief file
 * @param {Object} options - Command options
 * @param {string} options.brief - Path to brief file
 * @param {boolean} [options.dryRun] - Whether to perform a dry run
 * @param {boolean} [options.force] - Whether to force overwrite
 * @param {boolean} [options.example] - Whether to show example
 * @param {boolean} [options.listExamples] - Whether to list examples
 * @returns {Promise<void>}
 */
async function scaffold(options) {
  // Handle example flags
  if (options.example || options.listExamples) {
    await handleExample(options.listExamples);
    return;
  }

  const progress = new ProgressTracker();

  try {
    // Read and validate brief
    progress.startOperation("Reading brief file...");
    const brief = await parseBrief(options.brief);
    progress.completeOperation("Brief validated");

    // Plan project configuration
    progress.startOperation("Planning project configuration...");
    const config = planProject(brief);
    progress.completeOperation("Project configuration planned");

    // Show header
    progress.showHeader(config);

    // Show execution plan in dry run mode
    if (options.dryRun) {
      progress.showExecutionPlan(config);
      return;
    }

    // Execute the plan
    progress.startOperation("Scaffolding infrastructure...");
    const results = await execute(config, { force: options.force });

    // Handle results
    if (results.success) {
      progress.showCompletion(results);
    } else {
      progress.showError(results);
    }
  } catch (error) {
    progress.failOperation(`Scaffolding failed: ${error.message}`);
    if (error.stack && process.env.DEBUG) {
      logger.debug(error.stack);
    }
    throw error;
  }
}

module.exports = scaffold;
