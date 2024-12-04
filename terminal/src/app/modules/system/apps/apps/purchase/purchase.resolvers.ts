import { Observable } from 'rxjs';
import { Resolve } from '@angular/router';
import { Injectable } from '@angular/core';

import { PurchaseIntegrationType } from '@sifca-monorepo/terminal-generator';

import { PurchaseService } from './purchase.service';

@Injectable({
  providedIn: 'root',
})
export class PurchaseResolver implements Resolve<any> {
  constructor(private purchaseService: PurchaseService) {}

  resolve(): Observable<PurchaseIntegrationType> {
    return this.purchaseService.getPurchaseIntegrationByTarget();
  }
}
