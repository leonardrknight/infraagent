const chalk = require('chalk');

/**
 * Logger utility for InfraPal CLI
 * Provides consistent, color-coded logging throughout the application
 */
const logger = {
  /**
   * Log an informational message
   * @param {string} message - Message to log
   */
  info: (message) => {
    console.log(chalk.blue('ℹ ') + message);
  },
  
  /**
   * Log a success message
   * @param {string} message - Message to log
   */
  success: (message) => {
    console.log(chalk.green('✓ ') + message);
  },
  
  /**
   * Log a warning message
   * @param {string} message - Message to log
   */
  warn: (message) => {
    console.log(chalk.yellow('⚠ ') + message);
  },
  
  /**
   * Log an error message
   * @param {string} message - Message to log
   */
  error: (message) => {
    console.log(chalk.red('✗ ') + message);
  },
  
  /**
   * Log a step in the process
   * @param {string} message - Message to log
   */
  step: (message) => {
    console.log(chalk.cyan('→ ') + message);
  },
  
  /**
   * Log a debug message (only in verbose mode)
   * @param {string} message - Message to log
   */
  debug: (message) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🔍 ') + message);
    }
  }
};

module.exports = {
  logger
};
