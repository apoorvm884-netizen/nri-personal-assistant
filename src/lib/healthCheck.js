import { getPocketBase } from './pocketbase'

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'

export async function runHealthCheck() {
  const results = {}

  // Frontend reachable
  results.frontend = {
    name: 'Frontend',
    status: 'PASS',
    detail: `${window.location.origin} is reachable`,
  }

  // PocketBase reachable via health endpoint
  try {
    const healthRes = await fetch(`${PB_URL}/api/health`, { method: 'GET', signal: AbortSignal.timeout(5000) })
    if (healthRes.ok) {
      const healthData = await healthRes.json()
      results.pocketbase = {
        name: 'PocketBase API',
        status: 'PASS',
        detail: `API is healthy (${PB_URL})`,
      }
    } else {
      results.pocketbase = {
        name: 'PocketBase API',
        status: 'FAIL',
        detail: `Health endpoint returned ${healthRes.status}`,
      }
    }
  } catch (err) {
    results.pocketbase = {
      name: 'PocketBase API',
      status: 'FAIL',
      detail: `Cannot reach ${PB_URL}: ${err.message}`,
    }
  }

  // Database reachable via PB list collections
  try {
    const pb = getPocketBase()
    const collections = await pb.collections.getFullList({ signal: AbortSignal.timeout(5000) })
    const collectionNames = collections.map(c => c.name).join(', ')
    results.database = {
      name: 'Database',
      status: 'PASS',
      detail: `Connected. Collections: ${collectionNames}`,
    }
  } catch (err) {
    results.database = {
      name: 'Database',
      status: 'FAIL',
      detail: `Cannot query collections: ${err.message}`,
    }
  }

  const allPass = Object.values(results).every(r => r.status === 'PASS')

  return {
    status: allPass ? 'PASS' : 'FAIL',
    timestamp: new Date().toISOString(),
    checks: results,
  }
}