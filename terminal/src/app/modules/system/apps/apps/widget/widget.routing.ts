import { Route } from '@angular/router';

import { WidgetComponent } from './widget.component';
import { WidgetActivityResolver, WidgetResolver } from './widget.resolvers';

export const widgetRoutes: Route[] = [
  {
    path: '',
    component: WidgetComponent,
    resolve: {
      widget: WidgetResolver,
      definitions: WidgetActivityResolver,
    },
  },
];
