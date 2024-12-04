import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '../shared/layout/main-layout/main-layout.component';
import { IndexComponent } from './home/home.component';
import { Error404Component } from './pages/error404/error404.component';
import { InitialDataResolver } from '../app.resolvers';
import { ContactComponent } from './pages/contact/contact.component';
import { PrivacyPolicyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { CookiePolicyComponent } from './pages/cookie/cookie.component';
import { TranslateModule } from '@ngx-translate/core';

const modulesRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },
    children: [
      { path: '', component: IndexComponent },
      { path: 'terms', component: TermsComponent },
      { path: 'privacy', component: PrivacyPolicyComponent },
      { path: 'cookies', component: CookiePolicyComponent },
      { path: 'contact', component: ContactComponent },
    ],
  },
  { path: '404', component: Error404Component },
];

@NgModule({
  declarations: [ContactComponent, Error404Component, PrivacyPolicyComponent, TermsComponent, CookiePolicyComponent],
  imports: [CommonModule, RouterModule.forChild(modulesRoutes),TranslateModule],
  exports: [RouterModule],
})
export class ModulesRoutingModule {}
