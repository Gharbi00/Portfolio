import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IntegratorComponent } from './integrator.component';
import { integratorRoutes } from './integrator.routing';
import { TranslateModule } from '@ngx-translate/core';
import { GoogleResolver, PluginResolver } from './integrator.resolvers';

@NgModule({
  providers: [GoogleResolver, PluginResolver],
  declarations: [IntegratorComponent],
  imports: [RouterModule.forChild(integratorRoutes), NgbNavModule, FormsModule, CommonModule, ReactiveFormsModule, TranslateModule],
})
export class IntegratorModule {}
