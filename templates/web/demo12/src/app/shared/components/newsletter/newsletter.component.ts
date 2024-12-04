import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';
import { ChangeDetectorRef, Component } from '@angular/core';

import { AppService, UtilsService, BaseIndexNewsletterComponent, SharedService, SlidesService } from '@sifca-monorepo/clients';

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss'],
})
export class NewsletterComponent extends BaseIndexNewsletterComponent {

  constructor(
    protected appService: AppService,
    protected formBuilder: FormBuilder,
    protected utilsService: UtilsService,
    protected toastrService: ToastrService,
    protected override sharedService: SharedService,
    protected slidesService: SlidesService,
    protected changeDetectorRef: ChangeDetectorRef,
  ) {
    super(appService, formBuilder, utilsService, toastrService, sharedService, slidesService, changeDetectorRef);
  }
}