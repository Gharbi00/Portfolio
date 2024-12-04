import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationIntegrationComponent } from './notifications-integration.component';
import { NotificationResolver, WidgetDetailsResolver } from './notifications-integration.resolvers';

export const notificationRoutes: Route[] = [
  {
    path: '',
    component: NotificationIntegrationComponent,
    resolve: {
      notification: NotificationResolver,
    },
  },
];

@NgModule({
  providers: [NotificationResolver, WidgetDetailsResolver],
  declarations: [NotificationIntegrationComponent],
  imports: [
    RouterModule.forChild(notificationRoutes),
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
export class NotificationIntegrationModule {}
