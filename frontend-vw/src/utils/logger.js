/**
 * Production-safe logging utility
 * Disables console.logs in production environment
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Production-safe console.log
 * Only logs in development environment
 */
export const log = (...args) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

/**
 * Production-safe console.error
 * Always logs errors, even in production
 */
export const logError = (...args) => {
  console.error(...args);
};

/**
 * Production-safe console.warn
 * Always logs warnings, even in production
 */
export const logWarn = (...args) => {
  console.warn(...args);
};

/**
 * Production-safe console.info
 * Only logs in development environment
 */
export const logInfo = (...args) => {
  if (isDevelopment) {
    console.info(...args);
  }
};

/**
 * Production-safe console.debug
 * Only logs in development environment
 */
export const logDebug = (...args) => {
  if (isDevelopment) {
    console.debug(...args);
  }
};

/**
 * Production-safe console.group
 * Only logs in development environment
 */
export const logGroup = (label) => {
  if (isDevelopment) {
    console.group(label);
  }
};

/**
 * Production-safe console.groupEnd
 * Only logs in development environment
 */
export const logGroupEnd = () => {
  if (isDevelopment) {
    console.groupEnd();
  }
};

/**
 * Production-safe console.table
 * Only logs in development environment
 */
export const logTable = (data) => {
  if (isDevelopment) {
    console.table(data);
  }
};

/**
 * Production-safe console.time
 * Only logs in development environment
 */
export const logTime = (label) => {
  if (isDevelopment) {
    console.time(label);
  }
};

/**
 * Production-safe console.timeEnd
 * Only logs in development environment
 */
export const logTimeEnd = (label) => {
  if (isDevelopment) {
    console.timeEnd(label);
  }
};

// Default export with all logging functions
export default {
  log,
  logError,
  logWarn,
  logInfo,
  logDebug,
  logGroup,
  logGroupEnd,
  logTable,
  logTime,
  logTimeEnd,
};
