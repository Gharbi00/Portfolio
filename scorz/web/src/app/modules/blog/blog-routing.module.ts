import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { BlogListComponent } from '../blog/list/list.component';
import { BlogDetailsComponent } from '../blog/detail/detail.component';

const routes: Routes = [
  {
    path: '',
    component: BlogListComponent,
  },
  /*   {
    path: ':url',
    component: BlogDetailsComponent,
  }, */
  {
    path: 'details',
    component: BlogDetailsComponent,
  },
];
@NgModule({
  declarations: [],

  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlogRoutingModule {}
