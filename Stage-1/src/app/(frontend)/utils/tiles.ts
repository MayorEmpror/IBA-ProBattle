import {
  Mesh,
  MeshStandardMaterial,
  Texture,
  RepeatWrapping,
  Box3,
  Vector3,
  BufferGeometry,
  BackSide,
  FrontSide,
  Color,
  Scene,
  WebGLRenderer,
  ShaderMaterial,
  Uniform,
  PerspectiveCamera,
  ArrowHelper,
  Raycaster,
  Vector2,
} from 'three'
import { Point } from './geometry'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import { MeshReflectionStandardMaterial } from './MeshReflectionStandardMaterial'

export function generateWallTiles(
  points: Point[],
  wallGeometry: { geometry: BufferGeometry; area: number; singularFaceNormals: any },
  textures: {
    normalTexture: Texture
    aoTexture: Texture
    diffTexture: Texture | null
  },
  textureData: {
    width: number
    height: number
  },
  scene: Scene,
  renderer: WebGLRenderer,
): Mesh {
  const { normalTexture, aoTexture, diffTexture } = textures
  const tileSizeXWall = textureData.width
  const tileSizeYWall = textureData.height
  const wallHeight = 8 // ft

  // Configure base textures
  ;[normalTexture, aoTexture, diffTexture].forEach((texture) => {
    if (!texture) return
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.magFilter = 1003
    texture.minFilter = 1003
  })

  // Create the wall mesh
  const wall: Mesh<BufferGeometry, (MeshStandardMaterial | CustomShaderMaterial)[]> = new Mesh(
    wallGeometry.geometry,
    [],
  )
  wall.name = 'RoomvisionWall'
  wall.receiveShadow = true

  // Set up material groups for each wall section
  points.forEach((point, index) => {
    const wallLength = point.min.distanceTo(point.max!)
    const { repeatX, repeatY, offsetX, offsetY } = calculateTileRepeatsCEIL(
      wallLength,
      wallHeight,
      tileSizeXWall,
      tileSizeYWall,
    )
    const diffTextureClone = diffTexture!.clone()
    diffTextureClone.repeat.set(repeatX, repeatY)
    diffTextureClone.offset.set(offsetX, offsetY)

    const normalTextureClone = normalTexture!.clone()
    normalTextureClone.repeat.set(repeatX, repeatY)
    normalTextureClone.offset.set(offsetX, offsetY)

    const aoTextureClone = aoTexture!.clone()
    aoTextureClone.repeat.set(repeatX, repeatY)
    aoTextureClone.offset.set(offsetX, offsetY)


    // Get window info if present
    const firstWindow = point.windows && point.windows[0]
    const windowLength = point.min.distanceTo(point.max)
    const dir = point.min.clone().sub(point.max).normalize()

    let windowCenterUV = [-1, -1] // Default to center if not available
    if (firstWindow) {
      // Project window center into wall local UV space
      windowCenterUV = mapPointToUV(firstWindow.centre, point.min, point.max)
      windowCenterUV[1] = 0.5
    }
    const sectionMaterial = new CustomShaderMaterial({
      side: wallGeometry.area > 0 ? BackSide : FrontSide,
      aoMapIntensity: 1,
      roughness: 1.0,
      vertexShader: `      
         varying vec2 vUv;
         void main() {
            vUv = uv;          
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); 
         }`,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          // Window masking logic: discard 2x2 UV region at center
          vec2 winCenter = vec2(${windowCenterUV[0]}, ${windowCenterUV[1]});
          float halfSize = 0.15/${(windowLength / 10).toFixed(3)}; // 2x2 in UV assuming wall UV 0..1, adjust as needed
          float halfSizeY = 0.2; // 2x2 in UV assuming wall UV 0..1, adjust as needed
          if (vUv.x > winCenter.x - halfSize && vUv.x < winCenter.x + halfSize &&
              vUv.y > winCenter.y - halfSizeY && vUv.y < winCenter.y + halfSizeY) {
            discard;
          }
        }
      `,
      normalMap: normalTextureClone,
      aoMap: aoTextureClone,
      map: diffTextureClone,
      transparent: true,
      baseMaterial: MeshStandardMaterial,
    })

    if (Array.isArray(wall.material)) {
      wall.material.push(sectionMaterial)
    } else {
      wall.material = [sectionMaterial]
    }

    // Add the material group for this wall section
    const startIndex = index * 6 // 6 vertices per wall section (2 triangles)
    wall.geometry.addGroup(startIndex, 6, index)
  })

  wall.position.y = -1.5
  wall.userData.isWallMesh = true
  wall.userData.fpoint = points[0].min
  wall.userData.singularFaceNormals = wallGeometry.singularFaceNormals
  wall.geometry.computeBoundingBox()
  wall.receiveShadow = true
  return wall
}

export function generateFloorTiles(
  floor: BufferGeometry,
  textures: {
    normalTexture: Texture
    aoTexture: Texture
    diffTexture: Texture | null
  },
  textureData: {
    width: number
    height: number
  },
  scene: Scene,
  renderer: WebGLRenderer,
): Mesh {
  const { normalTexture, aoTexture, diffTexture } = textures
  const tileSizeXFloor = textureData.width
  const tileSizeYFloor = textureData.height

  const floorMaterial = new MeshStandardMaterial({
    map: diffTexture?.clone(),
    normalMap: normalTexture?.clone(),
    aoMap: aoTexture?.clone(),
    metalness: 0.1,
    aoMapIntensity: 2,
    roughness: 0.1,
    side: 1,
  })

  const floorMesh = new Mesh(floor, floorMaterial)
  floorMesh.rotation.x = Math.PI * 0.5
  floorMesh.position.y = -1.5 // Match wall position
  floorMesh.position.x -= 0.225 // Align with wall X position
  floorMesh.geometry.computeVertexNormals()
  floorMesh.receiveShadow = true
  // Calculate the size before applying any transformations
  const bbox = new Box3().setFromObject(floorMesh)
  const floorSize = bbox.getSize(new Vector3())

  // Use the calculateTileRepeats function
  const { repeatX, repeatY, offsetX, offsetY } = calculateTileRepeats(
    floorSize.x,
    floorSize.z,
    tileSizeXFloor,
    tileSizeYFloor,
  )

  // Configure floor textures
  ;[floorMaterial.map, floorMaterial.normalMap, floorMaterial.aoMap].forEach((texture) => {
    if (!texture) return
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.magFilter = 1003
    texture.minFilter = 1003
    texture.repeat.set(repeatX, repeatY)
    texture.offset.set(offsetX, offsetY)
  })

  return floorMesh
}

export function calculateTileRepeats(
  length: number,
  height: number,
  tileSizeX: number,
  tileSizeY: number,
): TileRepeatResult {
  // Calculate exact number of tiles needed and force to integers
  const tilesX = Math.floor(length / tileSizeX)
  const tilesY = Math.floor(height / tileSizeY)

  // Use the integer number of tiles
  const repeatX = tilesX
  const repeatY = tilesY

  // Calculate offsets to center the tiles
  const remainderX = length - tilesX * tileSizeX
  const remainderY = height - tilesY * tileSizeY
  const offsetX = remainderX / (2 * tileSizeX)
  const offsetY = remainderY / (2 * tileSizeY)

  return { repeatX, repeatY, offsetX, offsetY }
}

export function calculateTileRepeatsCEIL(
  length: number,
  height: number,
  tileSizeX: number,
  tileSizeY: number,
): TileRepeatResult {
  // Calculate exact number of tiles needed and force to integers
  const tilesX = Math.ceil(length / tileSizeX)
  const tilesY = Math.ceil(height / tileSizeY)

  // Use the integer number of tiles
  const repeatX = tilesX
  const repeatY = tilesY

  // Calculate offsets to center the tiles
  const remainderX = length - tilesX * tileSizeX
  const remainderY = height - tilesY * tileSizeY
  const offsetX = remainderX / (2 * tileSizeX)
  const offsetY = remainderY / (2 * tileSizeY)

  return { repeatX, repeatY, offsetX, offsetY }
}

// Helper to map a 3D point to UV coordinates for a planar wall section
function mapPointToUV(
  point3D: Vector3, // The point to map
  min: Vector3, // The wall section's minimum corner
  max: Vector3, // The wall section's maximum corner
): [number, number] {
  const wallVec = max.clone().sub(min)
  const local = point3D.clone().sub(min)
  // Project along major axes: assume wall runs along X (length) and Y (height) in local coordinates
  // Use max absolute axis for length orientation
  let u: number, v: number
  if (Math.abs(wallVec.x) >= Math.abs(wallVec.z)) {
    // Wall is aligned mostly on X
    u = wallVec.x !== 0 ? local.x / wallVec.x : 0
    v = wallVec.y !== 0 ? local.y / wallVec.y : 0
  } else {
    // Wall is aligned mostly on Z
    u = wallVec.z !== 0 ? local.z / wallVec.z : 0
    v = wallVec.y !== 0 ? local.y / wallVec.y : 0
  }
  // Clamp range
  u = Math.min(Math.max(u, 0), 1)
  v = Math.min(Math.max(v, 0), 1)
  return [u, v]
}

interface TextureData {
  width: number
  height: number
  texture_file_norm: { url: string }
  texture_file_ao: { url: string }
  texture_file_diff?: { url: string }
}

interface TileRepeatResult {
  repeatX: number
  repeatY: number
  offsetX: number
  offsetY: number
}
