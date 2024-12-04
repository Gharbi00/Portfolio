import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CartComponent } from './shop/cart/cart.component';
import { AboutComponent } from './pages/about/about.component';
// import { FaqsPageComponent } from './pages/faqs/faqs.component';
import { TermsPageComponent } from './pages/terms/terms.component';
import { WishlistComponent } from './shop/wishlist/wishlist.component';
// import { CheckoutComponent } from './shop/checkout/checkout.component';
// import { DashboardComponent } from './shop/dashboard/dashboard.component';
import { ContactPageComponent } from './pages/contact/contact.component';
import { PrivacyPageComponent } from './pages/privacy/privacy.component';
import { ReturnsPageComponent } from './pages/returns/returns.component';
import { CopyrightComponent } from './pages/copyright/copyright.component';
import { ShippingPageComponent } from './pages/shipping/shipping.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
// import { AllProductsListComponent } from './shop/category-list/category-list.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  // {
  //   path: 'c/:categoryUrl/:type',
  //   component: AllProductsListComponent,
  // },
  // {
  //   path: 'ci/:categoryUrl/:type',
  //   component: AllProductsListComponent,
  // },
  // {
  //   path: 'p/:urlKey',
  //   loadChildren: () => import('./shop/product/product.module').then((m) => m.ProductModule),
  // },
  // {
  //   path: 'pi/:id',
  //   loadChildren: () => import('./shop/product/product.module').then((m) => m.ProductModule),
  // },
  // {
  //   path: 'c/:categoryUrl',
  //   component: AllProductsListComponent,
  // },
  {
    path: 'wishlist',
    component: WishlistComponent,
  },
  // {
  //   path: 'dashboard',
  //   component: DashboardComponent,
  // },
  {
    path: 'cart',
    component: CartComponent,
  },
  // {
  //   path: 'checkout',
  //   component: CheckoutComponent,
  // },
  {
    path: 'blog',
    loadChildren: () => import('./blog/blog.module').then((m) => m.BlogModule),
  },
  {
    path: 'shop',
    loadChildren: () => import('./shop/shop.module').then((m) => m.ShopModule),
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: '404',
    component: PageNotFoundComponent,
  },
  // {
  //   path: 'faq',
  //   component: FaqsPageComponent,
  // },
  {
    path: 'contact',
    component: ContactPageComponent,
  },
  {
    path: 'privacy',
    component: PrivacyPageComponent,
  },
  {
    path: 'returns',
    component: ReturnsPageComponent,
  },
  {
    path: 'shipping',
    component: ShippingPageComponent,
  },
  {
    path: 'terms',
    component: TermsPageComponent,
  },
  {
    path: 'copyright',
    component: CopyrightComponent,
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
})
export class ModulesRoutingModule {}
