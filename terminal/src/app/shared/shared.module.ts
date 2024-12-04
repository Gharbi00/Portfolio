import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule, NgbAccordionModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';

// Swiper Slider
import { SwiperModule } from 'ngx-swiper-wrapper';

// Counter
import { CountToModule } from 'angular-count-to';

import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ClientLogoComponent } from './landing/index/client-logo/client-logo.component';
import { ServicesComponent } from './landing/index/services/services.component';
import { CollectionComponent } from './landing/index/collection/collection.component';
import { CtaComponent } from './landing/index/cta/cta.component';
import { DesignedComponent } from './landing/index/designed/designed.component';
import { PlanComponent } from './landing/index/plan/plan.component';
import { FaqsComponent } from './landing/index/faqs/faqs.component';
import { ReviewComponent } from './landing/index/review/review.component';
import { CounterComponent } from './landing/index/counter/counter.component';
import { WorkProcessComponent } from './landing/index/work-process/work-process.component';
import { TeamComponent } from './landing/index/team/team.component';
import { ContactComponent } from './landing/index/contact/contact.component';
import { FooterComponent } from './landing/index/footer/footer.component';
import { ScrollspyDirective } from './scrollspy.directive';

// NFT Landing
import { MarketPlaceComponent } from './landing/nft/market-place/market-place.component';
import { WalletComponent } from './landing/nft/wallet/wallet.component';
import { FeaturesComponent } from './landing/nft/features/features.component';
import { CategoriesComponent } from './landing/nft/categories/categories.component';
import { DiscoverComponent } from './landing/nft/discover/discover.component';
import { TopCreatorComponent } from './landing/nft/top-creator/top-creator.component';
import { UsersModalComponent } from './components/users-modal/users-modal.component';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NumberWithSuffixPipe } from './pipes/number-with-suffix.pipe';
import { CardDatePipe } from './pipes/date.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AltPicturesComponent } from './components/alt-pictures/alt-pictures.component';
import { SelectAudienceModalComponent } from './components/select-audience-modal/select-audience-modal.component';
import { SmileyComponent } from './components/smiley/smiley.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { TranslateModule } from '@ngx-translate/core';
import { CustomCurrencyPipe } from './pipes/currency.pipe';
import { EmojiFilterPipe } from './pipes/emojiFiler.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';

@NgModule({
  declarations: [
    EmojiFilterPipe,
    CardDatePipe,
    TruncatePipe,
    CtaComponent,
    PlanComponent,
    FaqsComponent,
    TeamComponent,
    ReviewComponent,
    FooterComponent,
    SmileyComponent,
    WalletComponent,
    CounterComponent,
    ContactComponent,
    ServicesComponent,
    DesignedComponent,
    FeaturesComponent,
    DiscoverComponent,
    ScrollspyDirective,
    UsersModalComponent,
    ClientLogoComponent,
    CustomCurrencyPipe,
    CollectionComponent,
    CategoriesComponent,
    TopCreatorComponent,
    NumberWithSuffixPipe,
    AltPicturesComponent,
    BreadcrumbsComponent,
    WorkProcessComponent,
    MarketPlaceComponent,
    SelectAudienceModalComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    NgbNavModule,
    SwiperModule,
    CountToModule,
    TranslateModule,
    NgbAccordionModule,
    ReactiveFormsModule,
    InfiniteScrollModule,
    NgbProgressbarModule,
    SimplebarAngularModule,
  ],
  exports: [
    CardDatePipe,
    TruncatePipe,
    EmojiFilterPipe,
    CtaComponent,
    PlanComponent,
    FaqsComponent,
    TeamComponent,
    ReviewComponent,
    FooterComponent,
    WalletComponent,
    CounterComponent,
    ContactComponent,
    ServicesComponent,
    DesignedComponent,
    FeaturesComponent,
    DiscoverComponent,
    ScrollspyDirective,
    UsersModalComponent,
    ClientLogoComponent,
    CustomCurrencyPipe,
    CollectionComponent,
    CategoriesComponent,
    TopCreatorComponent,
    NumberWithSuffixPipe,
    AltPicturesComponent,
    BreadcrumbsComponent,
    WorkProcessComponent,
    MarketPlaceComponent,
  ],
})
export class SharedModule {}
