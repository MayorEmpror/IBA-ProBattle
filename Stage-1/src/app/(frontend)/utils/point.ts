import { Vector3, Mesh, BufferGeometry, MeshStandardMaterial, Matrix3, Object3D, Box3, Vector2 } from 'three'

import AugmentedOBB, { PolygonDirection } from './AugmentedOBB'
import { OBB } from 'three/examples/jsm/Addons.js'
import { Furniture } from '@/app/(frontend)/context/FurniturePlacementContext'

interface Window {
  centre: Vector3, // x, z, 
}
interface Point {
  min: Vector3
  max: Vector3
  added?: Mesh<BufferGeometry, MeshStandardMaterial>
  windows?: Window[]
}

const sortPoints = (points: Point[]) => {
  const sortedPoints = [...points]
  let hasPerformedSort = false
  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const current = sortedPoints[i]
    let nextIndex = i + 1
    let next = sortedPoints[nextIndex]

    // Find the next connecting point
    while (nextIndex < sortedPoints.length) {
      const start = current.max!
      const end = next.min

      // Check if points need flipping
      if (start.distanceTo(end) > 0.01) {
        hasPerformedSort = true
        // Check reverse connection
        const reverseDistance = start.distanceTo(next.max!)
        if (reverseDistance <= 0.01) {
          // Flip the next point
          ;[next.min, next.max] = [next.max!, next.min]
          sortedPoints[nextIndex] = next
          break
        }

        // Find another point that connects
        const connectorIndex = sortedPoints.findIndex(
          (p, idx) =>
            idx > nextIndex &&
            (start.distanceTo(p.min) <= 0.01 || start.distanceTo(p.max!) <= 0.01),
        )

        if (connectorIndex > -1) {
          // Swap positions with the connecting point
          ;[sortedPoints[nextIndex], sortedPoints[connectorIndex]] = [
            sortedPoints[connectorIndex],
            sortedPoints[nextIndex],
          ]
          next = sortedPoints[nextIndex]

          // Flip if needed
          if (start.distanceTo(next.max!) <= 0.01) {
            ;[next.min, next.max] = [next.max!, next.min]
            sortedPoints[nextIndex] = next
          }
          break
        }
      } else {
        break
      }
      nextIndex++
    }
  }
  return { sortedPoints, hasPerformedSort }
}

const isValidLoop = (points: Point[]): boolean => {
  if (points.length < 3) return false
  const threshold = 0.05

  // Create a copy and sort points
  const { sortedPoints } = sortPoints(points)
  const pointConnections = Array(sortedPoints.length).fill(false)
  for (let i = 0; i < pointConnections.length; i++) {
    const currentPoint = sortedPoints[i]
    const nextPoint = sortedPoints[(i + 1) % pointConnections.length]
    if (currentPoint.max!.distanceTo(nextPoint.min!) <= threshold) {
      pointConnections[i] = true
    }
  }

  return pointConnections.length === sortedPoints.length && pointConnections.every((c) => c)
}

const generateWallOBBs = (
  points: Point[],
  gaussArea: number,
  singularFaceNormals: Vector3[],
  height: number, // Remove default value, make it required
) => {
  const obbs: AugmentedOBB[] = []
  let i = 0
  for (const point of points) {
    const b = point.max!
    const bmx = point.min!

    const t = point.max!.clone()
    const tmx = point.min.clone()

    const centre = new Vector3(
      (b.x + bmx.x + t.x + tmx.x) / 4,
      height / 2,
      (b.z + bmx.z + t.z + tmx.z) / 4,
    )

    const angle = getLineAngle(bmx, b)
    const wallIndex = i

    const lengthBottom = b.distanceTo(bmx)

    const halfSize = new Vector3(lengthBottom / 2, height / 2, 0)
    const obb = new AugmentedOBB(
      gaussArea > 0 ? PolygonDirection.CLOCKWISE : PolygonDirection.COUNTER_CLOCKWISE,
    )

    const matrix = new Object3D()
    matrix.rotation.set(0, angle, 0)
    matrix.updateMatrix()
    centre.y -= 1
    obb.set(centre, halfSize, new Matrix3(), point)
    obb.applyMatrix4(matrix.matrix)
    obb.singularFaceNormal = singularFaceNormals[i]
    obb.setWallIndex(wallIndex)
    obbs.push(obb)
    i++
  }
  return obbs
}

