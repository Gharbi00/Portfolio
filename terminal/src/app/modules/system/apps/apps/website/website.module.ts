import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { websiteRoutes } from './website.routing';
import { WebsiteComponent } from './website.component';
import { TranslateModule } from '@ngx-translate/core';
import { EmailsResolver, FilesResolver, SeoResolver, SmsIntegrationResolver, WebsiteActivityResolver, WebsiteResolver } from './website.resolvers';

@NgModule({
  providers: [WebsiteResolver, WebsiteActivityResolver, EmailsResolver, SmsIntegrationResolver, SeoResolver, FilesResolver],
  declarations: [WebsiteComponent],
  imports: [
    RouterModule.forChild(websiteRoutes),
    FormsModule,
    NgbNavModule,
    CommonModule,
    NgSelectModule,
    TranslateModule,
    MatTooltipModule,
    ColorPickerModule,
    ReactiveFormsModule,
  ],
})
export class WebsiteModule {}
