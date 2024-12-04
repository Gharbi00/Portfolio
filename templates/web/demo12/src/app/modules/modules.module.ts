import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './pages/about/about.component';
import { ContactPageComponent } from './pages/contact/contact.component';
import { CopyrightComponent } from './pages/copyright/copyright.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { PrivacyPageComponent } from './pages/privacy/privacy.component';
import { ReturnsPageComponent } from './pages/returns/returns.component';
import { ShippingPageComponent } from './pages/shipping/shipping.component';
import { TermsPageComponent } from './pages/terms/terms.component';

import { HomeModule } from './home/home.module';
import { ShopModule } from './shop/shop.module';
import { ModulesRoutingModule } from './modules-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    AboutComponent,
    ContactPageComponent,
    CopyrightComponent,
    FaqsComponent,
    PageNotFoundComponent,
    PrivacyPageComponent,
    ReturnsPageComponent,
    ShippingPageComponent,
    TermsPageComponent,


  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HomeModule,
    ShopModule,
    ModulesRoutingModule,
    SharedModule,
    MatFormFieldModule,
    
    
  ],
})
export class ModulesModule { }
