import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { fadeAnimations } from '../../../shared/animations';
import { BasePageComponent, LandingPagesService, SeoService, SharedService, SlidesService } from '@sifca-monorepo/clients';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { LandingPageTypeEnum } from '@sifca-monorepo/ecommerce-generator';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
  animations: [fadeAnimations],
})
export class TermsComponent extends BasePageComponent {
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
      LandingPageTypeEnum.TERMS,
    );
  }
  navs = [
    'NAV_1_INTRODUCTION',
    'NAV_2_INTELLECTUAL_PROPERTY_RIGHTS',
    'NAV_3_RESTRICTIONS',
    'NAV_4_YOUR_CONTENT',
    'NAV_5_NO_WARRANTIES',
    'NAV_6_LIMITATION_OF_LIABILITY',
    'NAV_7_INDEMNIFICATION',
    'NAV_8_SEVERABILITY',
    'NAV_9_VARIATION_OF_TERMS',
    'NAV_10_ENTIRE_AGREEMENT',
    'NAV_11_GOVERNING_LAW',
  ];

  ngOnInit(): void {}
  activeTab = 0;
  switchTab(tab: number) {
    this.activeTab = tab;
  }
}
