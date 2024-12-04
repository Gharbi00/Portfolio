import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const pagesroutes: Routes = [];
@NgModule({
  declarations: [],

  imports: [CommonModule, RouterModule.forChild(pagesroutes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
