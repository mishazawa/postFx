import {
  Scene,
  Color,
  PerspectiveCamera,
  Vector2,
  DirectionalLight,
  Object3D,
  Vector3,
  TorusKnotGeometry,
  Mesh,
  Uniform,
  ShaderMaterial,
  UniformsUtils,
  Texture,
  NearestFilter
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import blank from 'raw-loader!./shaders/blank.vert';
import toon  from 'raw-loader!./shaders/toon.frag';


export class MyScene {
  public scene;
  public camera;

  private resolution;
  private cube;
  private light;
  private target;
  private toonTexture;
  private controls;
  private toonMaterial;

  constructor (renderer) {
    this.scene = new Scene();
    this.scene.background = new Color(0xAAAAAA);

    this.camera = new PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );

    this.camera.position.z = 5;
    this.scene.add(this.camera);

    this.resolution = new Vector2();
    renderer.getDrawingBufferSize(this.resolution);
    this.controls = new OrbitControls(this.camera, renderer.domElement);
  }

  public init() {
    this.createLight();
    this.createMaterials();
    this.createGeometry();
  }

  private createLight() {
    this.light = new DirectionalLight(0xFFFFFF);

    this.target = new Object3D();

    this.target.position.add(new Vector3(5, 0, 5));

    this.light.target = this.target;
    this.scene.add(this.target);
    this.scene.add(this.light);
  }

  private createGeometry() {
    const geometry = new TorusKnotGeometry( 1, .25);
    this.cube = new Mesh(geometry, this.toonMaterial);
    this.cube.rotation.x = .5;
    this.scene.add(this.cube);
  }

  private createMaterials () {
    const customUniforms = {
      uDirectionalLight: {
        value: {
          color: this.light.color,
          direction: this.light.target.position,
        }
      },
      uResolution: new Uniform(this.resolution),
      uColor: new Uniform(new Color(0xFFBBCC)),
      uGradientMap: new Uniform(this.toonTexture),
    };

    this.toonMaterial = new ShaderMaterial( {
      uniforms: UniformsUtils.merge([
        customUniforms,
      ]),
      defines: {
        AMBIENT_INTENSITY: .35,
      },
      vertexShader: blank,
      fragmentShader: toon,
    });
  }

  public update() {
    this.controls.update();
    // this.cube.rotation.x += 0.001;
    // this.cube.rotation.y += 0.01;
  }

  public setPalette(tex: Texture) {
    this.toonTexture = tex;
    this.toonTexture.magFilter = NearestFilter;
    this.toonTexture.minFilter = NearestFilter;
  }

  public onResize (res) {
    this.camera.aspect = res.x / res.y;
    this.camera.updateProjectionMatrix()
    this.toonMaterial.uniforms['uResolution'].value = new Uniform(res);
  }
}
