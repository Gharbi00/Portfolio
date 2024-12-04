import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContactComponent } from './contact/contact.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ReviewComponent } from './review/review.component';
import { OrderSuccessComponent } from './order-success/order-success.component';
import { ErrorComponent } from './error/error.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { FaqComponent } from './faq/faq.component';
import { ShippingComponent } from './shipping/shipping.component';
import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { CopyrightComponent } from './copyright/copyright.component';



const routes: Routes = [


  { 
    path: 'shipping', 
    component: ShippingComponent 
  },
  { 
    path: 'terms', 
    component: TermsComponent 
  },
  { 
    path: 'privacy', 
    component: PrivacyComponent
  },
  { 
    path: 'copyright', 
    component: CopyrightComponent
  },
  { 
    path: 'contact', 
    component: ContactComponent 
  },

  { 
    path: 'about-us', 
    component: AboutUsComponent 
  },


  { 
    path: 'review', 
    component: ReviewComponent 
  },
  { 
    path: 'order/success', 
    component: OrderSuccessComponent 
  },


  { 
    path: 'comingsoon', 
    component: ComingSoonComponent 
  },
  { 
    path: 'faq', 
    component: FaqComponent 
  },

 

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
