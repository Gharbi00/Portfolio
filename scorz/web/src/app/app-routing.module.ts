import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const approutes: Routes = [
  { path: '', loadChildren: () => import('./modules/modules.module').then((m) => m.ModulesModule) },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [RouterModule.forRoot(approutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
