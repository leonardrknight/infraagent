const { logger } = require("../utils/logger");

/**
 * Project type definitions and their requirements
 */
const PROJECT_TYPES = {
  "web-app": {
    requiredServices: ["github"],
    optionalServices: ["vercel", "supabase", "cloudflare", "stripe"],
  },
  "cli-tool": {
    requiredServices: ["github"],
    optionalServices: ["npm"],
  },
  "api-service": {
    requiredServices: ["github"],
    optionalServices: ["vercel", "supabase", "cloudflare"],
  },
  documentation: {
    requiredServices: ["github"],
    optionalServices: ["vercel"],
  },
};

/**
 * Validate a brief object against the schema
 * @param {Object} brief - The brief object to validate
 * @returns {Object} - Validation result with isValid and errors
 */
function validateBrief(brief) {
  const errors = [];

  // Check required fields
  if (!brief.projectName) {
    errors.push("projectName is required");
  } else if (typeof brief.projectName !== "string") {
    errors.push("projectName must be a string");
  }

  if (!brief.description) {
    errors.push("description is required");
  } else if (typeof brief.description !== "string") {
    errors.push("description must be a string");
  }

  // Validate project type
  if (!brief.projectType) {
    errors.push("projectType is required");
  } else if (!Object.keys(PROJECT_TYPES).includes(brief.projectType)) {
    errors.push(
      `Invalid projectType: ${brief.projectType}. Must be one of: ${Object.keys(
        PROJECT_TYPES
      ).join(", ")}`
    );
  }

  // Validate stack (supports both array and object formats)
  if (!brief.stack) {
    errors.push("stack is required");
  } else if (typeof brief.stack !== "object") {
    errors.push("stack must be an object or array");
  } else {
    if (Array.isArray(brief.stack)) {
      // Array format validation
      brief.stack.forEach((item) => {
        if (typeof item !== "string") {
          errors.push("stack array items must be strings");
        }
      });
    } else {
      // Object format validation
      const validStackKeys = [
        "frontend",
        "backend",
        "database",
        "infrastructure",
      ];
      Object.entries(brief.stack).forEach(([key, value]) => {
        if (!validStackKeys.includes(key)) {
          errors.push(
            `Invalid stack key: ${key}. Must be one of: ${validStackKeys.join(
              ", "
            )}`
          );
        }
        if (typeof value !== "string") {
          errors.push(`stack.${key} must be a string`);
        }
      });
    }
  }

  // Validate services based on project type
  if (brief.services) {
    if (typeof brief.services !== "object") {
      errors.push("services must be an object");
    } else {
      const projectType = PROJECT_TYPES[brief.projectType];
      const requiredServices = projectType.requiredServices;
      const optionalServices = projectType.optionalServices;

      // Check required services
      requiredServices.forEach((service) => {
        if (!brief.services[service]) {
          errors.push(`Required service '${service}' is missing`);
        }
      });

      // Validate service configurations
      Object.entries(brief.services).forEach(([service, config]) => {
        if (![...requiredServices, ...optionalServices].includes(service)) {
          errors.push(
            `Invalid service: ${service}. Must be one of: ${[
              ...requiredServices,
              ...optionalServices,
            ].join(", ")}`
          );
        }
        if (typeof config !== "object") {
          errors.push(`services.${service} must be an object`);
        }
      });
    }
  }

  // Validate optional fields
  if (brief.branding) {
    if (typeof brief.branding !== "object") {
      errors.push("branding must be an object");
    } else {
      if (brief.branding.colors && !Array.isArray(brief.branding.colors)) {
        errors.push("branding.colors must be an array");
      }
      if (brief.branding.logo && typeof brief.branding.logo !== "string") {
        errors.push("branding.logo must be a string");
      }
    }
  }

  // Features are now flexible - any string is allowed
  if (brief.features) {
    if (!Array.isArray(brief.features)) {
      errors.push("features must be an array");
    } else {
      brief.features.forEach((feature) => {
        if (typeof feature !== "string") {
          errors.push("features array items must be strings");
        }
      });
    }
  }

  if (brief.environments) {
    if (!Array.isArray(brief.environments)) {
      errors.push("environments must be an array");
    } else {
      const validEnvs = ["development", "staging", "production"];
      brief.environments.forEach((env) => {
        if (!validEnvs.includes(env)) {
          errors.push(
            `Invalid environment: ${env}. Must be one of: ${validEnvs.join(
              ", "
            )}`
          );
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Parse and validate a brief file
 * @param {string} briefPath - Path to the brief JSON file
 * @returns {Promise<Object>} - Parsed and validated brief
 */
async function parseBrief(briefPath) {
  try {
    const fs = require("fs-extra");
    const briefContent = await fs.readFile(briefPath, "utf8");
    const brief = JSON.parse(briefContent);

    const validation = validateBrief(brief);
    if (!validation.isValid) {
      throw new Error(`Invalid brief: ${validation.errors.join(", ")}`);
    }

    return brief;
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(`Brief file not found: ${briefPath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in brief file: ${error.message}`);
    }
    throw error;
  }
}

module.exports = {
  validateBrief,
  parseBrief,
};
