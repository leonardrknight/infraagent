const inquirer = require('inquirer');

/**
 * Get prompts for InfraPal CLI initialization
 * @returns {Array} Array of inquirer prompt objects
 */
function getPrompts() {
  return [
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: input => input.trim() !== '' ? true : 'Project name is required'
    },
    {
      type: 'checkbox',
      name: 'services',
      message: 'Select services to include:',
      choices: [
        { name: 'GitHub', value: 'github', checked: true },
        { name: 'Vercel', value: 'vercel' },
        { name: 'Supabase', value: 'supabase' },
        { name: 'Cloudflare', value: 'cloudflare' },
        { name: 'Stripe', value: 'stripe' }
      ],
      validate: input => input.length > 0 ? true : 'Please select at least one service'
    },
    {
      type: 'input',
      name: 'githubRepo',
      message: 'GitHub repository name or URL:',
      when: answers => answers.services.includes('github'),
      validate: input => input.trim() !== '' ? true : 'GitHub repository name is required'
    },
    {
      type: 'input',
      name: 'supabaseProject',
      message: 'Supabase project name (optional):',
      when: answers => answers.services.includes('supabase'),
      default: answers => answers.projectName ? answers.projectName.toLowerCase().replace(/\s+/g, '-') : ''
    },
    {
      type: 'input',
      name: 'vercelProject',
      message: 'Vercel project name (optional):',
      when: answers => answers.services.includes('vercel'),
      default: answers => answers.projectName ? answers.projectName.toLowerCase().replace(/\s+/g, '-') : ''
    },
    {
      type: 'input',
      name: 'domainName',
      message: 'Domain name (optional):',
      when: answers => answers.services.includes('cloudflare') || answers.services.includes('vercel')
    },
    {
      type: 'confirm',
      name: 'createEnvFiles',
      message: 'Create .env files?',
      default: true
    }
  ];
}

module.exports = {
  getPrompts
};
