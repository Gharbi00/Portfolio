import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { CountToModule } from 'angular-count-to';
import { NgApexchartsModule } from 'ng-apexcharts';
import { TranslateModule } from '@ngx-translate/core';
import { NgbTooltipModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';

import { StatComponent } from './dashboard/stat/stat.component';
import { CrmStatComponent } from './crm/crm-stat/crm-stat.component';
import { NftStatComponent } from './nft/nft-stat/nft-stat.component';
import { MyTaskComponent } from './projects/my-task/my-task.component';
import { NewsFeedComponent } from './crypto/news-feed/news-feed.component';
import { TopPagesComponent } from './analytics/top-pages/top-pages.component';
import { CurrenciesComponent } from './crypto/currencies/currencies.component';
import { DealsStatusComponent } from './crm/deals-status/deals-status.component';
import { CryptoStatComponent } from './crypto/crypto-stat/crypto-stat.component';
import { TopSellingComponent } from './dashboard/top-selling/top-selling.component';
import { ClosingDealsComponent } from './crm/closing-deals/closing-deals.component';
import { TeamMembersComponent } from './projects/team-members/team-members.component';
import { BestSellingComponent } from './dashboard/best-selling/best-selling.component';
import { ProjectsStatComponent } from './projects/projects-stat/projects-stat.component';
import { RecentOrdersComponent } from './dashboard/recent-orders/recent-orders.component';
import { TopPerformersComponent } from './crypto/top-performers/top-performers.component';
import { ActiveProjectComponent } from './projects/active-project/active-project.component';
import { AnalaticsStatComponent } from './analytics/analatics-stat/analatics-stat.component';
import { UpcomingActivitiesComponent } from './crm/upcoming-activities/upcoming-activities.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EcommerceRecentOrdersComponent } from './dashboard/ecommerce-recent-orders/ecommerce-recent-orders.component';
import { FlatpickrModule } from 'angularx-flatpickr';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    TranslateModule,
    NgbTooltipModule,
    NgbProgressbarModule,
    CountToModule,
    NgApexchartsModule,
    FlatpickrModule.forRoot(),
    FeatherModule.pick(allIcons),
  ],
  declarations: [
    StatComponent,
    MyTaskComponent,
    CrmStatComponent,
    NftStatComponent,
    TopPagesComponent,
    NewsFeedComponent,
    TopSellingComponent,
    CryptoStatComponent,
    CurrenciesComponent,
    BestSellingComponent,
    DealsStatusComponent,
    TeamMembersComponent,
    RecentOrdersComponent,
    ClosingDealsComponent,
    ProjectsStatComponent,
    AnalaticsStatComponent,
    TopPerformersComponent,
    ActiveProjectComponent,
    UpcomingActivitiesComponent,
    EcommerceRecentOrdersComponent,
  ],
  exports: [
    StatComponent,
    MyTaskComponent,
    CrmStatComponent,
    NftStatComponent,
    TopPagesComponent,
    NewsFeedComponent,
    TopSellingComponent,
    CryptoStatComponent,
    CurrenciesComponent,
    BestSellingComponent,
    DealsStatusComponent,
    TeamMembersComponent,
    RecentOrdersComponent,
    ClosingDealsComponent,
    ProjectsStatComponent,
    AnalaticsStatComponent,
    TopPerformersComponent,
    ActiveProjectComponent,
    UpcomingActivitiesComponent,
    EcommerceRecentOrdersComponent,
  ],
})
export class WidgetModule {}
