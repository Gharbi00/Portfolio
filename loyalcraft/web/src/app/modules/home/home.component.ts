import { fadeAnimations } from '../../shared/animations';
import {  ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2} from '@angular/core';
import { BaseIndexComponent, SeoService, SharedService, SlidesService, VisualsService } from '@sifca-monorepo/clients';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ObservableInput } from 'rxjs';
import { LanguageService } from '../../shared/language.service';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
/* declare const bootstrap: any; */
@Component({
  selector: 'app-home-screen',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimations],
})
export class IndexComponent extends BaseIndexComponent  {
  accordionState: any[] = [];
  public rtl$: ObservableInput<boolean> = this.languageService.rtl$;
  
  productsCarousel: OwlOptions = {
    nav: false,
    dots: false,
    loop: true,
    center: true,
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
  productsData = [
    'assets/images/assets/screen_1.png',
    'assets/images/assets/screen_2.png',
    'assets/images/assets/screen_3.png',
    'assets/images/assets/screen_4.png',
    'assets/images/assets/screen_5.png',
    'assets/images/assets/screen_6.png',
    'assets/images/assets/screen_7.png',
    'assets/images/assets/screen_8.png',
    'assets/images/assets/screen_9.png',
    'assets/images/assets/screen_10.png',
  ];
  number = Math.floor(this.productsData.length / 2);
  testomonialsCarousel: OwlOptions = {
    nav: true,
    dots: false,
    loop: true,
    items: 1,
    navText: [
      '<i _ngcontent-tjn-c16="" class="flaticon-right-arrow ng-tns-c16-3" ></i>',
      '<i _ngcontent-tjn-c16="" class="flaticon-right-arrow ng-tns-c16-3"></i>',
    ],
  };
  testomonialsData = [
    {
      description:
        'TESTOMONIAL_DATA.DESCRIPTION1',
      name: 'Rashed kabir',
      job: 'JOB',
    },
    {
      description:
        'TESTOMONIAL_DATA.DESCRIPTION2',
      name: 'Rashed kabir',
      job: 'JOB',
    },
    {
      description:
        'TESTOMONIAL_DATA.DESCRIPTION3',
      name: 'Rashed kabir',
      job: 'JOB',
    },
    {
      description: 'TESTOMONIAL_DATA.DESCRIPTION4',
      name: 'Rashed kabir',
      job: 'JOB',
    },
    {
      description:
        'TESTOMONIAL_DATA.DESCRIPTION5',
      name: 'Rashed kabir',
      job: 'JOB',
    },
  ];
  screenshotsCarousel: OwlOptions = {
    nav: false,
    dots: false,
    loop: true,

    center: true,

    responsive: {
      0: {
        items: 1,
      },
      500: {
        items: 2,
      },
      700: {
        items: 3,
      },
      900: {
        items: 4,
      },
      1100: {
        items: 5,
      },
    },
  };
  screenshots = [
    'assets/images/assets/screen_29.png',
    'assets/images/assets/screen_29.png',
    'assets/images/assets/screen_29.png',
    'assets/images/assets/screen_29.png',
    'assets/images/assets/screen_29.png',
    'assets/images/assets/screen_29.png',
    'assets/images/assets/screen_29.png',
    'assets/images/assets/screen_29.png',
    'assets/images/assets/screen_29.png',
  ];
  faqAccordions = [
    {
      question: 'FAQ_DATA.QUESTION1',
      answer:
        'FAQ_DATA.ANSWER1',
    },
    {
      question: 'FAQ_DATA.QUESTION2',
      answer: 'FAQ_DATA.ANSWER2',
    },
    {
      question: 'FAQ_DATA.QUESTION3',
      answer: 'FAQ_DATA.ANSWER3',
    },
    {
      question: 'FAQ_DATA.QUESTION4',
      answer:
        'FAQ_DATA.ANSWER4',
    },
    {
      question: 'FAQ_DATA.QUESTION5',
      answer:
        'FAQ_DATA.ANSWER5',
    },
    {
      question: 'FAQ_DATA.QUESTION6',
      answer: 'FAQ_DATA.ANSWER6',
    },
    {
      question: 'FAQ_DATA.QUESTION7',
      answer:
        'FAQ_DATA.ANSWER7',
    },
    {
      question: 'FAQ_DATA.QUESTION8',
      answer:
        'FAQ_DATA.ANSWER8',
    },
  ];

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
  initCarousel(rtl) {
    console.log(rtl, 'initCarousel()');
    this.productsCarousel.rtl = rtl;
    this.testomonialsCarousel.rtl = rtl;
  }

  ngOnInit(): void {
    this.languageService.rtl$.subscribe((rtl) => {
      this.initCarousel(rtl);
      this.changeDetectorRef.detectChanges();
    });
  }

  halfFaq = Math.floor(this.faqAccordions.length / 2);
  fadeAnimationState = 'void';

  toggleAccordion(index: number): void {
    this.accordionState[index] = !this.accordionState[index];
  }
  isAccordionOpen(index: number): boolean {
    return this.accordionState[index];
  }
  isCollapsed = false;
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}
