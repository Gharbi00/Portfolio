import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/modules.module').then(m => m.ModulesModule)
  },
  { path: 'auth', loadChildren: () => import('./account/account.module').then((m) => m.AccountModule) },
  { path: 'pv', loadChildren: () => import('./preview/preview.module').then((m) => m.PreviewModule) },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '404',
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot(routes, { paramsInheritanceStrategy: 'always' })],
})
export class AppRoutingModule {}
