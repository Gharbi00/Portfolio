import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { AppService, BaseContactComponent, LandingPagesService, PosService, SeoService, SharedService } from '@sifca-monorepo/clients';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent extends BaseContactComponent {
  constructor(
    protected override renderer: Renderer2,
    protected override metaTagService: Meta,
    protected override appService: AppService,
    protected override seoService: SeoService,
    protected override titleTagService: Title,
    protected override posService: PosService,
    protected override formBuilder: FormBuilder,
    protected override sharedService: SharedService,
    protected override toastrService: ToastrService,
    protected override changeDetectorRef: ChangeDetectorRef,
    protected override landingPagesService: LandingPagesService,
    @Inject(DOCUMENT) protected override document: Document,
    @Inject(PLATFORM_ID) protected override platformId: Object,
  ) {
    super(
      renderer,
      metaTagService,
      appService,
      seoService,
      titleTagService,
      posService,
      formBuilder,
      sharedService,
      toastrService,
      changeDetectorRef,
      landingPagesService,
      document,
      platformId,
    );
    this.contactForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required, Validators.pattern(this.phoneNumberPattern)]],
      msg_subject: ['', Validators.required],
      message: ['', Validators.required],
      gridCheck: [false, Validators.requiredTrue],
    });
    this.contactForm.statusChanges.subscribe(() => {
      this.isFormValid = this.contactForm.valid;
    });
  }

  contactForm: FormGroup;
  isFormValid = false;
  phoneNumberPattern = '^[1-9]{1}[0-9]{7,}$';



  isFieldInvalid(fieldName: string) {
    const field = this.contactForm.get(fieldName);
    return field && field.invalid && field.touched;
  }
}
