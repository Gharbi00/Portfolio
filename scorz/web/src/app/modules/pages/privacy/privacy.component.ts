import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { fadeAnimations } from '../../../shared/animations';
import { BasePageComponent, LandingPagesService, SeoService, SharedService, SlidesService } from '@sifca-monorepo/clients';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { LandingPageTypeEnum } from '@sifca-monorepo/ecommerce-generator';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
  animations: fadeAnimations,
})
export class PrivacyPolicyComponent extends BasePageComponent {
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
      LandingPageTypeEnum.PRIVACY,
    );
  }
  navs = [
    '1. Introduction',
    '2. Information We Collect',
    '3. How We Use it',
    '4. Sharing Your Information',
    '5. Security of Your Information',
    '6. Your Privacy Rights',
    '6. Contact Us',
  ];

  ngOnInit(): void {}
  activeTab = 0;
  switchTab(tab: number) {
    this.activeTab = tab;
  }
}
