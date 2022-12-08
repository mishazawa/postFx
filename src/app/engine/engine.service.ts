import * as THREE from 'three';
import {ElementRef, EventEmitter, Injectable, NgZone, OnDestroy} from '@angular/core';
import { Vector2 } from 'three';

@Injectable({providedIn: 'root'})
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;

  private frameId: number = null;

  private onResize: EventEmitter<any[]> = new EventEmitter();

  public get R () {
    return this.renderer;
  }

  public get resize () {
    return this.onResize;
  }


  public get bufferSize () {
    const newSize = new Vector2();
    this.renderer.getDrawingBufferSize(newSize);
    return newSize;
  }

  public constructor(private ngZone: NgZone) {
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.renderer != null) {
      this.renderer.dispose();
      this.renderer = null;
      this.canvas = null;
    }
  }

  public init(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });

    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public animate(fn): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render(fn);
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render(fn);
        });
      }

      window.addEventListener('resize', () => {
        const width  = window.innerWidth;
        const height = window.innerHeight;

        this.renderer.setSize(width, height);
        this.onResize.emit([this.bufferSize]);
      });
    });
  }

  public render(fn): void {
    this.frameId = requestAnimationFrame(() => {
      this.render(fn);
    });
    fn();
  }
}
