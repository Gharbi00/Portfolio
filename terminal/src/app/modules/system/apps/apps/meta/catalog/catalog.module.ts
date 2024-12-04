import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { metaCatalogRoutes } from './catalog.routing';
import { MetaCatalogComponent } from './catalog.component';
import { TranslateModule } from '@ngx-translate/core';
import { CatalogueDetailsResolver, CatalogueResolver } from './catalog.resolvers';

@NgModule({
  providers: [CatalogueResolver, CatalogueDetailsResolver],
  declarations: [MetaCatalogComponent],
  imports: [RouterModule.forChild(metaCatalogRoutes), NgbNavModule, FormsModule, MatTooltipModule, CommonModule, ReactiveFormsModule, TranslateModule],
})
export class MetaCatalogModule {}
