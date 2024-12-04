import { ChangeDetectorRef, Component } from '@angular/core';
import { fadeAnimations } from '../../../shared/animations';
import { AppService, BaseIndexNewsletterComponent, SharedService, SlidesService, UtilsService } from '@sifca-monorepo/clients';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-newsletter',
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss'],
  animations: [fadeAnimations],
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
