import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { iconsRoutes } from './visuals.routing';
import { VisualsComponent } from './visuals.component';
import { UploadHelper } from '@diktup/frontend/helpers';
import { TranslateModule } from '@ngx-translate/core';
import { VisualsLogosComponent } from './list/logos.component';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { SharedModule } from '../../../../shared/shared.module';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { NestableModule } from 'ngx-nestable';
import { VisualsResolver } from './visuals.resolvers';

@NgModule({
  declarations: [VisualsComponent, VisualsLogosComponent],
  imports: [
    RouterModule.forChild(iconsRoutes),
    CommonModule,
    NgbDropdownModule,
    TranslateModule,
    NgbRatingModule,
    SimplebarAngularModule,
    NestableModule,
    SharedModule,
    NgxUsefulSwiperModule,
  ],
  providers: [VisualsResolver, UploadHelper],
})
export class VisualsModule {}
