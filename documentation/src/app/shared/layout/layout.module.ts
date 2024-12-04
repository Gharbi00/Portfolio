import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from '../components/pagination/pagination.component';


@NgModule({
  declarations: [HeaderComponent, MainLayoutComponent,PaginationComponent ],
  imports: [CommonModule, RouterModule],
  exports: [MainLayoutComponent,PaginationComponent],
})
export class LayoutModule {}
