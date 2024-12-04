import { Component, OnInit } from '@angular/core';
import { NftBoxSlider } from '../../../shared/data/slider';
import { nftBox } from '../../../shared/data/portfolio';

@Component({
  selector: 'app-nft-box',
  templateUrl: './nft-box.component.html',
  styleUrls: ['./nft-box.component.scss']
})
export class NftBoxComponent implements OnInit {
  public NftBoxSlider=NftBoxSlider;
  public nftBox=nftBox;
  constructor() { }

  ngOnInit(): void {
  }

}
