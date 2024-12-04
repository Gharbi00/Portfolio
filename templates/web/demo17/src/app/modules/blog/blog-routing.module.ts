import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BlogListComponent } from './list/list.component';
import { BlogDetailsComponent } from './detail/detail.component';

const routes: Routes = [
  {
    path: '',
    component: BlogListComponent,
  },
  {
    path: ':url',
    component: BlogDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlogRoutingModule {}
