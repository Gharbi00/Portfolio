import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { fadeAnimations } from '../../../shared/animations';
import { BasePageComponent, LandingPagesService, SeoService, SharedService, SlidesService } from '@sifca-monorepo/clients';
import { LandingPageTypeEnum } from '@sifca-monorepo/ecommerce-generator';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-cookie-policy',
  templateUrl: './cookie.component.html',
  styleUrls: ['./cookie.component.scss'],
  animations: [fadeAnimations],
})
export class CookiePolicyComponent extends BasePageComponent {
  constructor(
    protected override renderer: Renderer2,
    protected override metaTagService: Meta,
    protected override seoService: SeoService,
    protected override titleTagService: Title,
    protected override sharedService: SharedService,
    protected override slidesService: SlidesService,
    protected override changeDetectorRef: ChangeDetectorRef,
    protected override landingPagesService: LandingPagesService,
    @Inject(DOCUMENT) protected document: Document,
    @Inject(PLATFORM_ID) protected override platformId: Object,
  ) {
    super(
      renderer,
      metaTagService,
      seoService,
      titleTagService,
      sharedService,
      slidesService,
      changeDetectorRef,
      landingPagesService,
      document,
      platformId,
      LandingPageTypeEnum.COPYRIGHT,
    );
  }
  navs = [
    'NAV_1_INTRODUCTION',
    'NAV_2_WHAT_ARE_COOKIES',
    'NAV_3_HOW_WE_USE_COOKIES',
    'NAV_4_TYPES_OF_COOKIES_WE_USE',
    'NAV_5_YOUR_CHOICES',
    'NAV_6_MORE_INFORMATION',
    'NAV_7_CHANGES_TO_POLICY',
    'NAV_8_CONTACT_US',
  ];

  ngOnInit(): void {}
  activeTab = 0;
  switchTab(tab: number) {
    this.activeTab = tab;
  }
}
