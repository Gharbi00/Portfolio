import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InitialDataResolver } from './app.resolvers';
import { ResetPasswordComponent } from './modules/auth/reset-password/reset-password.component';
import { LayoutComponent } from './shared/layout/main/main.component';

const routes: Routes = [
  {
    path: 'fp/:token',
    component: ResetPasswordComponent,
  },
  {
    path: '',
    component: LayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },
    loadChildren: () => import('./modules/modules.module').then((m) => m.ModulesModule),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
