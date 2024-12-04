import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { RouterModule } from '@angular/router';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactUsComponent } from '../components/contact-us/contact-us.component';

@NgModule({
  declarations: [HeaderComponent,ContactUsComponent, FooterComponent, MainLayoutComponent, PaginationComponent],
  imports: [CommonModule,TranslateModule,ReactiveFormsModule,FormsModule, RouterModule, NgbModule],
  exports: [MainLayoutComponent, PaginationComponent],
})
export class LayoutModule {}
