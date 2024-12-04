import { BlogListComponent } from './blog-list/blog-list.component';

import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';


const routes:Routes=[

{ 
    path: '', 
    component: BlogListComponent 
  },

  { 
    path: 'details', 
    component: BlogDetailsComponent 
  },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class BlogRoutingModule { }