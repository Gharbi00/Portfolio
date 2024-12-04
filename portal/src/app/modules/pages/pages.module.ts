import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContactComponent } from './contact/contact.component';
import { Error404Component } from './error404/error404.component';
import { PrivacyPolicyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';

import { CarouselModule } from 'ngx-owl-carousel-o';
import { PagesRoutingModule } from './pages-routing.module';
import { CountUpModule } from 'ngx-countup';
import { CookiePolicyComponent } from './cookie/cookie.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PosService } from '@sifca-monorepo/clients';

@NgModule({
  declarations: [ContactComponent, Error404Component, PrivacyPolicyComponent, TermsComponent, CookiePolicyComponent],
  imports: [CommonModule, TranslateModule, PagesRoutingModule, CarouselModule, CountUpModule, FormsModule, ReactiveFormsModule],
  providers: [PosService],
  exports: [RouterModule],
})
export class PagesModule {}
