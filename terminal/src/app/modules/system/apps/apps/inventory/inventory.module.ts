import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { inventoryRoutes } from './inventory.routing';
import { InventoryComponent } from './inventory.component';
import { TranslateModule } from '@ngx-translate/core';
import { InventoryResolver, InventoryDetailsResolver } from './inventory.resolvers';
import { InventoryService } from './inventory.service';

@NgModule({
  providers: [InventoryService, InventoryDetailsResolver, InventoryResolver],
  declarations: [InventoryComponent],
  imports: [
    RouterModule.forChild(inventoryRoutes),
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
export class InventoryModule {}
