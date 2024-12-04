import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonsComponent } from './buttons.component';
import { ButtonsResolver, WidgetResolver } from './buttons.resolvers';

export const buttonsRoutes: Route[] = [
  {
    path: '',
    component: ButtonsComponent,
    resolve: {
      buttons: ButtonsResolver,
      widget: WidgetResolver,
    },
  },
];

@NgModule({
  declarations: [ButtonsComponent],
  providers: [ButtonsResolver, WidgetResolver],
  imports: [
    RouterModule.forChild(buttonsRoutes),
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
export class ButtonsModule {}
