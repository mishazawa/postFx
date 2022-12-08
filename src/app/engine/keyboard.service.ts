import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {

  private onKeydown: EventEmitter<any> = new EventEmitter();


  public get keydown () {
    return this.onKeydown;
  }

  constructor() {

    window.addEventListener('keydown', ({keyCode}) => {
      this.onKeydown.emit(keyCode);
    });
  }

}
