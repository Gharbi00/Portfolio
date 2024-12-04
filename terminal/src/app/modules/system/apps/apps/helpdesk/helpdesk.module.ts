import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { helpdeskRoutes } from './helpdesk.routing';
import { HelpdeskComponent } from './helpdesk.component';
import { TranslateModule } from '@ngx-translate/core';
import { HelpdeskActivityResolver } from './helpdesk.resolvers';
import { HelpdeskService } from './helpdesk.service';

@NgModule({
  providers: [HelpdeskService, HelpdeskActivityResolver],
  declarations: [HelpdeskComponent],
  imports: [
    RouterModule.forChild(helpdeskRoutes),
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
export class HelpdeskModule {}
