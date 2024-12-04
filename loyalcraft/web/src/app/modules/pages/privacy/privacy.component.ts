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
  animations: fadeAnimations
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
  navs = ['INTRODUCTION', 'NAV_2_INFORMATION_WE_COLLECT', 'HOW_WE_USE_YOUR_INFORMATION', 'SHARING_YOUR_INFORMATION', 'DATA_SECURITY1', 'USER_RIGHTS', 'DATA_RETENTION','INTERNATIONAL_TRANSFERS','CHILDREN_PRIVACY','CHANGES_TO_POLICY','CONTACT_US1'];

  ngOnInit(): void {}
  activeTab = 0;
  switchTab(tab: number) {
    this.activeTab = tab;
  }
}
