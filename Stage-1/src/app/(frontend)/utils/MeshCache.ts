import { Object3D } from 'three'

class MeshCacheManager {
  private static instance: MeshCacheManager
  private cache: MeshCache = {}
  private maxCacheAge = 1000 * 60 * 5 // 5 minutes

  private constructor() {
    // Start cleanup interval
    setInterval(() => this.cleanup(), 1000 * 60) // Clean every minute
  }

  public static getInstance(): MeshCacheManager {
    if (!MeshCacheManager.instance) {
      MeshCacheManager.instance = new MeshCacheManager()
    }
    return MeshCacheManager.instance
  }

  public async getOrCreateMesh(key: string, createFn: () => Promise<Object3D>): Promise<Object3D> {
    // Check if mesh exists in cache and is not too old
    if (this.cache[key]) {
      this.cache[key].lastUsed = Date.now()
      return this.cache[key].mesh.clone()
    }

    // If not in cache, create new mesh
    const mesh = await createFn()
    this.cache[key] = {
      mesh: mesh.clone(), // Store a clone in the cache
      lastUsed: Date.now(),
    }

    return mesh
  }

  private cleanup() {
    const now = Date.now()
    Object.keys(this.cache).forEach((key) => {
      if (now - this.cache[key].lastUsed > this.maxCacheAge) {
        delete this.cache[key]
      }
    })
  }

  public clearCache() {
    this.cache = {}
  }
}

interface MeshCache {
  [key: string]: {
    mesh: Object3D
    lastUsed: number
  }
}

export default MeshCacheManager
