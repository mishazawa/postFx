import { Injectable } from '@angular/core';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private tga;
  private glb;
  constructor() {
    this.tga = new TGALoader();
    this.glb = new GLTFLoader();
  }

  public loadTga(url) {
    return this.withLoader(url, this.tga);
  }

  public loadGlb(url) {
    return this.withLoader(url, this.glb);
  }

  private withLoader(url, loader, fn = (data: any): any => data) {
    return new Promise((res, rej) => {
      loader.load(url, (data) => {
        return res(fn(data));
      }, undefined, rej);
    });
  }
}
