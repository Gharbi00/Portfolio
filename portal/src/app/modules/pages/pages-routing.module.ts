import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { PrivacyPolicyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { CookiePolicyComponent } from './cookie/cookie.component';

const pagesroutes: Routes = [
  // { path: 'about', component: AboutComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'privacy', component: PrivacyPolicyComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'cookie', component: CookiePolicyComponent },
];
@NgModule({
  declarations: [],

  imports: [CommonModule, RouterModule.forChild(pagesroutes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
