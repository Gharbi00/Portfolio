import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { fadeAnimations } from '../../shared/animations';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BaseIndexComponent, SeoService, SharedService, SlidesService, VisualsService } from '@sifca-monorepo/clients';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

import { LanguageService } from '../../shared/language.service';
import { ObservableInput } from 'rxjs';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimations],
})
export class IndexComponent extends BaseIndexComponent {
  public rtl$: ObservableInput<boolean> = this.languageService.rtl$;

  customers = [
    { src: 'assets/images/logo/logo-1.png' },
    { src: 'assets/images/logo/logo-2.png' },
    { src: 'assets/images/logo/logo-3.png' },
    { src: 'assets/images/logo/logo-4.png' },
    { src: 'assets/images/logo/logo-5.png' },
    { src: 'assets/images/logo/logo-7.png' },
  ];
  testomonials = [
    {
      name: 'Martin Jonas',
      country: 'TESTOMONIAL1.COUNTRY',
      description: 'TESTOMONIAL1.DESCRIPTION',
    },
    {
      name: 'Rashed Ka, ',
      country: 'TESTOMONIAL2.COUNTRY',
      description: 'TESTOMONIAL2.DESCRIPTION',
    },
    {
      name: 'Elias Brett',
      country: 'TESTOMONIAL3.COUNTRY',
      description: 'TESTOMONIAL3.DESCRIPTION',
      src: 'assets/images/media/img_78.png',
    },
    {
      name: 'Martin Jonas',
      country: 'TESTOMONIAL4.COUNTRY',
      description: 'TESTOMONIAL4.DESCRIPTION',
      src: 'assets/images/media/img_78.png',
    },
    {
      name: 'Rashed Ka, ',
      country: 'TESTOMONIAL5.COUNTRY',
      description: 'TESTOMONIAL5.DESCRIPTION',
      src: 'assets/images/media/img_78.png',
    },
    {
      name: 'Elias Brett',
      country: 'TESTOMONIAL6.COUNTRY',
      description: 'TESTOMONIAL6.DESCRIPTION',
      src: 'assets/images/media/img_78.png',
    },
  ];

  testomonialCarousel: OwlOptions = {
    nav: false,
    dots: true,

    margin: 10,

    responsive: {
      0: {
        items: 1,
      },
      550: {
        items: 2,
      },
      1000: {
        items: 3,
      },
    },
  };
  companyCarousel: OwlOptions = {
    items: 5,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      700: {
        items: 3,
      },
      800: {
        items: 4,
      },
      130: {
        items: 5,
      },
    },
  };

  constructor(
    public languageService: LanguageService,
    protected override renderer: Renderer2,
    protected override metaTagService: Meta,
    protected override titleTagService: Title,
    protected override seoService: SeoService,
    protected override sharedService: SharedService,
    protected override slidesService: SlidesService,
    protected override visualsService: VisualsService,
    @Inject(DOCUMENT) protected override document: Document,
    protected override changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) protected override platformId: Object,
  ) {
    super(
      renderer,
      metaTagService,
      titleTagService,
      seoService,
      sharedService,
      slidesService,
      visualsService,
      changeDetectorRef,
      document,
      platformId,
    );
    this.accordionState = new Array(this.faqAccordions.length).fill(false);
  }

  ngOnInit(): void {}

  //accoordion_section

  accordionState: any[] = [];

  faqAccordions = [
    {
      question: 'LOYALTY_SOLUTION.QUESTION',
      answer: 'LOYALTY_SOLUTION.ANSWER',
    },
    {
      question: 'ENGAGE_CUSTOMERS.QUESTION',
      answer: 'ENGAGE_CUSTOMERS.ANSWER',
    },
    {
      question: 'ENHANCE_CUSTOMER_UNDERSTANDING.QUESTION',
      answer: 'ENHANCE_CUSTOMER_UNDERSTANDING.ANSWER',
    },
    {
      question: 'REWARDS_OFFERED.QUESTION',
      answer: 'REWARDS_OFFERED.ANSWER',
    },
    {
      question: 'INCREASE_REVENUE.QUESTION',
      answer: 'INCREASE_REVENUE.ANSWER',
    },
    {
      question: 'SUITABLE_FOR_ALL_SIZES.QUESTION',
      answer: 'SUITABLE_FOR_ALL_SIZES.ANSWER',
    },
    {
      question: 'CUSTOMER_DATA_PROTECTION.QUESTION',
      answer: 'CUSTOMER_DATA_PROTECTION.ANSWER',
    },
    {
      question: 'CUSTOMIZATION_OPTIONS.QUESTION',
      answer: 'CUSTOMIZATION_OPTIONS.ANSWER',
    },
  ];

  halfFaq = Math.floor(this.faqAccordions.length / 2);

  toggleAccordion(index: number): void {
    this.accordionState[index] = !this.accordionState[index];
  }
  isAccordionOpen(index: number): boolean {
    return this.accordionState[index];
  }
}
