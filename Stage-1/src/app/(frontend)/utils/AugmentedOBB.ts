import { Matrix3, Vector3 } from 'three'
import { OBB } from 'three/addons/math/OBB.js'

import { getLineAngle, Point } from './point'

enum PolygonDirection {
  CLOCKWISE = 0,
  COUNTER_CLOCKWISE = 1,
}

class AugmentedOBB extends OBB {
  public wallPoint: Point | null
  public polygonDirection: PolygonDirection
  public singularFaceNormal?: Vector3
  public wallIndex?: number
  constructor(
    polygonDirection: PolygonDirection,
    center?: Vector3,
    size?: Vector3,
    rotation?: Matrix3,
    wallPoint?: Point,
  ) {
    super(center, size, rotation)
    this.wallPoint = wallPoint || null
    this.polygonDirection = polygonDirection
  }

  setWallPoint(wallPoint: Point) {
    this.wallPoint = wallPoint
  }

  set(center: Vector3, halfSize: Vector3, rotation: Matrix3, wallPoint?: Point): this {
    if (wallPoint) {
      this.wallPoint = wallPoint
    }
    return super.set(center, halfSize, rotation)
  }

  intersectsOBB(obb: OBB) {
    return super.intersectsOBB(obb)
  }

  getRotation() {
    return this.rotation
  }

  getWallAngle() {
    if (!this.wallPoint) {
      return 0
    }
    return getLineAngle(this.wallPoint.min, this.wallPoint.max!)
  }

  setWallIndex(wallIndex: number) {
    this.wallIndex = wallIndex
  }
}

export default AugmentedOBB
export { PolygonDirection }
