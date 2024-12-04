import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { widgetRoutes } from './widget.routing';
import { WidgetComponent } from './widget.component';
import { TranslateModule } from '@ngx-translate/core';
import { WidgetActivityResolver, WidgetDetailsResolver, WidgetResolver } from './widget.resolvers';
import { SharedModule } from '../../../../../../app/shared/shared.module';

@NgModule({
  providers: [WidgetResolver, WidgetDetailsResolver, WidgetActivityResolver],
  declarations: [WidgetComponent],
  imports: [
    RouterModule.forChild(widgetRoutes),
    FormsModule,
    NgbNavModule,
    CommonModule,
    SharedModule,
    NgSelectModule,
    TranslateModule,
    MatTooltipModule,
    ColorPickerModule,
    NgbPaginationModule,
    ReactiveFormsModule,
  ],
})
export class WidgetModule {}
