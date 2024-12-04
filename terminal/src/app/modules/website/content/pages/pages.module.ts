import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { pagesRoutes } from './pages.routing';
import { PagesComponent } from './pages.component';
import { ContentListComponent } from './list/list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbAccordionModule, NgbDropdownModule, NgbNavModule, NgbTooltipModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { FlatpickrModule } from 'angularx-flatpickr';
import { SharedModule } from '../../../../shared/shared.module';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ContentDetailsComponent } from './details/details.component';
import { QuillModule } from 'ngx-quill';
import { ContentDetailLandingPagesResolver, ContentLandingPagesResolver } from './pages.resolvers';

@NgModule({
  providers: [ContentLandingPagesResolver, ContentDetailLandingPagesResolver],
  declarations: [PagesComponent, ContentListComponent, ContentDetailsComponent],
  imports: [
    RouterModule.forChild(pagesRoutes),
    QuillModule,
    CommonModule,
    FormsModule,
    NgbPaginationModule,
    ReactiveFormsModule,
    NgbNavModule,
    TranslateModule,
    NgbDropdownModule,
    NgbAccordionModule,
    NgbTooltipModule,
    NgxUsefulSwiperModule,
    NgSelectModule,
    FlatpickrModule,
    SharedModule,
    Ng2SearchPipeModule,
  ],
})
export class PagesModule {}
