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
    '1. Introduction',
    '2. Intellectual Property Rights',
    '3. Restrictions',
    '4. Your Content',
    '5. No warranties',
    '6. Limitation of liability',
    '7. Indemnification',
    '8. Severability',
    '9. Variation of Terms',
    '10. Entire Agreement',
    '11. Governing Law',
  ];

  ngOnInit(): void {}
  activeTab = 0;
  switchTab(tab: number) {
    this.activeTab = tab;
  }
}
