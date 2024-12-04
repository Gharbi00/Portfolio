import { DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { AppService, BaseContactComponent, LandingPagesService, PosService, SeoService, SharedService } from '@sifca-monorepo/clients';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent extends BaseContactComponent {
  testimonials = [
    {
      userName: 'Leah Stanley',
      estimatedReturns: '$425.20',
      winningDate: 'Jan 2022',
      userImage: 'assets/img/testimonial/user-2.png',
      feedback: 'Since it’s all by chance, enjoy picking your numbers or seeing what the lottery terminal generates.',
    },
    {
      userName: 'Megan Clayton',
      estimatedReturns: '$99.51',
      winningDate: 'Dec 2021',
      userImage: 'assets/img/testimonial/user-3.png',
      feedback: 'Since it’s all by chance, enjoy picking your numbers or seeing what the lottery terminal generates.',
    },
    {
      userName: 'Ruhio S. Albert',
      estimatedReturns: '$205.20',
      winningDate: 'Apr 2022',
      userImage: 'assets/img/testimonial/user-1.jpg',
      feedback: 'Since it’s all by chance, enjoy picking your numbers or seeing what the lottery terminal generates.',
    },
  ];
  testimonialscarousel: OwlOptions = {
    items: 3,
    loop: true,
    autoplay: false,
    dots: true,
    nav: false,
    responsive:{
      0:{items:1
    },
    2000:{items:2
    }}
  };

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

  onSubmit() {
    if (this.contactForm.valid) {
      // Handle form submission
      console.log(this.contactForm.value);
    }
  }

  isFieldInvalid(fieldName: string) {
    const field = this.contactForm.get(fieldName);
    return field && field.invalid && field.touched;
  }
}