const getLineSlope = (p1: Vector3, p2: Vector3) => (p2.z - p1.z) / (p2.x - p1.x)
const getLineAngle = (p1: Vector3, p2: Vector3) => {
  const slope = getLineSlope(p1, p2)
  return -Math.atan(slope)
}

const findNonOverlappingSpawnPosition = (
  mesh: Mesh,
  furniture: Furniture[],
  center: Vector3,
): Vector3 => {
  const SPAWN_STEP = 1 // Half a meter steps
  const MAX_ATTEMPTS = 16 // Increased maximum rings
  const positions: Vector3[] = []

  // Pre-calculate all possible positions in a spiral pattern
  for (let x = -MAX_ATTEMPTS; x <= MAX_ATTEMPTS; x++) {
    for (let z = -MAX_ATTEMPTS; z <= MAX_ATTEMPTS; z++) {
      positions.push(center.clone().add(new Vector3(x * SPAWN_STEP, 0, z * SPAWN_STEP)))
    }
  }

  // Sort positions by distance from center
  positions.sort((a, b) => {
    const distA = a.distanceTo(center)
    const distB = b.distanceTo(center)
    return distA - distB
  })

  const testBox = new Box3()
  const testOBB = new OBB()

  // Get the initial bounding box
  testBox.setFromObject(mesh)
  const size = new Vector3()
  testBox.getSize(size)
  size.multiplyScalar(0.5)

  // Create OBBs for all existing furniture once
  const furnitureOBBs = furniture.map((item) => {
    if (item.userData?.obb) {
      return item.userData.obb
    }
    const itemBox = new Box3().setFromObject(item.object)
    const itemSize = new Vector3()
    itemBox.getSize(itemSize)
    itemSize.multiplyScalar(0.5)
    const itemOBB = new OBB()
    const rotationMatrix = new Matrix3()
    rotationMatrix.set(
      Math.cos(item.object.rotation.y),
      0,
      Math.sin(item.object.rotation.y),
      0,
      1,
      0,
      -Math.sin(item.object.rotation.y),
      0,
      Math.cos(item.object.rotation.y),
    )
    itemOBB.set(item.object.position, itemSize, rotationMatrix)
    return itemOBB
  })

  // Try each position in order of distance from center
  for (const testPosition of positions) {
    mesh.position.copy(testPosition)
    testBox.setFromObject(mesh)

    const rotationMatrix = new Matrix3()
    rotationMatrix.set(
      Math.cos(mesh.rotation.y),
      0,
      Math.sin(mesh.rotation.y),
      0,
      1,
      0,
      -Math.sin(mesh.rotation.y),
      0,
      Math.cos(mesh.rotation.y),
    )
    testOBB.set(testPosition, size, rotationMatrix)

    let hasOverlap = false

    // Check against all furniture OBBs
    for (const furnitureOBB of furnitureOBBs) {
      if (testOBB.intersectsOBB(furnitureOBB)) {
        hasOverlap = true
        break
      }
    }

    if (!hasOverlap) {
      return testPosition
    }
  }

  // If no position found, return a position above the last tried position
  const fallbackPosition = positions[positions.length - 1].clone()
  fallbackPosition.z += SPAWN_STEP * 2
  return fallbackPosition
}

export {
  sortPoints,
  isValidLoop,
  generateWallOBBs,
  getLineAngle,
  getLineSlope,
  findNonOverlappingSpawnPosition,
}
export type { Point }
