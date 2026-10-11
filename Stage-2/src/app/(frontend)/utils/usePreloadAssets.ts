import { useEffect, useMemo, useRef } from "react"
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js"

export function useAssetPreload(assets: string[]) {
  const assetsHaveLoaded = useRef(false)
  const preloadedAssets = useRef<GLTF[]>([])
  const loader = useMemo(() => new GLTFLoader(), [])

  useEffect(() => {
    if (assetsHaveLoaded.current) return
    assetsHaveLoaded.current = true

    ;(async () => {
      for (const asset of assets) {
        const gltf = await loader.loadAsync(asset)
        preloadedAssets.current.push(gltf)
      }
    })()
  }, [assets, loader])

  return preloadedAssets
}
