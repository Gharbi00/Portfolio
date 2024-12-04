import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { LayoutComponent } from './layout/main/main.component';

import { RouterModule } from '@angular/router';
import { QuickViewProductComponent } from './components/quick-view-product/quick-view-product.component';
import { HeaderSearchModalComponent } from './components/header-search-modal/header-search-modal.component';
import { CartDropdownComponent } from './components/cart-dropdown/cart-dropdown.component';
import { OfferPopupModalComponent } from './components/offer-popup-modal/offer-popup-modal.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    LayoutComponent,
    NewsletterComponent,
    QuickViewProductComponent,
    HeaderSearchModalComponent,
    CartDropdownComponent,
    OfferPopupModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    QuickViewProductComponent,
    HeaderSearchModalComponent,
    CartDropdownComponent,
    OfferPopupModalComponent,
    FooterComponent,
    HeaderComponent,
    NewsletterComponent
  ],
})
export class SharedModule { }
