import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process'

const getGitCommitHash = () => {
  try {
    return execSync('git rev-parse HEAD').toString().trim().slice(0, 12)
  } catch {
    return 'unknown'
  }
}

const getGitBranch = () => {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  } catch {
    return 'unknown'
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false,
  },
  define: {
    __BUILD_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
    __BUILD_COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
    __BUILD_BRANCH__: JSON.stringify(getGitBranch()),
    __BUILD_ENVIRONMENT__: JSON.stringify(process.env.VERCEL_ENV || 'development'),
    __BUILD_DEPLOYMENT_ID__: JSON.stringify(process.env.VERCEL_DEPLOYMENT_ID || 'local'),
  },
})
