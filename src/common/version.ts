// version
// =======

/**
 * @alpha
 */
export function getVersion (): string {
  return process.env['PACKAGE_VERSION'] ?? 'Unknown'
}

/**
 * @alpha
 */
export function getBuildTime (): string {
  return process.env['BUILD_TIME'] ?? 'Unknown'
}
