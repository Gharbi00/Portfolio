import { Route } from '@angular/router';

import { WebsiteComponent } from './website.component';
import { EmailsResolver, FilesResolver, SeoResolver, SmsIntegrationResolver, WebsiteActivityResolver, WebsiteResolver } from './website.resolvers';

export const websiteRoutes: Route[] = [
  {
    path: '',
    component: WebsiteComponent,
    resolve: {
      seo: SeoResolver,
      files: FilesResolver,
      emails: EmailsResolver,
      website: WebsiteResolver,
      sms: SmsIntegrationResolver,
      definitions: WebsiteActivityResolver,
    },
  },
];
