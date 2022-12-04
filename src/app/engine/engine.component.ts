import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {EngineService} from './engine.service';

// example import shader
import vert from 'raw-loader!./blank.vert';
import frag from 'raw-loader!./blank.frag';


@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService) {
  }

  public ngOnInit(): void {

    this.engServ.createScene(this.rendererCanvas);
    this.engServ.animate();
  }

}
