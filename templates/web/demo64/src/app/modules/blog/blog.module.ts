import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { BlogComponent } from './blog.component';
import { BlogRoutingModule } from './blog-routing.module';


@NgModule({
    declarations:[
        BlogListComponent,
        BlogDetailsComponent,
        BlogComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        BlogRoutingModule

      ]

})
export class BlogModule {}
