import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.module').then((m) => m.PagesModule),
  },
  {
    path: 'visuals',
    loadChildren: () => import('./visuals/visuals.module').then((m) => m.VisualsModule),
  },
  {
    path: 'slides',
    loadChildren: () => import('./slides/slides.module').then((m) => m.SlidesModule),
  },
  {
    path: 'static',
    loadChildren: () => import('./static/static.module').then((m) => m.StaticModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentRoutingModule {}
