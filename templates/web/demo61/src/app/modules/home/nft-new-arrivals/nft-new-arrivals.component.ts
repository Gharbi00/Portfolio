import { Component, OnInit } from '@angular/core';
import { NftBoxSlider } from '../../../shared/data/slider';
import { nftBox } from '../../../shared/data/portfolio';
@Component({
  selector: 'app-nft-new-arrivals',
  templateUrl: './nft-new-arrivals.component.html',
  styleUrls: ['./nft-new-arrivals.component.scss']
})
export class NftNewArrivalsComponent implements OnInit {
  public NftBoxSlider=NftBoxSlider;
  public nftBox=nftBox;
  constructor() { }

  ngOnInit(): void {
  }

}
