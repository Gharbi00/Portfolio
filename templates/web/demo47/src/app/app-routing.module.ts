import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorComponent } from './modules/pages/error/error.component';



const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full'
  },
  {path:'',
  loadChildren: () => import('./modules/modules.module').then(m => m.ModulesModule)},
  { 
    path: '404', 
    component: ErrorComponent
  },
  {
    path: '**', // Navigate to Home Page if not found any page
    redirectTo: '404',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: false,
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled'
})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
