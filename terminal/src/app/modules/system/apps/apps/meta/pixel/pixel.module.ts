import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PixelComponent } from './pixel.component';
import { pixelRoutes } from './pixel.routing';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CatalogueDetailsResolver, PixelDetailsResolver, PixelResolver } from './pixel.resolvers';

@NgModule({
  providers: [PixelResolver, PixelDetailsResolver, CatalogueDetailsResolver],
  declarations: [PixelComponent],
  imports: [RouterModule.forChild(pixelRoutes), NgbNavModule, FormsModule, CommonModule, ReactiveFormsModule, TranslateModule],
})
export class PixelModule {}
