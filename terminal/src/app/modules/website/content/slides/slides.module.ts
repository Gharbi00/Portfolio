import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { slidesRoutes } from './slides.routing';
import { SlidesComponent } from './slides.component';
import { SlideComponent } from './list/list.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule, NgbPaginationModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NestableModule } from 'ngx-nestable';
import { SharedModule } from '../../../../shared/shared.module';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlidesDetailsComponent } from './details/details.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { QuillModule } from 'ngx-quill';
import { SlidesDetailsResolver, SlidesResolver, TranslationResolver } from './slides.resolvers';

@NgModule({
  providers: [SlidesResolver, SlidesDetailsResolver, TranslationResolver],
  declarations: [SlideComponent, SlidesComponent, SlidesDetailsComponent],
  imports: [
    RouterModule.forChild(slidesRoutes),
    QuillModule,
    CommonModule,
    NgSelectModule,
    NgbDropdownModule,
    NgbRatingModule,
    NgbPaginationModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    SimplebarAngularModule,
    NestableModule,
    SharedModule,
    NgxUsefulSwiperModule,
  ],
})
export class SlidesModule {}
