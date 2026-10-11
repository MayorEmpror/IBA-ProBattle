import { extend } from '@react-three/fiber'
import { MeshStandardMaterial, MeshStandardMaterialParameters, Scene, WebGLRenderer, WebGLCubeRenderTarget, FloatType, CubeCamera } from 'three'

interface MeshReflectionStandardMaterialParameters extends MeshStandardMaterialParameters {
  renderer: WebGLRenderer
  scene: Scene
}

class MeshReflectionStandardMaterial extends MeshStandardMaterial {
  private renderTarget: WebGLCubeRenderTarget
  private renderer: WebGLRenderer
  private scene: Scene
  private camera: CubeCamera

  constructor(parameters?: MeshReflectionStandardMaterialParameters & MeshStandardMaterialParameters) {
    const { renderer, scene, ...rest } = parameters!
    super(rest)
    this.scene = scene
    this.renderer = renderer
    this.renderTarget = new WebGLCubeRenderTarget(512, {type: FloatType})
    this.camera = new CubeCamera(0.01, 100, this.renderTarget)
    this.camera.position.y -= 2.5
  }

  update() {
    this.envMap = this.camera.renderTarget.texture
    this.camera.update(this.renderer, this.scene)
  }
}


extend({ MeshReflectionStandardMaterial })

export {
    MeshReflectionStandardMaterial
}