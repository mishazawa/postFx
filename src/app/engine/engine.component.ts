import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';
import { LoaderService } from './loader.service';

import { Clock, Object3D, Texture } from 'three';
import { PostFx } from './PostFx';
import { MyScene } from './MyScene';
import { KeyboardService } from './keyboard.service';

const URL_TOON_PALETTE = "../assets/custom.tga";
const URL_TREE_SCENE   = "../assets/tree_scene.glb";
const URL_BIRD_IDLE    = "../assets/bird.glb";

const BUTTON_S = 83;

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

  private clock;

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(
    private engServ: EngineService,
    private loadServ: LoaderService,
    private kbdServ: KeyboardService) {
  }

  public async ngOnInit() {
    this.clock = new Clock();

    const palette = await this.loadServ.loadTga(URL_TOON_PALETTE) as Texture;
    const treeScene = await this.loadServ.loadGlb(URL_TREE_SCENE) as Object3D;
    const birdIdle  = await this.loadServ.loadGlb(URL_BIRD_IDLE)  as Object3D;

    this.engServ.init(this.rendererCanvas);

    const baseScene = new MyScene(this.engServ.R);
    const postfx    = new PostFx (this.engServ.R, palette, .2);

    // baseScene.setPalette(palette);
    baseScene.init();
    baseScene.createGeometry(treeScene['scene'], birdIdle)
    baseScene.randomEnableBird();
    this.engServ.resize.subscribe(([resolution]) => {
      postfx.onResize(resolution)
      baseScene.onResize(resolution)
    });

    this.engServ.animate(() => {
      const delta = this.clock.getDelta();
      baseScene.update(delta);
      postfx.render(baseScene.scene, baseScene.camera);
    });

    this.kbdServ.keydown.subscribe((keyCode) => {
      if (keyCode === BUTTON_S) {
        baseScene.toggleRope();
      }
    })
  }

}
