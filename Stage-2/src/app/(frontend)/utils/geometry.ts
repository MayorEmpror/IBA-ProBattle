import {
  Vector3,
  BufferGeometry,
  Float32BufferAttribute,
  Euler,
  ShapeGeometry,
  Shape,
  Matrix3,
} from 'three'

import { type Point } from './point'

function createWalls(points: Point[], height = 8) {
  // Create a copy of the points array to avoid mutating original
  const sortedPoints = [...points]

  // Now create geometry with ordered points
  const area = calculateGaussArea(sortedPoints)

  const vertices: number[] = []
  const indices: number[] = []
  const uvs: number[] = []

  sortedPoints.forEach((point, index) => {
    const start = point.min
    const end = point.max!

    // Bottom vertices
    const v0 = [start.x, start.y, start.z]
    const v1 = [end.x, end.y, end.z]
    // Top vertices
    const v2 = [start.x, start.y + height, start.z]
    const v3 = [end.x, start.y + height, end.z]

    vertices.push(...v0, ...v1, ...v2, ...v3)

    // UVs and indices
    uvs.push(
      0,
      0, // v0 (bottom-left)
      1,
      0, // v1 (bottom-right)
      0,
      1, // v2 (top-left)
      1,
      1, // v3 (top-right)
    )

    const base = index * 4
    indices.push(
      base,
      base + 2,
      base + 1, // First triangle
      base + 1,
      base + 2,
      base + 3, // Second triangle
    )
  })

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  const array = geometry.attributes.normal.array
  const normals: Vector3[] = []
  const faceNormals: Vector3[][] = []
  for (let i = 0; i < array.length / 3 / 4; i++) {
    const normal1 = new Vector3(array[i * 3], array[i * 3 + 1], array[i * 3 + 2])
    const normal2 = new Vector3(array[i * 3 + 3], array[i * 3 + 4], array[i * 3 + 5])
    const normal3 = new Vector3(array[i * 3 + 6], array[i * 3 + 7], array[i * 3 + 8])
    const normal4 = new Vector3(array[i * 3 + 9], array[i * 3 + 10], array[i * 3 + 11])
    normals.push(normal1, normal2, normal3, normal4)
    faceNormals.push([normal1, normal2, normal3, normal4])
  }

  const singularFaceNormals: Vector3[] = []
  for (let i = 0; i < faceNormals.length; i++) {
    const n1 = faceNormals[i][0].clone().normalize()
    const n2 = faceNormals[i][1].clone().normalize()
    const n3 = faceNormals[i][2].clone().normalize()
    const n4 = faceNormals[i][3].clone().normalize()
    const sum = n1.clone().add(n2).add(n3).add(n4)
    sum.normalize()
    singularFaceNormals.push(sum)
  }

  return { geometry, area, singularFaceNormals }
}

const createFloor = (points: Point[]) => {
  // Create a Shape from the points
  const shape = new Shape()
  const bottomPoints = points.map((p) => p.min)

  // Start the shape at the first point
  shape.moveTo(bottomPoints[0].x, bottomPoints[0].z)

  // Add all other points as line segments
  for (let i = 1; i < bottomPoints.length; i++) {
    shape.lineTo(bottomPoints[i].x, bottomPoints[i].z)
  }

  // Close the shape by connecting back to the first point
  shape.lineTo(bottomPoints[0].x, bottomPoints[0].z)

  // Create geometry with automatic triangulation
  const geometry = new ShapeGeometry(shape)

  const matrix = new Matrix3()
  matrix.set(
    0.1,
    0,
    0, // scale x
    0,
    0.1,
    0, // scale y
    0,
    0,
    0.1,
  )

  const uv = geometry.attributes.uv
  const uvVector = new Vector3()

  for (let i = 0; i < uv.count; i++) {
    uvVector.set(uv.getX(i), uv.getY(i), 0.1)
    uvVector.applyMatrix3(matrix)
    uv.setXY(i, uvVector.x, uvVector.y)
  }
  uv.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

const calculateGaussArea = (points: Point[]) => {
  const vertices: Vector3[] = []
  let area = 0

  points.forEach((p) => {
    vertices.push(p.min)
    if (p.max) vertices.push(p.max)
  })

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i]
    const nextVertex = vertices[(i + 1) % vertices.length] // Ensures the last wraps to the first
    const increment = vertex.x * nextVertex.z - vertex.z * nextVertex.x
    area += increment
  }

  return area / 2 // Ensure positive area
}

function extractBottomVertices(
  mixedVertices: Float32Array | TypedArray | number[],
  height: number,
): Point[] {
  const points: Point[] = []

  // Process vertices in groups of 12 (v0, v1, v2, v3) - each with x,y,z coordinates
  for (let i = 0; i < mixedVertices.length; i += 12) {
    // Extract bottom vertices (v0 and v1)
    const minX = mixedVertices[i]
    const minY = mixedVertices[i + 1]
    const minZ = mixedVertices[i + 2]

    const maxX = mixedVertices[i + 3]
    const maxY = mixedVertices[i + 4]
    const maxZ = mixedVertices[i + 5]

    // Create min and max Vector3 objects
    const min = new Vector3(minX, minY, minZ)
    const max = new Vector3(maxX, maxY, maxZ)

    // Create Point object and add to points array
    points.push({ min, max })
  }

  return points
}



// Need to add this type to handle different typed arrays
type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array

interface LengthLabels {
  text: string
  position: Vector3
  rotation: Euler
}

export { createWalls, createFloor, calculateGaussArea, extractBottomVertices, }
export type { Point, LengthLabels }
