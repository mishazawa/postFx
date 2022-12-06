import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';
import { LoaderService } from './loader.service';

import { Texture } from 'three';
import { PostFx } from './PostFx';
import { MyScene } from './MyScene';

const URL_TOON_PALETTE = "../assets/custom.tga";

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

    this.engServ.init(this.rendererCanvas);

    const baseScene = new MyScene(this.engServ.R);
    const postfx    = new PostFx (this.engServ.R, palette, .2);

    // baseScene.setPalette(palette);
    baseScene.init();

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
