import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'profile',
    loadChildren: () => import('./profile/business-profile.module').then((m) => m.BusinessProfileModule),
  },
  {
    path: 'content',
    loadChildren: () => import('./content/content.module').then((m) => m.ContentModule),
  },
  {
    path: 'blog',
    loadChildren: () => import('./blog/blog.module').then((m) => m.BlogModule),
  },
  {
    path: 'requests',
    loadChildren: () => import('./requests/requests.module').then((m) => m.RequestsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WebsiteRoutingModule {}
