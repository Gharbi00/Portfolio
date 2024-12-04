import { values } from 'lodash';
import { FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';

import { PaymentMethodsEnum } from '@sifca-monorepo/terminal-generator';
import { MarketPlaceOrderDtoType, OrderStatus, OrderTypeEnum, PaymentStatusEnum } from '@sifca-monorepo/terminal-generator';

@Component({
  selector: 'app-ecommerce-recent-orders',
  templateUrl: './ecommerce-recent-orders.component.html',
  styleUrls: ['./ecommerce-recent-orders.component.scss'],
})
export class EcommerceRecentOrdersComponent implements OnInit {
  @Input() RecentSelling: MarketPlaceOrderDtoType[];

  excelForm: FormGroup;
  orderType = values(OrderTypeEnum);
  orderStatus = values(OrderStatus);
  paymentStatus = values(PaymentStatusEnum);
  paymentMethods = values(PaymentMethodsEnum);

  constructor() {}

  ngOnInit(): void {}
}
