import { Injectable } from '@angular/core';
import { BASE_URL } from '../../../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  puzzleImgSrc: string;
  baseUrl=BASE_URL;

  constructor() {
    // source: https://unsplash.com/photos/nKC772R_qog
    this.puzzleImgSrc = "assets/edgar-nKC772R_qog-unsplash.jpg";
  }

  setPuzzleImgSrc(src: string) {
    this.puzzleImgSrc = src;
  }

  getPuzzleImgURL() {
    return this.puzzleImgSrc;
  }

 

}
