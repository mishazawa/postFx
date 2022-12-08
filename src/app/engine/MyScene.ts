import {
    AnimationAction,
    AnimationClip,
    AnimationMixer,
    BufferAttribute, Color, DirectionalLight, FogExp2, Group, LoopOnce, Mesh, MeshToonMaterial, NearestFilter, Object3D, PerspectiveCamera, Quaternion, Scene, Texture, Vector2, Vector3
} from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils';
import { setInterval } from "timers";

const CAMERA_POS      = new Vector3(-3.213139322477767, 3.593942240067361, 3.7158564076995075);
const CAMERA_ROT      = new Quaternion(-0.08783263310293568, -0.5167853852560961, -0.053405678759713165, 0.8499212478954318)
const LIGHT_DIRECTION = new Vector3(5, 0, 2);

const CAMERA_SHADOW_FRUSTUM = 6;
const ENABLE_TIME = 1000;
const THRESHOLD = .25;

class Bird extends Mesh {
  public mixer: AnimationMixer;
  public clips: AnimationClip[];

  public currentAction: AnimationAction;
}

export class MyScene {
  public scene;
  public camera;

  private resolution;
  private light;
  private target;
  private toonTexture;
  private controls;
  private toonMaterial;

  private birds: Bird[] = [];
  private birdsEnableInterval;
  private rope;

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

  private createMaterials () {
    this.toonMaterial = new MeshToonMaterial();
  }

  public createGeometry(scene: Group, birdGlb: Object3D) {
    const [a, b, c, p] = scene.children[0].children;

    const tree   = a as Mesh;
    const ground = b as Mesh;
    const rope   = c as Mesh;

    const points = p as Mesh;

    const bird = birdGlb['scene'].children[0] as Mesh;

    tree.material   = this.toonMaterial.clone();
    ground.material = this.toonMaterial.clone();
    rope.material   = this.toonMaterial.clone();
    bird.material   = this.toonMaterial.clone();

    tree.material  ['color'] = new Color(0x735F32);
    ground.material['color'] = new Color(0x282A3A);
    rope.material  ['color'] = new Color(0xC69749);
    bird.material  ['color'] = new Color(0x222222);

    tree.castShadow = true;
    rope.castShadow = true;
    bird.castShadow = true;

    ground.receiveShadow = true;

    rope.visible = false;

    this.rope = rope;

    const ANIMATION_NAME = "ScrubAnimationm";
    const clips = birdGlb.animations;
    const clip = AnimationClip.findByName( clips, ANIMATION_NAME );

    const geo = points.geometry.attributes['position'] as BufferAttribute;

    const pts = Array.from(Array(geo.count)).map((_, i) => {
      const position = new Vector3().fromBufferAttribute(geo, i).toArray();
      const newBird = skeletonClone(bird) as Bird;
      newBird.scale.multiplyScalar(.1);
      newBird.position.set(...position);

      newBird.mixer = new AnimationMixer(newBird);
      newBird.currentAction = newBird.mixer.clipAction(clip);
      newBird.currentAction.clampWhenFinished = true;
      newBird.currentAction.setLoop(LoopOnce, 1);
      newBird.currentAction.halt(0);
      newBird.currentAction.play();

      this.birds.push(newBird);
    })


    this.scene.add(tree);
    this.scene.add(ground);
    this.scene.add(rope);

    this.birds.forEach(b => this.scene.add(b));
  }


  public update(dt) {
    // this.controls.update();
    this.birds.forEach(b => b.mixer.update(dt));
    this.shakeCameraSlightly(dt);
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

  public randomEnableBird() {
    this.birdsEnableInterval = setInterval(() => {
      const prob = Math.random();
      if (prob < THRESHOLD) {
        const b = this.birds[Math.floor(Math.random()*this.birds.length)];

        const isRunning = b.currentAction.isRunning();

        if (isRunning) return;


        b.currentAction.reset().play();
      }
    }, ENABLE_TIME)
  }

  public toggleRope() {
    this.rope.visible = !this.rope.visible;
  }

  public shakeCameraSlightly(dt) {
    // this.camera.position.add(v)
  }
}
