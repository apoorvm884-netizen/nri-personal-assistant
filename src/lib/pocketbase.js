import PocketBase from 'pocketbase'

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'

let pbInstance = null

export function getPocketBase() {
  if (!pbInstance) {
    pbInstance = new PocketBase(PB_URL)
  }
  return pbInstance
}

export function clearPocketBaseInstance() {
  pbInstance = null
}

export default getPocketBase
