import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { fadeAnimations } from '../../shared/animations';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { BaseProjectDetailsComponent, LandingPagesService, SeoService, SharedService } from '@sifca-monorepo/clients';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-losing-customers',
  templateUrl: './engage.component.html',
  styleUrls: ['./engage.component.scss'],
  animations: [fadeAnimations],
})
export class LosingCustomersComponent extends BaseProjectDetailsComponent {
  companySlides = [
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
    'assets/images/logo/logo-1.png',
  ];

  companyCarousel: OwlOptions = {
    dots: false,
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

  constructor(
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
    this.activeTab = this.activeTab;
  }

  ngOnInit(): void {}
  state = ['*', '*', '*', '*', '*', '*', '*'];
  activeTab = 0;
  switchTab(tab: number) {
    this.activeTab = tab;
    this.state[tab] = 'open';
    console.log(this.activeTab);
  }

  tabsImages = [
    { custom: 'assets/images/icon/105.svg', active: 'assets/images/icon/105-c.svg' },
    { custom: 'assets/images/icon/106.svg', active: 'assets/images/icon/106-c.svg' },
    { custom: 'assets/images/icon/107.svg', active: 'assets/images/icon/107-c.svg' },
    { custom: 'assets/images/icon/108.svg', active: 'assets/images/icon/108-c.svg' },
    { custom: 'assets/images/icon/109.svg', active: 'assets/images/icon/109-c.svg' },
    { custom: 'assets/images/icon/110.svg', active: 'assets/images/icon/110-c.svg' },
    { custom: 'assets/images/icon/111.svg', active: 'assets/images/icon/111-c.svg' },
  ];
}
