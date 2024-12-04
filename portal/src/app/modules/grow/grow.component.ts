import { ChangeDetectorRef, Component, ElementRef, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { AnimationService, fadeAnimations } from '../../shared/animations';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BaseProjectDetailsComponent, LandingPagesService, SeoService, SharedService } from '@sifca-monorepo/clients';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-grow-revenue',
  templateUrl: './grow.component.html',
  styleUrls: ['./grow.component.scss'],
  animations: [fadeAnimations],
})
export class GrowRevenueComponent extends BaseProjectDetailsComponent {
  companyCarousel: OwlOptions = {
    margin: 30,
    dots: false,
    loop: true,
    autoplay: true,
    autoplaySpeed: 1500,
    autoplayMouseleaveTimeout: 5000,
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
      1100: {
        items: 5,
      },
    },
  };
  companySlides = [
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
  ];
  reasonsToChooseUs = [
    {
      question: 'MONETIZE_LOYALTY_POINTS.QUESTION',
      answer: 'MONETIZE_LOYALTY_POINTS.ANSWER',
    },
    {
      question: 'EXPAND_CUSTOMER_BASE.QUESTION',
      answer: 'EXPAND_CUSTOMER_BASE.ANSWER',
    },
    {
      question: 'ENHANCE_POINT_REDEMPTION.QUESTION',
      answer: 'ENHANCE_POINT_REDEMPTION.ANSWER',
    },
  ];
  accordionState: any[] = [];
  toggleAccordion(index: number): void {
    this.accordionState[index] = !this.accordionState[index];
  }
  isAccordionOpen(index: number): boolean {
    return this.accordionState[index];
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

  ngOnInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.fadeAnimationState = entry.isIntersecting ? true : false;
        this.fadeAnimationService.updateFadeAnimationState(entry.isIntersecting);
      });
    });

    observer.observe(this.elementRef.nativeElement);
  }
}
