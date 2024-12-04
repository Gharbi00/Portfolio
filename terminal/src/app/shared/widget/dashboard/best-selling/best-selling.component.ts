import { Component, OnInit, Input } from '@angular/core';
import { EcommerceAnalyticsBestSellerType } from '@sifca-monorepo/terminal-generator';

@Component({
  selector: 'app-best-selling',
  templateUrl: './best-selling.component.html',
  styleUrls: ['./best-selling.component.scss'],
})
export class BestSellingComponent implements OnInit {
  // Best Selling data
  @Input() BestSelling: EcommerceAnalyticsBestSellerType[];

  constructor() {}

  ngOnInit(): void {}
}
