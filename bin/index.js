#!/usr/bin/env node

const { program } = require("commander");
const pkg = require("../package.json");
const { init } = require("../src/index");
const scaffold = require("../src/commands/scaffold");
const { logger } = require("../src/utils/logger");
const chalk = require("chalk");

// ASCII art logo
const LOGO = chalk.cyan(`
██╗███╗   ██╗███████╗██████╗  █████╗  ██████╗ ███████╗███╗   ██╗████████╗
██║████╗  ██║██╔════╝██╔══██╗██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝
██║██╔██╗ ██║█████╗  ██████╔╝███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   
██║██║╚██╗██║██╔══╝  ██╔══██╗██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   
██║██║ ╚████║███████╗██║  ██║██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   
╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   
`);

// Set up CLI program
program
  .name("infraagent")
  .description(
    chalk.bold(
      "InfraAgent v" + pkg.version + " - Your AI-Powered DevOps Architect\n\n"
    ) +
      chalk.gray(
        "Transform project ideas into fully-configured infrastructure in minutes.\n\n"
      ) +
      chalk.cyan("QUICK START:\n") +
      "  $ infraagent auth setup          # Configure your service credentials\n" +
      "  $ infraagent scaffold --brief project.json  # Create infrastructure\n\n" +
      chalk.cyan("COMMON COMMANDS:\n") +
      "  auth setup                       Set up all service credentials\n" +
      "  auth test                        Verify all connections\n" +
      "  scaffold --brief <file>          Create infrastructure from brief\n" +
      "  init                            Interactive project setup (legacy)\n\n" +
      chalk.cyan("EXAMPLES:\n") +
      "  Set up GitHub authentication:\n" +
      "    $ infraagent auth add github\n\n" +
      "  Create a new project:\n" +
      "    $ infraagent scaffold --brief my-project.json\n\n" +
      "  Test in dry-run mode:\n" +
      "    $ infraagent scaffold --brief my-project.json --dry-run\n\n" +
      chalk.cyan("LEARN MORE:\n") +
      "  Full documentation: https://github.com/leonardknight/infraagent\n" +
      "  Report issues: https://github.com/leonardknight/infraagent/issues\n\n" +
      chalk.yellow(
        "TIP: Need a brief template? Run: infraagent scaffold --example"
      )
  )
  .version(pkg.version)
  .option("--debug", "Enable debug mode")
  .option("--verbose", "Enable verbose output");

// Help command
program
  .command("help")
  .description("Display detailed help information")
  .action(() => {
    console.log(LOGO);
    console.log(
      chalk.bold(
        "InfraAgent v" + pkg.version + " - Your AI-Powered DevOps Architect\n"
      )
    );
    console.log(
      chalk.gray(
        "Transform project ideas into fully-configured infrastructure in minutes.\n"
      )
    );

    console.log(chalk.cyan("QUICK START:\n"));
    console.log("  1. Configure your services:");
    console.log("     $ infraagent auth setup\n");
    console.log("  2. Create a brief file (or use --example):");
    console.log("     $ infraagent scaffold --example > my-project.json\n");
    console.log("  3. Create your infrastructure:");
    console.log("     $ infraagent scaffold --brief my-project.json\n");

    console.log(chalk.cyan("\nCOMMAND REFERENCE:\n"));

    console.log(chalk.bold("Authentication (auth):\n"));
    console.log(
      "  setup                     Interactive setup wizard for all services"
    );
    console.log("  add <service>            Add or update a specific service");
    console.log("  list                     Show configured services");
    console.log("  test                     Test all service connections");
    console.log("  remove <service>         Remove a service configuration\n");
    console.log("  Examples:");
    console.log("    $ infraagent auth setup");
    console.log("    $ infraagent auth add github");
    console.log("    $ infraagent auth test\n");

    console.log(chalk.bold("Scaffolding (scaffold):\n"));
    console.log("  --brief <file>           Path to brief JSON file");
    console.log("  --dry-run               Show what would be created");
    console.log("  --example               Output a sample brief file");
    console.log(
      "  --list-examples         List all available example briefs\n"
    );
    console.log("  Examples:");
    console.log("    $ infraagent scaffold --brief project.json");
    console.log("    $ infraagent scaffold --example > template.json");
    console.log("    $ infraagent scaffold --brief project.json --dry-run");
    console.log("    $ infraagent scaffold --list-examples\n");

    console.log(chalk.bold("Initialization (init):\n"));
    console.log("  --force                 Force initialization");
    console.log("  --template <name>       Use specific template");
    console.log("  --yes                   Skip confirmation prompts\n");
    console.log("  Examples:");
    console.log("    $ infraagent init");
    console.log("    $ infraagent init --template basic");
    console.log("    $ infraagent init --force --yes\n");

    console.log(chalk.cyan("\nTIPS:\n"));
    console.log("  • Use --dry-run to preview changes");
    console.log("  • Run auth test to verify connections");
    console.log("  • Check --debug for detailed logs");
    console.log("  • Use --example to get started quickly\n");

    console.log(chalk.cyan("LEARN MORE:\n"));
    console.log("  Documentation: https://github.com/leonardknight/infraagent");
    console.log("  Issues: https://github.com/leonardknight/infraagent/issues");
    console.log("  Support: support@infraagent.dev\n");
  });

