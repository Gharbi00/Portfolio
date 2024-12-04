import { Component, OnInit } from '@angular/core';
import { nftName } from '../../../shared/data/portfolio';
import { NftCategorySlider } from '../../../shared/data/slider';

@Component({
  selector: 'app-nft-category',
  templateUrl: './nft-category.component.html',
  styleUrls: ['./nft-category.component.scss']
})
export class NftCategoryComponent implements OnInit {
  public NftCategorySlider=NftCategorySlider;
  public nftName=nftName;

  constructor() { }

  ngOnInit(): void {
  }

}
