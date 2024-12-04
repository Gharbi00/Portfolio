import { Component, OnInit, Input } from '@angular/core';
import { BoardCardType } from '@sifca-monorepo/terminal-generator';

@Component({
  selector: 'app-closing-deals',
  templateUrl: './closing-deals.component.html',
  styleUrls: ['./closing-deals.component.scss'],
})

/**
 * Closing Deals Component
 */
export class ClosingDealsComponent implements OnInit {
  // Closing Deals
  @Input() ClosingDeals: BoardCardType[];

  constructor() {}

  ngOnInit(): void {}
}
