import { Component, OnInit } from '@angular/core';
import { SpecialOfferData } from '../../../shared/data/portfolio';
import { SpecialOfferCarousel } from '../../../shared/data/slider';

@Component({
  selector: 'app-special-offer',
  templateUrl: './special-offer.component.html',
  styleUrls: ['./special-offer.component.scss']
})
export class SpecialOfferComponent implements OnInit {
  public SpecialOfferData=SpecialOfferData;
  public SpecialOfferCarousel=SpecialOfferCarousel;

  constructor() { }

  ngOnInit(): void {
  }

}
