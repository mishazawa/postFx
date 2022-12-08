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
    Texture,
    Vector2,
    WebGLRenderer,
    WebGLRenderTarget
} from 'three';

import vert from 'raw-loader!./shaders/postfx.vert';
import fragToon  from 'raw-loader!./shaders/toonPFX.frag';
import fragScale from 'raw-loader!./shaders/scalePFX.frag';

export class PostFx {
  private renderer: WebGLRenderer;
  private sceneToon: Scene | Object3D<Event>;
  private sceneScale: Scene | Object3D<Event>;
  private dummyCamera: Camera | OrthographicCamera;
  private targetToon: WebGLRenderTarget;
  private targetScale: WebGLRenderTarget;
  private materialToon: RawShaderMaterial;
  private materialScale: RawShaderMaterial;

  constructor (renderer: WebGLRenderer, gradient: Texture, scale: number = .5) {
    this.renderer = renderer;
    this.sceneToon  = new Scene();
    this.sceneScale = new Scene();

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

    this.targetToon = new WebGLRenderTarget(textureRes.x, textureRes.y, {
      format: RGBAFormat,
      stencilBuffer: false,
      depthBuffer: true,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
    });


    this.targetScale = new WebGLRenderTarget(textureRes.x, textureRes.y, {
      format: RGBAFormat,
      stencilBuffer: false,
      depthBuffer: true,
      magFilter: NearestFilter,
      minFilter: NearestFilter,
    });

    gradient.magFilter = NearestFilter;
    gradient.minFilter = NearestFilter;

    this.materialToon = new RawShaderMaterial({
      fragmentShader: fragToon,
      vertexShader: vert,
      uniforms: {
        uScene:       { value: this.targetToon.texture },
        uGradientMap: { value: gradient },
        uResolution:  { value: textureRes },
        uMultiplier:  { value: multiplier },
      },
    });

    this.materialScale = new RawShaderMaterial({
      fragmentShader: fragScale,
      vertexShader: vert,
      uniforms: {
        uScene:       { value: this.targetScale.texture },
        uGradientMap: { value: gradient },
        uResolution:  { value: resolution },
        uMultiplier:  { value: multiplier },
      },
    });

    const triangleToon = new Mesh(geometry, this.materialToon);
    const triangleScale = new Mesh(geometry, this.materialScale);
    // Our triangle will be always on screen, so avoid frustum culling checking
    triangleToon.frustumCulled = false;
    triangleScale.frustumCulled = false;

    this.sceneToon.add(triangleToon);
    this.sceneScale.add(triangleScale);
  }

  public onResize (res: Vector2) {
    this.materialScale.uniforms['uResolution'].value = res;
  }

  render(scene, camera) {
    this.renderer.setRenderTarget(this.targetToon);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(this.targetScale);
    this.renderer.render(this.sceneToon, this.dummyCamera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.sceneScale, this.dummyCamera);
  }
}
