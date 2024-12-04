import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { AnimationService, fadeAnimations } from '../../shared/animations';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BaseProjectDetailsComponent, LandingPagesService, SeoService, SharedService } from '@sifca-monorepo/clients';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { LanguageService } from '../../shared/language.service';
import { Observable } from 'rxjs';
declare var bootstrap: any;
@Component({
  selector: 'app-monetize-community',
  templateUrl: './monetize.component.html',
  styleUrls: ['./monetize.component.scss'],
  animations: [fadeAnimations],
})
export class MonetizeCommunityComponent extends BaseProjectDetailsComponent implements AfterViewInit {
  public rtl$: Observable<boolean> = this.languageService.rtl$;
  activeDotIndex: number = 0;

  rtl;
  companyCarousel: OwlOptions = {
    margin: 20,
    loop: true,
    autoplay: true,
    autoplaySpeed: 1500,
    autoplayMouseleaveTimeout: 5000,
    items: 5,
    rtl: false,
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
      1100: {
        items: 5,
      },
    },
  };
  docsCarousel: OwlOptions = {
    loop: true,
    autoplay: true,
    autoplaySpeed: 1500,
    autoplayMouseleaveTimeout: 8000,
    items: 1,
    rtl: true,
    dots: true,
    responsive: {
      0: { items: 1 },
    },
  };
  companySlides = [
    'assets/images/logo/logo-2.png',
    'assets/images/logo/logo-3.png',
    'assets/images/logo/logo-4.png',
    'assets/images/logo/logo-5.png',
    'assets/images/logo/logo-6.png',
    'assets/images/logo/logo-7.png',
    'assets/images/logo/logo-8.png',
  ];
  carouselSlides = [
    { index: 0, imageSrc: 'assets/images/assets/feature-img-12.png' },
    { index: 1, imageSrc: 'assets/images/assets/feature-img-12.png' },
    { index: 2, imageSrc: 'assets/images/assets/feature-img-12.png' },
  ];
  faqAccordions = [
    {
      question: 'WHAT_IS_THE_MAIN_PURPOSE_OF_THIS_PLATFORM.QUESTION',
      answer: 'WHAT_IS_THE_MAIN_PURPOSE_OF_THIS_PLATFORM.ANSWER',
    },
    {
      question: 'HOW_DOES_THE_PLATFORM_BENEFIT_WEBSITE_OWNERS.QUESTION',
      answer: 'HOW_DOES_THE_PLATFORM_BENEFIT_WEBSITE_OWNERS.ANSWER',
    },
    {
      question: 'HOW_DO_I_GET_STARTED_WITH_THE_PLATFORM.QUESTION',
      answer: 'HOW_DO_I_GET_STARTED_WITH_THE_PLATFORM.ANSWER',
    },
    {
      question: 'WHAT_TYPES_OF_ACTIONS_CAN_USERS_BE_REWARDED_FOR.QUESTION',
      answer: 'WHAT_TYPES_OF_ACTIONS_CAN_USERS_BE_REWARDED_FOR.ANSWER',
    },
    {
      question: 'HOW_DOES_THE_PLATFORM_ENSURE_THE_QUALITY_OF_USER_ACTIONS.QUESTION',
      answer: 'HOW_DOES_THE_PLATFORM_ENSURE_THE_QUALITY_OF_USER_ACTIONS.ANSWER',
    },
  ];
  accordionState: any[] = [];
  toggleAccordion(index: number): void {
    this.accordionState[index] = !this.accordionState[index];
  }
  isAccordionOpen(index: number): boolean {
    return this.accordionState[index];
  }
  onTranslated(event: any) {
    this.activeDotIndex = event.item.index;
  }

  fadeAnimationState = false;

  constructor(
    private elementRef: ElementRef,
    private fadeAnimationService: AnimationService,
    protected override renderer: Renderer2,
    protected override metaTagService: Meta,
    protected override seoService: SeoService,
    protected override titleTagService: Title,
    protected override sharedService: SharedService,
    private languageService: LanguageService,
    protected override activatedRoute: ActivatedRoute,
    protected override changeDetectorRef: ChangeDetectorRef,
    protected override landingPagesService: LandingPagesService,
    @Inject(DOCUMENT) protected override document: Document,
    @Inject(PLATFORM_ID) protected override platformId: Object,
  ) {
    super(
      renderer,
      metaTagService,
      seoService,
      titleTagService,
      sharedService,
      activatedRoute,
      changeDetectorRef,
      landingPagesService,
      document,
      platformId,
    );
  }
  initCarousel(rtl) {
    console.log(rtl, 'initCarousel()');
    this.companyCarousel.rtl = rtl;
    this.docsCarousel.rtl = rtl;
  }

  ngOnInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.fadeAnimationState = entry.isIntersecting ? true : false;
        this.fadeAnimationService.updateFadeAnimationState(entry.isIntersecting);
      });
    });
    this.languageService.rtl$.subscribe((rtl) => {
      this.initCarousel(rtl);
      this.changeDetectorRef.detectChanges();
    });

    observer.observe(this.elementRef.nativeElement);
  }

  ngAfterViewInit(): void {
    var myCarousel = document.querySelector('#carouselExampleIndicators');
    var carousel = new bootstrap.Carousel(myCarousel, {
      interval: 2000,
      wrap: true,
      touch: true,
    });
  }
}
