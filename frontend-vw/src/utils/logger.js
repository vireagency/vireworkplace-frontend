/**
 * Production-safe logging utility
 * Disables console.logs in production environment
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

const shouldLog = !isProduction;

/**
 * Production-safe console.log
 * Only logs in development environment
 */
export const log = (...args) => {
  if (shouldLog) {
    console.log(...args);
  }
};

/**
 * Production-safe console.error
 * Errors are suppressed in production console; extend here for remote reporting
 */
export const logError = (...args) => {
  if (shouldLog || isDevelopment) {
    console.error(...args);
  }
};

/**
 * Production-safe console.warn
 * Only logs outside production builds
 */
export const logWarn = (...args) => {
  if (shouldLog) {
    console.warn(...args);
  }
};

/**
 * Production-safe console.info
 * Only logs in development environment
 */
export const logInfo = (...args) => {
  if (shouldLog) {
    console.info(...args);
  }
};

/**
 * Production-safe console.debug
 * Only logs in development environment
 */
export const logDebug = (...args) => {
  if (shouldLog) {
    console.debug(...args);
  }
};

/**
 * Production-safe console.group
 * Only logs in development environment
 */
export const logGroup = (label) => {
  if (shouldLog) {
    console.group(label);
  }
};

/**
 * Production-safe console.groupEnd
 * Only logs in development environment
 */
export const logGroupEnd = () => {
  if (shouldLog) {
    console.groupEnd();
  }
};

/**
 * Production-safe console.table
 * Only logs in development environment
 */
export const logTable = (data) => {
  if (shouldLog) {
    console.table(data);
  }
};

/**
 * Production-safe console.time
 * Only logs in development environment
 */
export const logTime = (label) => {
  if (shouldLog) {
    console.time(label);
  }
};

/**
 * Production-safe console.timeEnd
 * Only logs in development environment
 */
export const logTimeEnd = (label) => {
  if (shouldLog) {
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
