import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogDetailsComponent } from './detail/detail.component';
import { BlogListComponent } from './list/list.component';
import { BlogRoutingModule } from './blog-routing.module';

@NgModule({
  declarations: [BlogDetailsComponent, BlogListComponent],
  imports: [CommonModule, BlogRoutingModule],
})
export class BlogModule {}
