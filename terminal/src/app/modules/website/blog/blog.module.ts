import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxMasonryModule } from 'ngx-masonry';
import { BlogComponent } from './blog.component';
import { Route, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { SimplebarAngularModule } from 'simplebar-angular';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbNavModule,
  NgbAlertModule,
  NgbModalModule,
  NgbToastModule,
  NgbPopoverModule,
  NgbTooltipModule,
  NgbCarouselModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbAccordionModule,
  NgbPaginationModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';

import { UploadHelper } from '@diktup/frontend/helpers';

import { ListBlogsComponent } from './list/list.component';
import { SharedModule } from '../../../shared/shared.module';
import { BlogDetailsComponent } from './details/details.component';
import { ContentBlogResolver, ContentDetailBlogResolver } from './blog.resolvers';
import { TranslationResolver } from '../content/slides/slides.resolvers';
import { QuillModule } from 'ngx-quill';

export const routes: Route[] = [
  {
    path: '',
    component: BlogComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ListBlogsComponent,
        resolve: {
          blogs: ContentBlogResolver,
          translation: TranslationResolver,
        },
      },
      {
        path: ':id',
        component: BlogDetailsComponent,
        resolve: {
          blog: ContentDetailBlogResolver,
          translation: TranslationResolver,
        },
      },
    ],
  },
];

@NgModule({
  declarations: [BlogComponent, ListBlogsComponent, BlogDetailsComponent],
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    QuillModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    NgSelectModule,
    NgbAlertModule,
    NgbModalModule,
    NgbToastModule,
    TranslateModule,
    NgxMasonryModule,
    NgbTooltipModule,
    NgbPopoverModule,
    NgbCarouselModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbAccordionModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbProgressbarModule,
    SimplebarAngularModule,
  ],
  providers: [ContentBlogResolver, ContentDetailBlogResolver, UploadHelper],
})
export class BlogModule {}
