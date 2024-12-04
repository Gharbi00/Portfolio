import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [HeaderComponent, FooterComponent, MainLayoutComponent, PaginationComponent],
  imports: [CommonModule, RouterModule,TranslateModule],
  exports: [MainLayoutComponent, PaginationComponent],
})
export class LayoutModule {}