// Init command
program
  .command("init")
  .alias("i")
  .description("Initialize a new project with infrastructure scaffolding")
  .option("-f, --force", "Force initialization even if project exists")
  .option(
    "-t, --template <template>",
    "Specify a template to use (basic, advanced)"
  )
  .option("-y, --yes", "Skip confirmation prompts")
  .action(async (options) => {
    try {
      // Set debug mode if specified
      if (options.debug) {
        process.env.DEBUG = "true";
      }

      // Set verbose mode if specified
      if (options.verbose) {
        process.env.VERBOSE = "true";
      }

      await init(options);
    } catch (error) {
      logger.error(`Error initializing project: ${error.message}`);
      if (process.env.DEBUG) {
        logger.error(error.stack);
      }
      process.exit(1);
    }
  });

// Auth commands
program
  .command("auth [action] [service]")
  .description("Manage authentication for services")
  .option("-f, --force", "Force re-authentication")
  .addHelpText(
    "after",
    `
Examples:
  $ infraagent auth setup
  $ infraagent auth list
  $ infraagent auth add github
  $ infraagent auth test
  $ infraagent auth remove vercel

Available actions:
  setup   Interactive wizard to configure all services
  add     Add/update a specific service
  list    Show configured services
  test    Test all configured services
  remove  Remove a service

Available services:
  github     GitHub repository access
  vercel     Vercel deployment
  supabase   Supabase database
  cloudflare Cloudflare DNS
  stripe     Stripe payments
  `
  )
  .action(async (action = "setup", service, options) => {
    try {
      const auth = require("../src/commands/auth");

      switch (action) {
        case "setup":
          await auth.setup();
          break;
        case "add":
          if (!service) {
            logger.error("Please specify a service to add");
            process.exit(1);
          }
          await auth.add(service);
          break;
        case "list":
          await auth.list();
          break;
        case "test":
          await auth.test();
          break;
        case "remove":
          if (!service) {
            logger.error("Please specify a service to remove");
            process.exit(1);
          }
          await auth.remove(service);
          break;
        default:
          logger.error(`Unknown action: ${action}`);
          process.exit(1);
      }
    } catch (error) {
      logger.error(`Auth command failed: ${error.message}`);
      if (process.env.DEBUG) {
        logger.error(error.stack);
      }
      process.exit(1);
    }
  });

// Scaffold command
program
  .command("scaffold")
  .alias("s")
  .description("Scaffold a project from a brief file")
  .option("-b, --brief <file>", "Path to the brief JSON file")
  .option("-d, --dry-run", "Perform a dry run without making changes")
  .option("-e, --example", "Show an example brief file")
  .option("-l, --list-examples", "List all available example briefs")
  .addHelpText(
    "after",
    `
Examples:
  $ infraagent scaffold --brief project.json
  $ infraagent scaffold --brief project.json --dry-run
  $ infraagent scaffold --example > template.json
  $ infraagent scaffold --list-examples

Brief File Locations:
  • briefs/projects/    Your project briefs (not tracked in git)
  • briefs/examples/    Example briefs for different project types
  • briefs/templates/   Blank templates for customization

Run 'infraagent scaffold --list-examples' to see available examples.
  `
  )
  .action(async (options) => {
    try {
      if (!options.brief && !options.example && !options.listExamples) {
        logger.error(
          "Please provide a brief file or use --example/--list-examples"
        );
        process.exit(1);
      }
      await scaffold(options);
    } catch (error) {
      logger.error(`Scaffold command failed: ${error.message}`);
      if (process.env.DEBUG) {
        logger.error(error.stack);
      }
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
