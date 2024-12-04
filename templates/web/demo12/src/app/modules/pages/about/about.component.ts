import { Meta, Title } from '@angular/platform-browser';
import { Component,/*  ChangeDetectionStrategy, Input, */ Renderer2, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';

import { BasePageComponent, LandingPagesService, SeoService, SharedService, SlidesService } from '@sifca-monorepo/clients';
import { LandingPageTypeEnum } from '@sifca-monorepo/ecommerce-generator';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent extends BasePageComponent {

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
      LandingPageTypeEnum.ABOUT,
    );
  }

}
