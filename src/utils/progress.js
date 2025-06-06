const ora = require("ora").default;
const chalk = require("chalk");
const pkg = require("../../package.json");

class ProgressTracker {
  constructor() {
    this.startTime = Date.now();
    this.spinner = null;
    this.completedSteps = [];
  }

  /**
   * Show project header
   * @param {Object} config - Project configuration
   */
  showHeader(config) {
    console.log(chalk.bold(`\nInfraAgent v${pkg.version}\n`));
    console.log(chalk.cyan("📋 Project:"), chalk.white(config.projectName));
    console.log(
      chalk.cyan("🎯 Repository:"),
      chalk.white(config.services.github.repo)
    );
    console.log();
  }

  /**
   * Start a new operation with spinner
   * @param {string} text - Operation description
   */
  startOperation(text) {
    if (this.spinner) {
      this.spinner.stop();
    }
    this.spinner = ora({
      text,
      color: "cyan",
      spinner: "dots",
    }).start();
  }

  /**
   * Complete the current operation
   * @param {string} text - Success message
   * @param {number} [duration] - Operation duration in ms
   */
  completeOperation(text, duration) {
    if (this.spinner) {
      this.spinner.succeed(text);
      this.spinner = null;
    }
    this.completedSteps.push({
      text,
      duration: duration || 0,
    });
  }

  /**
   * Fail the current operation
   * @param {string} text - Error message
   */
  failOperation(text) {
    if (this.spinner) {
      this.spinner.fail(text);
      this.spinner = null;
    }
  }

  /**
   * Show execution plan for dry run
   * @param {Object} config - Project configuration
   */
  showExecutionPlan(config) {
    console.log(chalk.bold("\nExecution Plan\n"));

    // GitHub Repository
    console.log(chalk.cyan("1. GitHub Repository"));
    console.log(`   • Name: ${config.services.github.repo}`);
    console.log(`   • Private: ${config.services.github.private}`);
    console.log(`   • Description: ${config.services.github.description}`);

    // Repository Secrets
    console.log(chalk.cyan("\n2. Repository Secrets"));
    const secrets = [];

    if (config.services.vercel) {
      secrets.push("VERCEL_TOKEN");
    }

    if (config.services.supabase) {
      secrets.push("SUPABASE_URL");
      secrets.push("SUPABASE_KEY");
    }

    if (secrets.length > 0) {
      secrets.forEach((secret) => {
        console.log(`   • ${secret}`);
      });
    } else {
      console.log("   • No secrets to add");
    }

    // Initial Files
    console.log(chalk.cyan("\n3. Initial Files"));
    console.log("   • README.md");
    console.log("   • .gitignore");
    console.log("   • .infraagent/brief.json");

    // Services
    console.log(chalk.cyan("\n4. Services"));
    Object.entries(config.services).forEach(([service, settings]) => {
      console.log(`   • ${service.toUpperCase()}`);
      Object.entries(settings).forEach(([key, value]) => {
        if (key !== "private" && key !== "description") {
          console.log(`     - ${key}: ${value}`);
        }
      });
    });
  }

  /**
   * Clean up any active spinner
   */
  cleanup() {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  /**
   * Show completion summary
   * @param {Object} results - Execution results
   */
  showCompletion(results) {
    // Clean up any active spinner
    this.cleanup();

    const totalTime = (Date.now() - this.startTime) / 1000;

    console.log();
    this.completedSteps.forEach((step) => {
      const duration = step.duration
        ? ` (${(step.duration / 1000).toFixed(1)}s)`
        : "";
      console.log(chalk.green("✓"), step.text + duration);
    });

    console.log(
      chalk.bold.green(
        `\n✅ Infrastructure ready in ${totalTime.toFixed(1)}s\n`
      )
    );

    if (results.repository) {
      console.log(chalk.cyan("Repository:"), results.repository.url);
      console.log();
      console.log(chalk.cyan("Next steps:"));
      console.log(chalk.cyan("→"), `git clone ${results.repository.cloneUrl}`);
      console.log(chalk.cyan("→"), `cd ${results.repository.name}`);
      console.log(chalk.cyan("→"), "npm install");
    }
  }

  /**
   * Show error summary
   * @param {Object} results - Execution results
   */
  showError(results) {
    // Clean up any active spinner
    this.cleanup();

    console.log(chalk.bold.red("\n❌ Scaffolding failed!\n"));

    results.errors.forEach((error) => {
      console.log(chalk.red("•"), error);
    });

    if (results.steps.length > 0) {
      console.log(chalk.yellow("\nCompleted steps:"));
      results.steps.forEach((step) => {
        console.log(
          step.success ? chalk.green("✓") : chalk.red("✗"),
          step.name
        );
      });
    }
  }
}

module.exports = ProgressTracker;
