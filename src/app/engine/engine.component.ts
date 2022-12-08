import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';
import { LoaderService } from './loader.service';

import { Object3D, Texture } from 'three';
import { PostFx } from './PostFx';
import { MyScene } from './MyScene';

const URL_TOON_PALETTE = "../assets/custom.tga";
const URL_TREE_SCENE   = "../assets/tree_scene.glb";

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(
    private engServ: EngineService,
    private loadServ: LoaderService) {
  }

  public async ngOnInit() {
    const palette = await this.loadServ.loadTga(URL_TOON_PALETTE) as Texture;
    const treeScene = await this.loadServ.loadGlb(URL_TREE_SCENE) as Object3D;

    this.engServ.init(this.rendererCanvas);

    const baseScene = new MyScene(this.engServ.R);
    const postfx    = new PostFx (this.engServ.R, palette, .2);

    // baseScene.setPalette(palette);
    baseScene.init();
    baseScene.createGeometry(treeScene['scene'])

    this.engServ.resize.subscribe(([resolution]) => {
      postfx.onResize(resolution)
      baseScene.onResize(resolution)
    });

    this.engServ.animate(() => {
      baseScene.update();
      postfx.render(baseScene.scene, baseScene.camera);
    });
  }

}
