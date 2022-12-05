import { Injectable } from '@angular/core';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private tga;

  constructor() {
    this.tga = new TGALoader();
  }

  public loadTga(url) {
    return this.withLoader(url, this.tga);
  }

  private withLoader(url, loader, fn = (data: any): any => data) {
    return new Promise((res, rej) => {
      loader.load(url, (data) => {
        return res(fn(data));
      }, undefined, rej);
    });
  }
}
