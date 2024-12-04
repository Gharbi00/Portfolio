import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BlogRoutingModule } from './blog-routing.module';
import { BlogDetailsComponent } from './detail/detail.component';
import { BlogListComponent } from './list/list.component';
import { LayoutModule } from '../../shared/layout/layout.module';
import { QuillModule } from 'ngx-quill';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule } from 'ngx-owl-carousel-o';

@NgModule({
  declarations: [BlogDetailsComponent, BlogListComponent],

  imports: [CommonModule,CarouselModule, TranslateModule, BlogRoutingModule, LayoutModule, QuillModule],
  exports: [RouterModule],
})
export class BlogModule {}
