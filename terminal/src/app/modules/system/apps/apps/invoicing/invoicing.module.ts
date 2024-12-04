import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { invoicingRoutes } from './invoicing.routing';
import { InvoicingComponent } from './invoicing.component';
import { TranslateModule } from '@ngx-translate/core';
import { InvoicingResolver } from './invoicing.resolvers';
import { InvoicingService } from './invoicing.service';

@NgModule({
  providers: [InvoicingService, InvoicingResolver],
  declarations: [InvoicingComponent],
  imports: [
    RouterModule.forChild(invoicingRoutes),
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
export class InvoicingModule {}
