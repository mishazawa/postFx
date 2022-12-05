import {
    BufferAttribute,
    BufferGeometry,
    Camera,
    Event,
    Mesh,
    NearestFilter,
    Object3D,
    OrthographicCamera,
    RawShaderMaterial,
    RGBAFormat,
    Scene,
    Vector2,
    WebGLRenderer,
    WebGLRenderTarget
} from 'three';

import frag from 'raw-loader!./shaders/postfx.frag';
import vert from 'raw-loader!./shaders/postfx.vert';

export class PostFx {
  private renderer: WebGLRenderer;
  private scene: Scene | Object3D<Event>;
  private dummyCamera: Camera | OrthographicCamera;
  private target: WebGLRenderTarget;
  private material: RawShaderMaterial;

  constructor (renderer: WebGLRenderer, scale: number = .5) {
    this.renderer = renderer;
    this.scene = new Scene();

    // three.js for .render() wants a camera, even if we're not using it :(
    this.dummyCamera = new OrthographicCamera();
    const geometry = new BufferGeometry();
    const vertices = new Float32Array([
      -1.0, -1.0,
      3.0, -1.0,
      -1.0, 3.0
    ]);

    geometry.setAttribute('position', new BufferAttribute(vertices, 2));

    const multiplier = scale;

    const resolution = new Vector2();

    this.renderer.getDrawingBufferSize(resolution);

    const textureRes = resolution.clone().multiplyScalar(multiplier);

    this.target = new WebGLRenderTarget(textureRes.x, textureRes.y, {
      format: RGBAFormat,
      stencilBuffer: false,
      depthBuffer: true,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
    });

    this.material = new RawShaderMaterial({
      fragmentShader: frag,
      vertexShader: vert,
      uniforms: {
        uScene: { value: this.target.texture },
        uResolution: { value: resolution },
        uMultiplier: { value: multiplier },
      },
    });

    const triangle = new Mesh(geometry, this.material);
    // Our triangle will be always on screen, so avoid frustum culling checking
    triangle.frustumCulled = false;
    this.scene.add(triangle);
  }

  public onResize (res: Vector2) {
    this.material.uniforms['uResolution'].value = res;
  }

  render(scene, camera) {
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.dummyCamera);
  }
}
