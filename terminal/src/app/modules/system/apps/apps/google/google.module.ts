import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GoogleComponent } from './google.component';
import { googleRoutes } from './google.routing';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { GoogleResolver, PluginResolver } from './google.resolvers';

@NgModule({
  providers: [GoogleResolver, PluginResolver],
  declarations: [GoogleComponent],
  imports: [RouterModule.forChild(googleRoutes), NgbNavModule, FormsModule, CommonModule, ReactiveFormsModule, TranslateModule],
})
export class GoogleModule {}
