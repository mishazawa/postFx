import {
  Scene,
  PerspectiveCamera,
  Vector2,
  DirectionalLight,
  Object3D,
  Vector3,
  Mesh,
  Texture,
  NearestFilter,
  Group,
  FogExp2,
  Color,
  MeshToonMaterial,
  Quaternion,
  MeshDistanceMaterial,
  MeshMatcapMaterial,
  CameraHelper
} from "three";

import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

const CAMERA_POS      = new Vector3(-3.213139322477767, 3.593942240067361, 3.7158564076995075);
const CAMERA_ROT      = new Quaternion(-0.08783263310293568, -0.5167853852560961, -0.053405678759713165, 0.8499212478954318)
const LIGHT_DIRECTION = new Vector3(5, 0, 2);

const CAMERA_SHADOW_FRUSTUM = 6;

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
    this.scene.fog = new FogExp2(0xAAAAAA, .1);


    this.camera = new PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );

    this.camera.applyQuaternion(CAMERA_ROT);
    this.camera.position.add(CAMERA_POS);
    this.scene.add(this.camera);

    this.resolution = new Vector2();
    renderer.getDrawingBufferSize(this.resolution);
    // this.controls = new OrbitControls(this.camera, renderer.domElement);
  }

  public init() {
    this.createLight();
    this.createMaterials();
  }

  private createLight() {
    this.light = new DirectionalLight(0xFFFFFF, 1);

    this.light.position.add(new Vector3(0, 5, 0));

    this.target = new Object3D();

    this.target.position.add(LIGHT_DIRECTION);

    this.light.target = this.target;
    this.scene.add(this.target);
    this.scene.add(this.light);



    this.light.castShadow = true;
    this.light.shadow.camera.top = CAMERA_SHADOW_FRUSTUM;
    this.light.shadow.camera.bottom = - CAMERA_SHADOW_FRUSTUM;
    this.light.shadow.camera.left = - CAMERA_SHADOW_FRUSTUM;
    this.light.shadow.camera.right = CAMERA_SHADOW_FRUSTUM;
    this.light.shadow.camera.near = .1;
    this.light.shadow.camera.far = CAMERA_SHADOW_FRUSTUM * 4;
    // this.scene.add( new CameraHelper( this.light.shadow.camera ) );
  }

  public createGeometry(scene: Group) {
    const [a, b, c] = scene.children[0].children;

    const tree   = a as Mesh;
    const ground = b as Mesh;
    const rope   = c as Mesh;

    tree.material   = this.toonMaterial.clone();
    ground.material = this.toonMaterial.clone();
    rope.material   = this.toonMaterial.clone();

    tree.material  ['color'] = new Color(0x735F32);
    ground.material['color'] = new Color(0x282A3A);
    // ground.material['color'] = new Color(0xAAAAAA);
    rope.material  ['color'] = new Color(0xC69749);

    tree.castShadow = true;
    rope.castShadow = true;
    // ground.castShadow = true;

    ground.receiveShadow = true;

    this.scene.add(scene);
  }

  private createMaterials () {
    this.toonMaterial = new MeshToonMaterial();
  }

  public update() {
    // this.controls.update();
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
  }
}
