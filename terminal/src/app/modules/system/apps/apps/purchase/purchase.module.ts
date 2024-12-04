import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { purchaseRoutes } from './purchase.routing';
import { PurchaseComponent } from './purchase.component';
import { TranslateModule } from '@ngx-translate/core';
import { PurchaseResolver } from './purchase.resolvers';
import { PurchaseService } from './purchase.service';

@NgModule({
  providers: [PurchaseService, PurchaseResolver],
  declarations: [PurchaseComponent],
  imports: [
    RouterModule.forChild(purchaseRoutes),
    FormsModule,
    NgbNavModule,
    CommonModule,
    NgSelectModule,
    TranslateModule,
    MatTooltipModule,
    ColorPickerModule,
    ReactiveFormsModule,
  ],
})
export class PurchaseModule {}
