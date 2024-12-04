import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from './modules/pages/error404/error404.component';

const approutes: Routes = [
  { path: '', loadChildren: () => import('./modules/modules.module').then((m) => m.ModulesModule) },
  { path: '404', component: Error404Component },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [    RouterModule.forRoot(approutes, {
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
    scrollOffset: [0, 64]
  })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
