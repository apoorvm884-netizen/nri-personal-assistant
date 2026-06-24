const buildInfo = {
  version: typeof __BUILD_VERSION__ !== 'undefined' ? __BUILD_VERSION__ : '1.0.0',
  timestamp: typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : new Date().toISOString(),
  commitHash: typeof __BUILD_COMMIT_HASH__ !== 'undefined' ? __BUILD_COMMIT_HASH__ : 'unknown',
  branch: typeof __BUILD_BRANCH__ !== 'undefined' ? __BUILD_BRANCH__ : 'unknown',
  environment: typeof __BUILD_ENVIRONMENT__ !== 'undefined' ? __BUILD_ENVIRONMENT__ : 'development',
  deploymentId: typeof __BUILD_DEPLOYMENT_ID__ !== 'undefined' ? __BUILD_DEPLOYMENT_ID__ : 'local',

  get formattedTimestamp() {
    try {
      return new Date(this.timestamp).toLocaleString('en-IN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      })
    } catch {
      return this.timestamp
    }
  },

  get formattedVersion() {
    return `v${this.version}`
  },

  get fullLabel() {
    return `${this.formattedVersion} | ${this.formattedTimestamp} | ${this.commitHash}`
  },
}

export default buildInfo