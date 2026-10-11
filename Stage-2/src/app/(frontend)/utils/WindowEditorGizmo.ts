import { BoxGeometry, Mesh, Object3D, ShaderMaterial, Vector3 } from "three";

class WindowGizmo extends Object3D {
    private _mat: ShaderMaterial
    private _geo: BoxGeometry
    private _mesh: Mesh<typeof this._geo, typeof this._mat>
    constructor(dim: Vector3) {
        super()
        this._mat = new ShaderMaterial({
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                void main() {
                    float dist = step(vUv.x, 0.05) + step(1.0 - vUv.x, 0.05);
                    gl_FragColor = vec4(mix(vec3(0.0), vec3(0.7, 0.78, 0.77), 1.0-dist), 1.0);
                }
            `,
            side: 2
        })
        this._geo = new BoxGeometry(dim.x, dim.y, dim.z)
        this._mesh = new Mesh(this._geo, this._mat)

        this.add(this._mesh)
    }
}

export default WindowGizmo